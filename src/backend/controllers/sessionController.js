const { v4: uuidv4 } = require('uuid');
const { createApiError } = require('../middlewares/errorHandler');
const databaseService = require('../services/databaseService');
const logger = require('../utils/logger');

/**
 * Get all sessions for a user
 */
const getSessions = async (req, res, next) => {
  try {
    // TODO: Add proper authentication and get user ID from JWT
    const userId = req.query.userId || 'demo-user';
    
    const sessionsCollection = databaseService.mongodb.getCollection('sessions');
    
    const filter = { 
      'participants.userId': userId,
      ...(req.query.isActive && { isActive: req.query.isActive === 'true' }),
      ...(req.query.isArchived && { isArchived: req.query.isArchived === 'true' })
    };
    
    const sessions = await sessionsCollection.find(filter)
      .sort({ lastModified: -1 })
      .limit(parseInt(req.query.limit || '20', 10))
      .toArray();
    
    res.status(200).json({
      status: 'success',
      results: sessions.length,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a session by ID
 */
const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Session ID is required'));
    }
    
    const sessionsCollection = databaseService.mongodb.getCollection('sessions');
    const session = await sessionsCollection.findOne({ _id: id });
    
    if (!session) {
      return next(createApiError(404, 'Session not found'));
    }
    
    res.status(200).json({
      status: 'success',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new session
 */
const createSession = async (req, res, next) => {
  try {
    // TODO: Add proper authentication and get user ID from JWT
    const userId = req.body.userId || 'demo-user';
    
    const {
      sessionName,
      settings = {},
      participants = []
    } = req.body;
    
    if (!sessionName) {
      return next(createApiError(400, 'Session name is required'));
    }
    
    // Ensure the creator is in participants
    const userIsParticipant = participants.some(p => p.userId === userId);
    
    if (!userIsParticipant) {
      participants.push({
        userId,
        role: 'GM'
      });
    }
    
    const sessionId = uuidv4();
    const now = new Date();
    
    const newSession = {
      _id: sessionId,
      sessionName,
      createdBy: userId,
      createdAt: now,
      lastModified: now,
      isActive: true,
      isArchived: false,
      settings,
      participants,
      messageHistory: [],
      summaries: [],
      bookmarks: [],
      meta: {}
    };
    
    const sessionsCollection = databaseService.mongodb.getCollection('sessions');
    await sessionsCollection.insertOne(newSession);
    
    // Create initial world state
    const worldStatesCollection = databaseService.mongodb.getCollection('worldStates');
    const initialState = {
      _id: uuidv4(),
      sessionId,
      timestamp: now,
      name: 'Initial State',
      description: 'Starting state of the game world',
      type: 'Initial',
      entities: {
        characters: [],
        locations: [],
        factions: []
      },
      plotPoints: [],
      activeQuests: [],
      meta: {}
    };
    
    await worldStatesCollection.insertOne(initialState);
    
    // Update session with initial state ID
    await sessionsCollection.updateOne(
      { _id: sessionId },
      { $set: { currentStateId: initialState._id } }
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        ...newSession,
        currentStateId: initialState._id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a session
 */
const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Session ID is required'));
    }
    
    const { sessionName, settings, isActive, isArchived } = req.body;
    const updateData = {};
    
    if (sessionName !== undefined) updateData.sessionName = sessionName;
    if (settings !== undefined) updateData.settings = settings;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    
    updateData.lastModified = new Date();
    
    const sessionsCollection = databaseService.mongodb.getCollection('sessions');
    const result = await sessionsCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return next(createApiError(404, 'Session not found'));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        _id: id,
        ...updateData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a session
 */
const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Session ID is required'));
    }
    
    const sessionsCollection = databaseService.mongodb.getCollection('sessions');
    const result = await sessionsCollection.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return next(createApiError(404, 'Session not found'));
    }
    
    // Delete related data
    const messagesCollection = databaseService.mongodb.getCollection('messages');
    await messagesCollection.deleteMany({ sessionId: id });
    
    const worldStatesCollection = databaseService.mongodb.getCollection('worldStates');
    await worldStatesCollection.deleteMany({ sessionId: id });
    
    res.status(200).json({
      status: 'success',
      message: 'Session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages for a session
 */
const getSessionMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Session ID is required'));
    }
    
    const limit = parseInt(req.query.limit || '50', 10);
    const skip = parseInt(req.query.skip || '0', 10);
    
    const messagesCollection = databaseService.mongodb.getCollection('messages');
    const messages = await messagesCollection.find(
      { 
        sessionId: id,
        ...(req.query.type && { type: req.query.type }),
        isHidden: { $ne: true }
      }
    )
      .sort({ timestamp: parseInt(req.query.sort || '-1', 10) })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await messagesCollection.countDocuments({ sessionId: id, isHidden: { $ne: true } });
    
    res.status(200).json({
      status: 'success',
      results: messages.length,
      total,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a message to a session
 */
const addSessionMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Session ID is required'));
    }
    
    const {
      sender,
      content,
      type = 'Dialog',
      attachments = [],
      references = {},
    } = req.body;
    
    if (!sender || !content) {
      return next(createApiError(400, 'Sender and content are required'));
    }
    
    const messagesCollection = databaseService.mongodb.getCollection('messages');
    const messageId = uuidv4();
    const now = new Date();
    
    const newMessage = {
      _id: messageId,
      sessionId: id,
      sender,
      content,
      timestamp: now,
      type,
      attachments,
      references,
      isHidden: false,
      reactions: [],
      meta: {}
    };
    
    await messagesCollection.insertOne(newMessage);
    
    // Update session lastModified time
    const sessionsCollection = databaseService.mongodb.getCollection('sessions');
    await sessionsCollection.updateOne(
      { _id: id },
      { 
        $set: { lastModified: now },
        $push: { messageHistory: messageId }
      }
    );
    
    res.status(201).json({
      status: 'success',
      data: newMessage
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current state for a session
 */
const getSessionState = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Session ID is required'));
    }
    
    const sessionsCollection = databaseService.mongodb.getCollection('sessions');
    const session = await sessionsCollection.findOne({ _id: id }, { projection: { currentStateId: 1 } });
    
    if (!session) {
      return next(createApiError(404, 'Session not found'));
    }
    
    if (!session.currentStateId) {
      return next(createApiError(404, 'No state found for this session'));
    }
    
    const worldStatesCollection = databaseService.mongodb.getCollection('worldStates');
    const state = await worldStatesCollection.findOne({ _id: session.currentStateId });
    
    if (!state) {
      return next(createApiError(404, 'State not found'));
    }
    
    res.status(200).json({
      status: 'success',
      data: state
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new state snapshot for a session
 */
const createSessionState = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Session ID is required'));
    }
    
    const {
      name,
      description,
      type = 'Manual',
      messageId,
      entities = {},
      plotPoints = [],
      activeQuests = [],
      parentStateId,
      branchName,
      meta = {}
    } = req.body;
    
    const sessionsCollection = databaseService.mongodb.getCollection('sessions');
    const session = await sessionsCollection.findOne({ _id: id }, { projection: { currentStateId: 1 } });
    
    if (!session) {
      return next(createApiError(404, 'Session not found'));
    }
    
    const worldStatesCollection = databaseService.mongodb.getCollection('worldStates');
    const stateId = uuidv4();
    const now = new Date();
    
    const newState = {
      _id: stateId,
      sessionId: id,
      timestamp: now,
      name: name || `State ${now.toISOString()}`,
      description: description || 'Manually created state',
      type,
      messageId,
      entities,
      plotPoints,
      activeQuests,
      parentStateId: parentStateId || session.currentStateId,
      branchName,
      meta
    };
    
    await worldStatesCollection.insertOne(newState);
    
    // Update session with new state ID
    await sessionsCollection.updateOne(
      { _id: id },
      { 
        $set: { 
          currentStateId: stateId,
          lastModified: now
        }
      }
    );
    
    res.status(201).json({
      status: 'success',
      data: newState
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getSessionMessages,
  addSessionMessage,
  getSessionState,
  createSessionState
};