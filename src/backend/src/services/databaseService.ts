import { logger } from '../utils/logger';
import neo4jService from './neo4jService';
import mongodbService from './mongodbService';
import weaviateService from './weaviateService';
import localAiService from './localAiService';

/**
 * Manages database connections and provides initialization and shutdown methods
 */
class DatabaseService {
  private initialized: boolean = false;

  /**
   * Initialize all database connections
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing database connections...');

      // Initialize Neo4j
      await neo4jService.initialize();
      logger.info('Neo4j connection initialized');

      // Initialize MongoDB
      await mongodbService.initialize();
      logger.info('MongoDB connection initialized');

      // Initialize Weaviate
      await weaviateService.initialize();
      logger.info('Weaviate connection initialized');

      // Initialize LocalAI service
      await localAiService.initialize();
      logger.info('LocalAI service initialized');

      this.initialized = true;
      logger.info('All database connections initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database connections', { error });
      throw error;
    }
  }

  /**
   * Close all database connections
   */
  async shutdown(): Promise<void> {
    try {
      logger.info('Closing database connections...');

      // Close Neo4j connection
      await neo4jService.close();
      logger.info('Neo4j connection closed');

      // Close MongoDB connection
      await mongodbService.close();
      logger.info('MongoDB connection closed');

      this.initialized = false;
      logger.info('All database connections closed successfully');
    } catch (error) {
      logger.error('Error closing database connections', { error });
      throw error;
    }
  }

  /**
   * Check health of all database connections
   */
  async checkHealth(): Promise<Record<string, any>> {
    const health: Record<string, any> = {
      status: 'ok',
      components: {
        neo4j: { status: 'unknown' },
        mongodb: { status: 'unknown' },
        weaviate: { status: 'unknown' },
        localai: { status: 'unknown' },
      },
    };

    try {
      // Check Neo4j health
      try {
        await neo4jService.verifyConnectivity();
        health.components.neo4j = {
          status: 'ok',
        };
      } catch (error) {
        health.components.neo4j = {
          status: 'error',
          error: (error as Error).message,
        };
        health.status = 'degraded';
      }

      // Check MongoDB health
      try {
        const mongoCheck = await mongodbService.ping();
        health.components.mongodb = {
          status: mongoCheck ? 'ok' : 'error',
        };
        if (!mongoCheck) {
          health.status = 'degraded';
        }
      } catch (error) {
        health.components.mongodb = {
          status: 'error',
          error: (error as Error).message,
        };
        health.status = 'degraded';
      }

      // Check Weaviate health
      try {
        const weaviateCheck = await weaviateService.ping();
        health.components.weaviate = {
          status: weaviateCheck ? 'ok' : 'error',
        };
        if (!weaviateCheck) {
          health.status = 'degraded';
        }
      } catch (error) {
        health.components.weaviate = {
          status: 'error',
          error: (error as Error).message,
        };
        health.status = 'degraded';
      }

      // Check LocalAI health
      try {
        const localaiCheck = await localAiService.checkHealth();
        health.components.localai = {
          status: localaiCheck ? 'ok' : 'error',
        };
        if (!localaiCheck) {
          health.status = 'degraded';
        }
      } catch (error) {
        health.components.localai = {
          status: 'error',
          error: (error as Error).message,
        };
        health.status = 'degraded';
      }

      return health;
    } catch (error) {
      logger.error('Error checking database health', { error });
      return {
        status: 'error',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Check if database connections are initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService;