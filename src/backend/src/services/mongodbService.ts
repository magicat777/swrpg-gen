import { MongoClient, Collection, Db, Document } from 'mongodb';
import { logger } from '../utils/logger';
import { dbMetricsWrapper } from '../middlewares/metricsMiddleware';

/**
 * Manages connections and operations for the MongoDB database
 */
class MongoDBService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly uri: string;
  private readonly dbName: string;
  private readonly maxPoolSize: number;
  private readonly connectTimeoutMS: number;
  private isConnected: boolean = false;

  // Collection names
  private static readonly USERS_COLLECTION = 'users';
  private static readonly SESSIONS_COLLECTION = 'sessions';
  private static readonly MESSAGES_COLLECTION = 'messages';
  private static readonly WORLD_STATES_COLLECTION = 'worldStates';
  private static readonly GENERATED_CONTENT_COLLECTION = 'generatedContent';
  private static readonly RULE_REFERENCES_COLLECTION = 'ruleReferences';
  private static readonly TIMELINE_EVENTS_COLLECTION = 'timelineEvents';
  private static readonly TIMELINE_ERAS_COLLECTION = 'timelineEras';
  
  // Enhanced collections
  private static readonly CHARACTERS_COLLECTION = 'characters';
  private static readonly LOCATIONS_COLLECTION = 'locations';
  private static readonly FACTIONS_COLLECTION = 'factions';
  private static readonly FACTION_RELATIONSHIPS_COLLECTION = 'faction_relationships';
  private static readonly CROSS_REFERENCES_COLLECTION = 'cross_references';

  constructor() {
    this.uri = process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/swrpg?authSource=admin';
    this.dbName = process.env.MONGODB_DATABASE || 'swrpg';
    this.maxPoolSize = Number(process.env.MONGODB_MAX_POOL_SIZE || '50');
    this.connectTimeoutMS = Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || '5000');
  }

  /**
   * Initialize the MongoDB client and connect to the database
   */
  async initialize(): Promise<void> {
    try {
      this.client = new MongoClient(this.uri, {
        maxPoolSize: this.maxPoolSize,
        connectTimeoutMS: this.connectTimeoutMS,
      });
      
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.isConnected = true;
      
      logger.info('Successfully connected to MongoDB database');
    } catch (error) {
      logger.error('Failed to connect to MongoDB database', { error });
      throw error;
    }
  }

  /**
   * Close the MongoDB connection
   */
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        this.isConnected = false;
        logger.info('MongoDB connection closed');
      } catch (error) {
        logger.error('Error closing MongoDB connection', { error });
        throw error;
      }
    }
  }

  /**
   * Get a collection from the database
   */
  getCollection<T extends Document = any>(collectionName: string): Collection<T> {
    if (!this.db) {
      throw new Error('MongoDB not initialized');
    }
    return this.db.collection<T>(collectionName);
  }

  /**
   * Get the users collection
   */
  getUsersCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.USERS_COLLECTION);
  }

  /**
   * Get the sessions collection
   */
  getSessionsCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.SESSIONS_COLLECTION);
  }

  /**
   * Get the messages collection
   */
  getMessagesCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.MESSAGES_COLLECTION);
  }

  /**
   * Get the world states collection
   */
  getWorldStatesCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.WORLD_STATES_COLLECTION);
  }

  /**
   * Get the generated content collection
   */
  getGeneratedContentCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.GENERATED_CONTENT_COLLECTION);
  }

  /**
   * Get the rule references collection
   */
  getRuleReferencesCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.RULE_REFERENCES_COLLECTION);
  }

  /**
   * Get the timeline events collection
   */
  getTimelineEventsCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.TIMELINE_EVENTS_COLLECTION);
  }

  /**
   * Get the timeline eras collection
   */
  getTimelineErasCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.TIMELINE_ERAS_COLLECTION);
  }

  /**
   * Check if the database is connected
   */
  isInitialized(): boolean {
    return this.isConnected;
  }

  /**
   * Ping the database to check connectivity
   */
  async ping(): Promise<boolean> {
    if (!this.db) {
      return false;
    }
    
    try {
      const result = await this.db.command({ ping: 1 });
      return result.ok === 1;
    } catch (error) {
      logger.error('Error pinging MongoDB', { error });
      return false;
    }
  }

  /**
   * Initialize database with indices and validation rules
   */
  async initializeDatabase(): Promise<void> {
    if (!this.db) {
      throw new Error('MongoDB not initialized');
    }

    try {
      // Create indices for better performance
      await this.createIndices();
      
      // Create validation rules
      await this.createValidationRules();
      
      logger.info('MongoDB database initialization completed');
    } catch (error) {
      logger.error('Error initializing MongoDB database', { error });
      throw error;
    }
  }

  /**
   * Create database indices for optimal performance
   */
  private async createIndices(): Promise<void> {
    if (!this.db) return;

    const collections = [
      {
        name: MongoDBService.USERS_COLLECTION,
        indices: [
          { key: { username: 1 }, options: { unique: true } },
          { key: { email: 1 }, options: { unique: true } },
          { key: { createdAt: 1 }, options: {} },
          { key: { lastActive: 1 }, options: {} }
        ]
      },
      {
        name: MongoDBService.SESSIONS_COLLECTION,
        indices: [
          { key: { userId: 1 }, options: {} },
          { key: { createdAt: 1 }, options: {} },
          { key: { lastActivity: 1 }, options: {} },
          { key: { isActive: 1 }, options: {} }
        ]
      },
      {
        name: MongoDBService.MESSAGES_COLLECTION,
        indices: [
          { key: { sessionId: 1 }, options: {} },
          { key: { timestamp: 1 }, options: {} },
          { key: { 'sender.id': 1 }, options: {} },
          { key: { type: 1 }, options: {} }
        ]
      },
      {
        name: MongoDBService.WORLD_STATES_COLLECTION,
        indices: [
          { key: { sessionId: 1 }, options: {} },
          { key: { timestamp: 1 }, options: {} },
          { key: { version: 1 }, options: {} }
        ]
      },
      {
        name: MongoDBService.GENERATED_CONTENT_COLLECTION,
        indices: [
          { key: { type: 1 }, options: {} },
          { key: { createdBy: 1 }, options: {} },
          { key: { createdAt: 1 }, options: {} },
          { key: { tags: 1 }, options: {} },
          { key: { isApproved: 1 }, options: {} }
        ]
      },
      {
        name: MongoDBService.RULE_REFERENCES_COLLECTION,
        indices: [
          { key: { category: 1 }, options: {} },
          { key: { system: 1 }, options: {} },
          { key: { tags: 1 }, options: {} }
        ]
      }
    ];

    for (const collection of collections) {
      const coll = this.db.collection(collection.name);
      for (const { key, options } of collection.indices) {
        try {
          await coll.createIndex(key as any, options);
          logger.debug(`Created index for ${collection.name}`, { key, options });
        } catch (error) {
          logger.warn(`Index creation failed for ${collection.name}`, { error, key });
        }
      }
    }
  }

  /**
   * Create validation rules for collections
   */
  private async createValidationRules(): Promise<void> {
    if (!this.db) return;

    // Users collection validation
    try {
      await this.db.createCollection(MongoDBService.USERS_COLLECTION, {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['username', 'email', 'passwordHash', 'createdAt'],
            properties: {
              username: { bsonType: 'string', minLength: 3, maxLength: 30 },
              email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
              passwordHash: { bsonType: 'string' },
              roles: { bsonType: 'array', items: { bsonType: 'string' } },
              createdAt: { bsonType: 'date' },
              lastActive: { bsonType: 'date' }
            }
          }
        }
      });
    } catch (error) {
      logger.debug('Users collection may already exist with validation');
    }

    // Sessions collection validation
    try {
      await this.db.createCollection(MongoDBService.SESSIONS_COLLECTION, {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['userId', 'title', 'createdAt'],
            properties: {
              userId: { bsonType: 'string' },
              title: { bsonType: 'string', minLength: 1, maxLength: 200 },
              description: { bsonType: 'string' },
              settings: { bsonType: 'object' },
              isActive: { bsonType: 'bool' },
              createdAt: { bsonType: 'date' }
            }
          }
        }
      });
    } catch (error) {
      logger.debug('Sessions collection may already exist with validation');
    }
  }

  // ===================
  // SESSION MANAGEMENT
  // ===================

  /**
   * Create a new game session
   */
  async createSession(sessionData: any): Promise<any> {
    const collection = this.getSessionsCollection();
    const session = {
      ...sessionData,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      messageCount: 0,
      participants: sessionData.participants || [],
      settings: sessionData.settings || {
        era: 'Rebellion Era',
        difficulty: 'moderate',
        theme: 'balanced',
        allowForceUsers: true
      }
    };

    const result = await collection.insertOne(session);
    return { ...session, _id: result.insertedId };
  }

  /**
   * Get sessions for a user
   */
  async getUserSessions(userId: string, limit: number = 20): Promise<any[]> {
    const collection = this.getSessionsCollection();
    const cursor = collection.find({ userId })
      .sort({ lastActivity: -1 })
      .limit(limit);
    
    return await cursor.toArray();
  }

  /**
   * Update session activity and metadata
   */
  async updateSessionActivity(sessionId: string, updates: any = {}): Promise<any> {
    const collection = this.getSessionsCollection();
    const updateData = {
      ...updates,
      lastActivity: new Date()
    };

    const result = await collection.updateOne(
      { _id: sessionId },
      { $set: updateData }
    );

    return result;
  }

  /**
   * Archive a session (set inactive)
   */
  async archiveSession(sessionId: string): Promise<any> {
    const collection = this.getSessionsCollection();
    const result = await collection.updateOne(
      { _id: sessionId },
      { 
        $set: { 
          isActive: false,
          archivedAt: new Date()
        }
      }
    );

    return result;
  }

  // ===================
  // MESSAGE MANAGEMENT
  // ===================

  /**
   * Add a message to a session
   */
  async addMessage(messageData: any): Promise<any> {
    const collection = this.getMessagesCollection();
    const message = {
      ...messageData,
      timestamp: new Date(),
      reactions: [],
      isHidden: false,
      references: messageData.references || {},
      attachments: messageData.attachments || []
    };

    const result = await collection.insertOne(message);
    
    // Update session activity and message count
    await this.updateSessionActivity(messageData.sessionId, {
      $inc: { messageCount: 1 }
    });

    return { ...message, _id: result.insertedId };
  }

  /**
   * Get messages for a session
   */
  async getSessionMessages(sessionId: string, limit: number = 100, offset: number = 0): Promise<any[]> {
    const collection = this.getMessagesCollection();
    const cursor = collection.find({ sessionId })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit);

    return await cursor.toArray();
  }

  /**
   * Search messages by content
   */
  async searchMessages(sessionId: string, query: string, limit: number = 20): Promise<any[]> {
    const collection = this.getMessagesCollection();
    const cursor = collection.find({
      sessionId,
      $text: { $search: query }
    })
    .sort({ timestamp: -1 })
    .limit(limit);

    return await cursor.toArray();
  }

  /**
   * Update message (for editing)
   */
  async updateMessage(messageId: string, updates: any): Promise<any> {
    const collection = this.getMessagesCollection();
    const result = await collection.updateOne(
      { _id: messageId },
      { 
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    return result;
  }

  // ===================
  // WORLD STATE MANAGEMENT
  // ===================

  /**
   * Create a world state snapshot
   */
  async createWorldStateSnapshot(snapshotData: any): Promise<any> {
    const collection = this.getWorldStatesCollection();
    const snapshot = {
      ...snapshotData,
      timestamp: new Date(),
      version: snapshotData.version || 1,
      changes: snapshotData.changes || [],
      metadata: snapshotData.metadata || {}
    };

    const result = await collection.insertOne(snapshot);
    return { ...snapshot, _id: result.insertedId };
  }

  /**
   * Get latest world state for a session
   */
  async getLatestWorldState(sessionId: string): Promise<any | null> {
    const collection = this.getWorldStatesCollection();
    const result = await collection.findOne(
      { sessionId },
      { sort: { timestamp: -1 } }
    );

    return result;
  }

  /**
   * Get world state history for a session
   */
  async getWorldStateHistory(sessionId: string, limit: number = 10): Promise<any[]> {
    const collection = this.getWorldStatesCollection();
    const cursor = collection.find({ sessionId })
      .sort({ timestamp: -1 })
      .limit(limit);

    return await cursor.toArray();
  }

  /**
   * Compare two world states
   */
  async compareWorldStates(stateId1: string, stateId2: string): Promise<any> {
    const collection = this.getWorldStatesCollection();
    const states = await collection.find({
      _id: { $in: [stateId1, stateId2] }
    }).toArray();

    if (states.length !== 2) {
      throw new Error('Could not find both world states for comparison');
    }

    // Simple comparison logic - can be enhanced
    const [state1, state2] = states;
    const differences = {
      characters: this.compareObjects(state1.characters || {}, state2.characters || {}),
      locations: this.compareObjects(state1.locations || {}, state2.locations || {}),
      factions: this.compareObjects(state1.factions || {}, state2.factions || {}),
      events: this.compareArrays(state1.events || [], state2.events || [])
    };

    return differences;
  }

  /**
   * Helper method to compare objects
   */
  private compareObjects(obj1: any, obj2: any): any {
    const differences: any = {};
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    for (const key of allKeys) {
      if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        differences[key] = {
          old: obj1[key],
          new: obj2[key]
        };
      }
    }

    return differences;
  }

  /**
   * Helper method to compare arrays
   */
  private compareArrays(arr1: any[], arr2: any[]): any {
    const added = arr2.filter(item => !arr1.some(existing => existing.id === item.id));
    const removed = arr1.filter(item => !arr2.some(existing => existing.id === item.id));
    
    return { added, removed };
  }

  // ===================
  // USER DATA MANAGEMENT
  // ===================

  /**
   * Create user preferences
   */
  async updateUserPreferences(userId: string, preferences: any): Promise<any> {
    const collection = this.getUsersCollection();
    const result = await collection.updateOne(
      { _id: userId },
      { 
        $set: { 
          preferences: preferences,
          updatedAt: new Date()
        }
      }
    );

    return result;
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId: string): Promise<any> {
    const [sessionStats, messageStats, contentStats] = await Promise.all([
      // Session statistics
      this.getSessionsCollection().aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            activeSessions: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
            totalMessages: { $sum: '$messageCount' }
          }
        }
      ]).toArray(),

      // Recent message activity
      this.getMessagesCollection().aggregate([
        { 
          $match: { 
            'sender.id': userId,
            timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            messageCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray(),

      // Generated content statistics
      this.getGeneratedContentCollection().aggregate([
        { $match: { createdBy: userId } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]).toArray()
    ]);

    return {
      sessions: sessionStats[0] || { totalSessions: 0, activeSessions: 0, totalMessages: 0 },
      recentActivity: messageStats,
      generatedContent: contentStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
  }

  // ===================
  // GENERATED CONTENT MANAGEMENT
  // ===================

  /**
   * Store generated content with metadata
   */
  async storeGeneratedContent(contentData: any): Promise<any> {
    const collection = this.getGeneratedContentCollection();
    const content = {
      ...contentData,
      createdAt: new Date(),
      isApproved: false,
      usageCount: 0,
      rating: null,
      tags: contentData.tags || [],
      references: contentData.references || {}
    };

    const result = await collection.insertOne(content);
    return { ...content, _id: result.insertedId };
  }

  /**
   * Get generated content by type
   */
  async getGeneratedContentByType(type: string, limit: number = 20): Promise<any[]> {
    const collection = this.getGeneratedContentCollection();
    const cursor = collection.find({ type })
      .sort({ createdAt: -1 })
      .limit(limit);

    return await cursor.toArray();
  }

  /**
   * Get user's generated content
   */
  async getUserGeneratedContent(userId: string, limit: number = 50): Promise<any[]> {
    const collection = this.getGeneratedContentCollection();
    const cursor = collection.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return await cursor.toArray();
  }

  /**
   * Update content usage and rating
   */
  async updateContentUsage(contentId: string, rating?: number): Promise<any> {
    const collection = this.getGeneratedContentCollection();
    const updates: any = {
      $inc: { usageCount: 1 },
      $set: { lastUsed: new Date() }
    };

    if (rating !== undefined) {
      updates.$set.rating = rating;
    }

    const result = await collection.updateOne(
      { _id: contentId },
      updates
    );

    return result;
  }

  /**
   * Enhanced Collections Methods
   */

  /**
   * Get the enhanced characters collection
   */
  getCharactersCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.CHARACTERS_COLLECTION);
  }

  /**
   * Get the enhanced locations collection
   */
  getLocationsCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.LOCATIONS_COLLECTION);
  }

  /**
   * Get the factions collection
   */
  getFactionsCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.FACTIONS_COLLECTION);
  }

  /**
   * Get the faction relationships collection
   */
  getFactionRelationshipsCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.FACTION_RELATIONSHIPS_COLLECTION);
  }

  /**
   * Get the cross references collection
   */
  getCrossReferencesCollection<T extends Document = any>(): Collection<T> {
    return this.getCollection<T>(MongoDBService.CROSS_REFERENCES_COLLECTION);
  }

  /**
   * Find enhanced characters with filtering and pagination
   */
  async findEnhancedCharacters(filters: any = {}, options: any = {}): Promise<any[]> {
    try {
      const collection = this.getCharactersCollection();
      const query: any = {};

      // Build query filters
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { species: { $regex: filters.search, $options: 'i' } }
        ];
      }

      if (filters.species) {
        query.species = { $regex: filters.species, $options: 'i' };
      }

      if (filters.affiliation) {
        query.affiliation = { $regex: filters.affiliation, $options: 'i' };
      }

      if (filters.force_sensitivity) {
        query['abilities.force_sensitivity'] = filters.force_sensitivity;
      }

      // Apply pagination and sorting
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      const results = await collection
        .find(query)
        .sort({ name: 1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return results;
    } catch (error) {
      logger.error('Error finding enhanced characters', { error, filters, options });
      throw error;
    }
  }

  /**
   * Find enhanced character by ID
   */
  async findEnhancedCharacterById(id: string): Promise<any | null> {
    try {
      const collection = this.getCharactersCollection();
      const character = await collection.findOne({
        $or: [
          { 'basic_info.id': id },
          { id: id },
          { name: id }
        ]
      });

      return character;
    } catch (error) {
      logger.error('Error finding enhanced character by ID', { error, id });
      throw error;
    }
  }

  /**
   * Find enhanced locations with filtering and pagination
   */
  async findEnhancedLocations(filters: any = {}, options: any = {}): Promise<any[]> {
    try {
      const collection = this.getLocationsCollection();
      const query: any = {};

      // Build query filters
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { region: { $regex: filters.search, $options: 'i' } }
        ];
      }

      if (filters.region) {
        query.region = { $regex: filters.region, $options: 'i' };
      }

      if (filters.climate) {
        query.climate = { $regex: filters.climate, $options: 'i' };
      }

      if (filters.system) {
        query.system = { $regex: filters.system, $options: 'i' };
      }

      // Apply pagination and sorting
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      const results = await collection
        .find(query)
        .sort({ name: 1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return results;
    } catch (error) {
      logger.error('Error finding enhanced locations', { error, filters, options });
      throw error;
    }
  }

  /**
   * Find enhanced location by ID
   */
  async findEnhancedLocationById(id: string): Promise<any | null> {
    try {
      const collection = this.getLocationsCollection();
      const location = await collection.findOne({
        $or: [
          { 'basic_info.id': id },
          { id: id },
          { name: id }
        ]
      });

      return location;
    } catch (error) {
      logger.error('Error finding enhanced location by ID', { error, id });
      throw error;
    }
  }

  /**
   * Find faction relationships
   */
  async findFactionRelationships(factionId?: string): Promise<any[]> {
    try {
      const collection = this.getFactionRelationshipsCollection();
      const query = factionId ? { faction_id: factionId } : {};
      
      const results = await collection
        .find(query)
        .sort({ faction_name: 1 })
        .toArray();

      return results;
    } catch (error) {
      logger.error('Error finding faction relationships', { error, factionId });
      throw error;
    }
  }

  /**
   * Get total count for enhanced characters
   */
  async getEnhancedCharacterCount(filters: any = {}): Promise<number> {
    try {
      const collection = this.getCharactersCollection();
      const query: any = {};

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { species: { $regex: filters.search, $options: 'i' } }
        ];
      }

      if (filters.species) {
        query.species = { $regex: filters.species, $options: 'i' };
      }

      if (filters.affiliation) {
        query.affiliation = { $regex: filters.affiliation, $options: 'i' };
      }

      return await collection.countDocuments(query);
    } catch (error) {
      logger.error('Error getting enhanced character count', { error, filters });
      throw error;
    }
  }

  /**
   * Get total count for enhanced locations
   */
  async getEnhancedLocationCount(filters: any = {}): Promise<number> {
    try {
      const collection = this.getLocationsCollection();
      const query: any = {};

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { region: { $regex: filters.search, $options: 'i' } }
        ];
      }

      if (filters.region) {
        query.region = { $regex: filters.region, $options: 'i' };
      }

      if (filters.climate) {
        query.climate = { $regex: filters.climate, $options: 'i' };
      }

      return await collection.countDocuments(query);
    } catch (error) {
      logger.error('Error getting enhanced location count', { error, filters });
      throw error;
    }
  }

  /**
   * Enhanced find operation with metrics
   */
  async findWithMetrics<T extends Document = any>(
    collectionName: string,
    filter: any,
    options?: any
  ): Promise<T[]> {
    return dbMetricsWrapper('mongodb', 'find', collectionName)(async () => {
      const collection = this.getCollection<T>(collectionName);
      return await collection.find(filter, options).toArray() as T[];
    }) as Promise<T[]>;
  }

  /**
   * Enhanced findOne operation with metrics
   */
  async findOneWithMetrics<T extends Document = any>(
    collectionName: string,
    filter: any,
    options?: any
  ): Promise<T | null> {
    return dbMetricsWrapper('mongodb', 'findOne', collectionName)(async () => {
      const collection = this.getCollection<T>(collectionName);
      return await collection.findOne(filter, options) as T | null;
    }) as Promise<T | null>;
  }

  /**
   * Enhanced insertOne operation with metrics
   */
  async insertOneWithMetrics<T extends Document = any>(
    collectionName: string,
    document: any
  ): Promise<any> {
    return dbMetricsWrapper('mongodb', 'insertOne', collectionName)(async () => {
      const collection = this.getCollection<T>(collectionName);
      return await collection.insertOne(document);
    });
  }

  /**
   * Enhanced updateOne operation with metrics
   */
  async updateOneWithMetrics<T extends Document = any>(
    collectionName: string,
    filter: any,
    update: any,
    options?: any
  ): Promise<any> {
    return dbMetricsWrapper('mongodb', 'updateOne', collectionName)(async () => {
      const collection = this.getCollection<T>(collectionName);
      return await collection.updateOne(filter, update, options);
    });
  }

  /**
   * Enhanced deleteOne operation with metrics
   */
  async deleteOneWithMetrics<T extends Document = any>(
    collectionName: string,
    filter: any
  ): Promise<any> {
    return dbMetricsWrapper('mongodb', 'deleteOne', collectionName)(async () => {
      const collection = this.getCollection<T>(collectionName);
      return await collection.deleteOne(filter);
    });
  }

  /**
   * Enhanced aggregate operation with metrics
   */
  async aggregateWithMetrics<T extends Document = any>(
    collectionName: string,
    pipeline: any[],
    options?: any
  ): Promise<T[]> {
    return dbMetricsWrapper('mongodb', 'aggregate', collectionName)(async () => {
      const collection = this.getCollection<T>(collectionName);
      return await collection.aggregate(pipeline, options).toArray() as T[];
    }) as Promise<T[]>;
  }

  /**
   * Enhanced count operation with metrics
   */
  async countWithMetrics(
    collectionName: string,
    filter: any = {}
  ): Promise<number> {
    return dbMetricsWrapper('mongodb', 'count', collectionName)(async () => {
      const collection = this.getCollection(collectionName);
      return await collection.countDocuments(filter) as number;
    }) as Promise<number>;
  }

  /**
   * Get connection pool stats
   */
  getConnectionStats() {
    if (!this.client) {
      return null;
    }
    
    // MongoDB driver doesn't expose pool stats directly in newer versions
    // This is a placeholder for monitoring connection health
    return {
      isConnected: this.isConnected,
      serverInfo: this.client.options
    };
  }
}

// Create singleton instance
const mongodbService = new MongoDBService();

export default mongodbService;