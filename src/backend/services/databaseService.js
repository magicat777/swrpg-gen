const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');
const weaviate = require('weaviate-ts-client');
const logger = require('../utils/logger');

/**
 * MongoDB Service
 */
class MongoDBService {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URL || 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin';
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db('swrpg');
      logger.info('Connected to MongoDB');
      
      // Initialize database schema
      await this.initializeDatabase();
      
      return this.db;
    } catch (error) {
      logger.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async createIndexSafely(collectionName, indexSpec, options = {}) {
    try {
      await this.db.collection(collectionName).createIndex(indexSpec, options);
      logger.info(`Created index on ${collectionName}: ${JSON.stringify(indexSpec)}`);
    } catch (error) {
      if (error.code === 85 || error.message.includes('already exists')) {
        logger.info(`Index already exists on ${collectionName}: ${JSON.stringify(indexSpec)}`);
      } else {
        logger.warn(`Index creation warning on ${collectionName}: ${error.message}`);
      }
    }
  }

  async initializeDatabase() {
    try {
      logger.info('Initializing MongoDB database schema...');
      
      // Create collections and indices
      const collections = ['sessions', 'messages', 'worldStates', 'users', 'generatedContent'];
      
      for (const collectionName of collections) {
        try {
          await this.db.createCollection(collectionName);
          logger.info(`Created collection: ${collectionName}`);
        } catch (error) {
          if (error.code !== 48) { // Collection already exists
            throw error;
          }
        }
      }

      // Create indices for sessions
      await this.createIndexSafely('sessions', { sessionId: 1 }, { unique: true });
      await this.createIndexSafely('sessions', { userId: 1 });
      await this.createIndexSafely('sessions', { createdAt: 1 });
      await this.createIndexSafely('sessions', { isActive: 1 });

      // Create indices for messages
      await this.createIndexSafely('messages', { sessionId: 1 });
      await this.createIndexSafely('messages', { timestamp: 1 });
      await this.createIndexSafely('messages', { sender: 1 });

      // Create indices for world states
      await this.createIndexSafely('worldStates', { sessionId: 1 });
      await this.createIndexSafely('worldStates', { timestamp: 1 });

      // Create indices for users
      await this.createIndexSafely('users', { userId: 1 }, { unique: true });
      await this.createIndexSafely('users', { email: 1 }, { unique: true, sparse: true });

      // Create indices for generated content
      await this.createIndexSafely('generatedContent', { contentType: 1 });
      await this.createIndexSafely('generatedContent', { sessionId: 1 });
      await this.createIndexSafely('generatedContent', { createdAt: 1 });

      logger.info('MongoDB database schema initialized successfully');
    } catch (error) {
      logger.error('MongoDB schema initialization error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      logger.info('Disconnected from MongoDB');
    }
  }

  getCollection(collectionName) {
    if (!this.db) {
      throw new Error('MongoDB not connected');
    }
    return this.db.collection(collectionName);
  }
}

/**
 * Neo4j Service
 */
class Neo4jService {
  constructor() {
    this.driver = null;
  }

  async connect() {
    try {
      const uri = process.env.NEO4J_URL || 'bolt://localhost:7687';
      const auth = neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'password'
      );
      
      this.driver = neo4j.driver(uri, auth, {
        maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 30 * 1000, // 30 seconds
      });
      
      // Verify connection
      const serverInfo = await this.driver.verifyConnectivity();
      logger.info(`Connected to Neo4j ${serverInfo.version}`);
      
      // Initialize schema
      await this.initializeSchema();
      
      return this.driver;
    } catch (error) {
      logger.error('Neo4j connection error:', error);
      throw error;
    }
  }

  async initializeSchema() {
    try {
      logger.info('Initializing Neo4j schema...');
      
      const constraints = [
        'CREATE CONSTRAINT character_name IF NOT EXISTS FOR (c:Character) REQUIRE c.name IS UNIQUE',
        'CREATE CONSTRAINT location_name IF NOT EXISTS FOR (l:Location) REQUIRE l.name IS UNIQUE',
        'CREATE CONSTRAINT faction_name IF NOT EXISTS FOR (f:Faction) REQUIRE f.name IS UNIQUE',
        'CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE',
        'CREATE CONSTRAINT world_state_id IF NOT EXISTS FOR (w:WorldState) REQUIRE w.id IS UNIQUE'
      ];

      const indices = [
        'CREATE INDEX character_species IF NOT EXISTS FOR (c:Character) ON (c.species)',
        'CREATE INDEX character_affiliation IF NOT EXISTS FOR (c:Character) ON (c.affiliation)',
        'CREATE INDEX location_type IF NOT EXISTS FOR (l:Location) ON (l.type)',
        'CREATE INDEX location_system IF NOT EXISTS FOR (l:Location) ON (l.system)',
        'CREATE INDEX faction_type IF NOT EXISTS FOR (f:Faction) ON (f.type)',
        'CREATE INDEX event_type IF NOT EXISTS FOR (e:Event) ON (e.type)',
        'CREATE INDEX event_timestamp IF NOT EXISTS FOR (e:Event) ON (e.timestamp)'
      ];

      // Create constraints
      for (const constraint of constraints) {
        try {
          await this.runQuery(constraint);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            logger.warn(`Constraint creation warning: ${error.message}`);
          }
        }
      }

      // Create indices
      for (const index of indices) {
        try {
          await this.runQuery(index);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            logger.warn(`Index creation warning: ${error.message}`);
          }
        }
      }

      logger.info('Neo4j schema initialized successfully');
    } catch (error) {
      logger.error('Neo4j schema initialization error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      logger.info('Disconnected from Neo4j');
    }
  }

  async runQuery(cypher, params = {}) {
    if (!this.driver) {
      throw new Error('Neo4j not connected');
    }
    
    const session = this.driver.session();
    try {
      const result = await session.run(cypher, params);
      return result.records;
    } finally {
      await session.close();
    }
  }
}

/**
 * Weaviate Service
 */
class WeaviateService {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      const url = process.env.WEAVIATE_URL || 'http://localhost:8080';
      
      this.client = weaviate.default.client({
        scheme: url.startsWith('https') ? 'https' : 'http',
        host: url.replace(/^https?:\/\//, ''),
      });
      
      // Verify connection
      const meta = await this.client.misc.metaGetter().do();
      logger.info(`Connected to Weaviate ${meta.version}`);
      
      // Initialize schema
      await this.initializeSchema();
      
      return this.client;
    } catch (error) {
      logger.error('Weaviate connection error:', error);
      throw error;
    }
  }

  async initializeSchema() {
    try {
      logger.info('Initializing Weaviate schema...');
      
      const classes = [
        {
          class: 'StoryEvent',
          description: 'A story event or plot point in the Star Wars universe',
          properties: [
            { name: 'title', dataType: ['text'], description: 'Title of the story event' },
            { name: 'description', dataType: ['text'], description: 'Detailed description of the event' },
            { name: 'eventType', dataType: ['string'], description: 'Type of event (battle, dialogue, discovery, etc.)' },
            { name: 'characters', dataType: ['string[]'], description: 'Characters involved in the event' },
            { name: 'location', dataType: ['string'], description: 'Location where the event occurs' },
            { name: 'timestamp', dataType: ['string'], description: 'When the event occurs in the story' },
            { name: 'importance', dataType: ['int'], description: 'Importance level (1-10)' }
          ],
          vectorizer: 'none'
        },
        {
          class: 'WorldKnowledge',
          description: 'Knowledge about the Star Wars universe',
          properties: [
            { name: 'topic', dataType: ['string'], description: 'Topic or subject of the knowledge' },
            { name: 'content', dataType: ['text'], description: 'The actual knowledge content' },
            { name: 'category', dataType: ['string'], description: 'Category (lore, technology, species, etc.)' },
            { name: 'era', dataType: ['string'], description: 'Star Wars era this knowledge belongs to' },
            { name: 'reliability', dataType: ['number'], description: 'Reliability score (0-1)' },
            { name: 'sources', dataType: ['string[]'], description: 'Sources of this knowledge' }
          ],
          vectorizer: 'none'
        },
        {
          class: 'NarrativeElement',
          description: 'Narrative elements and story components',
          properties: [
            { name: 'elementType', dataType: ['string'], description: 'Type of narrative element' },
            { name: 'content', dataType: ['text'], description: 'Content of the narrative element' },
            { name: 'mood', dataType: ['string'], description: 'Mood or tone of the element' },
            { name: 'themes', dataType: ['string[]'], description: 'Associated themes' },
            { name: 'usageCount', dataType: ['int'], description: 'How often this element has been used' }
          ],
          vectorizer: 'none'
        }
      ];

      // Check existing classes and create if they don't exist
      const existingClasses = await this.client.schema.getter().do();
      const existingClassNames = existingClasses.classes?.map(c => c.class) || [];

      for (const classSchema of classes) {
        if (!existingClassNames.includes(classSchema.class)) {
          await this.client.schema.classCreator().withClass(classSchema).do();
          logger.info(`Created Weaviate class: ${classSchema.class}`);
        } else {
          logger.info(`Weaviate class already exists: ${classSchema.class}`);
        }
      }

      logger.info('Weaviate schema initialized successfully');
    } catch (error) {
      logger.error('Weaviate schema initialization error:', error);
      throw error;
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Weaviate not connected');
    }
    return this.client;
  }
}

/**
 * Database Service Singleton
 */
class DatabaseService {
  constructor() {
    this.mongodb = new MongoDBService();
    this.neo4j = new Neo4jService();
    this.weaviate = new WeaviateService();
  }

  async connectAll() {
    try {
      logger.info('Connecting to databases...');
      await Promise.all([
        this.mongodb.connect(),
        this.neo4j.connect(),
        this.weaviate.connect(),
      ]);
      logger.info('All database connections established and schemas initialized');
      return true;
    } catch (error) {
      logger.error('Database connection error:', error);
      throw error;
    }
  }

  async disconnectAll() {
    try {
      logger.info('Disconnecting from databases...');
      await Promise.all([
        this.mongodb.disconnect(),
        this.neo4j.disconnect(),
      ]);
      logger.info('All database connections closed');
      return true;
    } catch (error) {
      logger.error('Database disconnection error:', error);
      throw error;
    }
  }

  async initializeAllSchemas() {
    try {
      logger.info('Initializing all database schemas...');
      await Promise.all([
        this.mongodb.initializeDatabase(),
        this.neo4j.initializeSchema(),
        this.weaviate.initializeSchema(),
      ]);
      logger.info('All database schemas initialized successfully');
      return true;
    } catch (error) {
      logger.error('Schema initialization error:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const databaseService = new DatabaseService();
module.exports = databaseService;