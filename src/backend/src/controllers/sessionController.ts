import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import { logger } from '../utils/logger';
import mongodbService from '../services/mongodbService';

interface Session {
  _id?: string;
  sessionId: string;
  userId: string;
  campaignName: string;
  description?: string;
  setting: {
    era: string;
    startingLocation: string;
  };
  campaignSettings: {
    playerCount: number;
    difficulty: string;
    campaignLength: string;
  };
  toneStyle: {
    themes: string[];
  };
  advancedOptions: {
    aiFeatures: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface Message {
  _id?: string;
  sessionId: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  sender?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export class SessionController {
  /**
   * Create a new session
   */
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'anonymous';
      const {
        campaignName,
        description,
        setting,
        campaignSettings,
        toneStyle,
        advancedOptions
      } = req.body;

      // Create session object
      // Generate unique session ID
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newSession: Session = {
        sessionId,
        userId,
        campaignName,
        description,
        setting: {
          era: setting?.era || 'Original Trilogy',
          startingLocation: setting?.startingLocation || 'Tatooine'
        },
        campaignSettings: {
          playerCount: campaignSettings?.playerCount || 4,
          difficulty: campaignSettings?.difficulty || 'normal',
          campaignLength: campaignSettings?.campaignLength || 'medium'
        },
        toneStyle: {
          themes: toneStyle?.themes || []
        },
        advancedOptions: {
          aiFeatures: advancedOptions?.aiFeatures !== false
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      // Save to MongoDB
      const sessionsCollection = mongodbService.getSessionsCollection();
      const result = await sessionsCollection.insertOne(newSession);

      const createdSession = {
        ...newSession,
        _id: result.insertedId.toString()
      };

      logger.info(`Session created: ${result.insertedId}`, {
        userId,
        campaignName,
        sessionId: result.insertedId
      });

      res.status(201).json({
        success: true,
        data: createdSession,
        message: 'Session created successfully'
      });

    } catch (error) {
      logger.error('Error creating session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create session'
      });
    }
  }

  /**
   * Get all sessions for the current user
   */
  async getSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'anonymous';

      const sessionsCollection = mongodbService.getSessionsCollection();
      
      const sessions = await sessionsCollection
        .find({ userId, isActive: true })
        .sort({ updatedAt: -1 })
        .toArray();

      const formattedSessions = sessions.map((session: any) => ({
        ...session,
        _id: session._id.toString()
      }));

      res.json({
        success: true,
        data: formattedSessions
      });

    } catch (error) {
      logger.error('Error getting sessions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sessions'
      });
    }
  }

  /**
   * Get a specific session by ID
   */
  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id || 'anonymous';

      // Validate ObjectId format
      if (!ObjectId.isValid(sessionId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid session ID format'
        });
        return;
      }

      const sessionsCollection = mongodbService.getSessionsCollection();
      
      const session = await sessionsCollection.findOne({
        _id: new ObjectId(sessionId),
        userId,
        isActive: true
      });

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      const formattedSession = {
        ...session,
        _id: session._id.toString()
      };

      res.json({
        success: true,
        data: formattedSession
      });

    } catch (error) {
      logger.error('Error getting session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get session'
      });
    }
  }

  /**
   * Update a session
   */
  async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id || 'anonymous';
      const updates = req.body;

      // Validate ObjectId format
      if (!ObjectId.isValid(sessionId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid session ID format'
        });
        return;
      }

      // Remove fields that shouldn't be updated directly
      delete updates._id;
      delete updates.userId;
      delete updates.createdAt;
      
      // Add updatedAt timestamp
      updates.updatedAt = new Date();

      const sessionsCollection = mongodbService.getSessionsCollection();
      
      const result = await sessionsCollection.findOneAndUpdate(
        { _id: new ObjectId(sessionId), userId, isActive: true },
        { $set: updates },
        { returnDocument: 'after' }
      );

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      const updatedSession = {
        ...result,
        _id: result._id.toString()
      };

      logger.info(`Session updated: ${sessionId}`, {
        userId,
        sessionId,
        updates: Object.keys(updates)
      });

      res.json({
        success: true,
        data: updatedSession,
        message: 'Session updated successfully'
      });

    } catch (error) {
      logger.error('Error updating session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update session'
      });
    }
  }

  /**
   * Delete a session (soft delete)
   */
  async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id || 'anonymous';

      // Validate ObjectId format
      if (!ObjectId.isValid(sessionId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid session ID format'
        });
        return;
      }

      const sessionsCollection = mongodbService.getSessionsCollection();
      
      const result = await sessionsCollection.findOneAndUpdate(
        { _id: new ObjectId(sessionId), userId, isActive: true },
        { 
          $set: { 
            isActive: false,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      logger.info(`Session deleted: ${sessionId}`, {
        userId,
        sessionId
      });

      res.json({
        success: true,
        message: 'Session deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete session'
      });
    }
  }

  /**
   * Get messages for a session
   */
  async getSessionMessages(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { limit = 50, offset = 0, type } = req.query;

      const messagesCollection = mongodbService.getMessagesCollection();
      
      const query: any = { sessionId };
      if (type && typeof type === 'string') {
        query.type = type;
      }

      const messages = await messagesCollection
        .find(query)
        .sort({ timestamp: -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .toArray();

      const formattedMessages = messages.map((message: any) => ({
        ...message,
        _id: message._id.toString()
      }));

      res.json({
        success: true,
        data: formattedMessages.reverse() // Return in chronological order
      });

    } catch (error) {
      logger.error('Error getting session messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get session messages'
      });
    }
  }

  /**
   * Add a message to a session
   */
  async addMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { type, content, sender, metadata } = req.body;

      const newMessage: Message = {
        sessionId,
        type,
        content,
        sender,
        metadata: metadata || {},
        timestamp: new Date()
      };

      const messagesCollection = mongodbService.getMessagesCollection();
      const result = await messagesCollection.insertOne(newMessage);

      // Update session's last activity
      const sessionsCollection = mongodbService.getSessionsCollection();
      await sessionsCollection.updateOne(
        { _id: sessionId },
        { $set: { updatedAt: new Date() } }
      );

      const createdMessage = {
        ...newMessage,
        _id: result.insertedId.toString()
      };

      logger.info(`Message added to session: ${sessionId}`, {
        messageId: result.insertedId,
        type,
        sessionId
      });

      res.status(201).json({
        success: true,
        data: createdMessage,
        message: 'Message added successfully'
      });

    } catch (error) {
      logger.error('Error adding message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add message'
      });
    }
  }

  /**
   * Search messages within a session
   */
  async searchMessages(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { q: query, limit = 20, type } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
        return;
      }

      const messagesCollection = mongodbService.getMessagesCollection();
      
      const searchQuery: any = { 
        sessionId,
        content: { $regex: query, $options: 'i' }
      };
      
      if (type && typeof type === 'string') {
        searchQuery.type = type;
      }

      const messages = await messagesCollection
        .find(searchQuery)
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .toArray();

      const formattedMessages = messages.map((message: any) => ({
        ...message,
        _id: message._id.toString()
      }));

      res.json({
        success: true,
        data: formattedMessages
      });

    } catch (error) {
      logger.error('Error searching messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search messages'
      });
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const sessionsCollection = mongodbService.getSessionsCollection();
      const messagesCollection = mongodbService.getMessagesCollection();

      // Get session info
      const session = await sessionsCollection.findOne({ _id: sessionId });
      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      // Get message count
      const messageCount = await messagesCollection.countDocuments({ sessionId });

      // Get character count (approximate from messages mentioning characters)
      const characterMentions = await messagesCollection.aggregate([
        { $match: { sessionId } },
        { $group: { _id: null, content: { $push: '$content' } } }
      ]).toArray();

      let characterCount = 0;
      let locationCount = 0;
      let totalTokens = 0;

      if (characterMentions.length > 0) {
        const allContent = characterMentions[0].content.join(' ');
        totalTokens = Math.floor(allContent.length / 4); // Rough token estimate
        
        // Simple character/location detection (could be enhanced with NER)
        const commonCharacters = ['Luke', 'Leia', 'Han', 'Vader', 'Obi-Wan', 'Yoda'];
        characterCount = commonCharacters.filter(char => 
          allContent.toLowerCase().includes(char.toLowerCase())
        ).length;

        const commonLocations = ['Tatooine', 'Coruscant', 'Dagobah', 'Hoth', 'Endor'];
        locationCount = commonLocations.filter(loc => 
          allContent.toLowerCase().includes(loc.toLowerCase())
        ).length;
      }

      const stats = {
        messageCount,
        characterCount,
        locationCount,
        totalTokens,
        lastActivity: session.updatedAt.toISOString()
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Error getting session stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get session statistics'
      });
    }
  }
}

export default new SessionController();