#!/usr/bin/env node

/**
 * Star Wars Lore Data Validation Script
 * Validates imported lore data for consistency and completeness
 */

const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');

// Configuration
const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin',
    database: 'swrpg'
  },
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password'
  }
};

const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  report: (msg) => console.log(`[REPORT] ${msg}`)
};

class LoreDataValidator {
  constructor() {
    this.mongoClient = null;
    this.neo4jDriver = null;
    this.validationResults = {
      mongodb: {
        collections: {},
        issues: [],
        totalDocuments: 0
      },
      neo4j: {
        nodes: {},
        relationships: {},
        issues: [],
        totalNodes: 0,
        totalRelationships: 0
      }
    };
  }

  async initialize() {
    try {
      // Connect to MongoDB
      this.mongoClient = new MongoClient(config.mongodb.uri);
      await this.mongoClient.connect();
      log.success('Connected to MongoDB');

      // Connect to Neo4j
      this.neo4jDriver = neo4j.driver(
        config.neo4j.uri,
        neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
      );
      await this.neo4jDriver.verifyConnectivity();
      log.success('Connected to Neo4j');

    } catch (error) {
      log.error(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  async validateMongoDB() {
    const db = this.mongoClient.db(config.mongodb.database);
    log.info('Validating MongoDB lore data...');

    // Expected collections
    const expectedCollections = [
      'force_lore',
      'characters',
      'locations',
      'timeline_events',
      'factions'
    ];

    for (const collectionName of expectedCollections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        const sampleDoc = await collection.findOne();
        
        this.validationResults.mongodb.collections[collectionName] = {
          count: count,
          hasData: count > 0,
          sampleFields: sampleDoc ? Object.keys(sampleDoc) : []
        };
        
        this.validationResults.mongodb.totalDocuments += count;
        log.info(`${collectionName}: ${count} documents`);

        // Validate required fields
        await this.validateCollectionStructure(collection, collectionName);

      } catch (error) {
        this.validationResults.mongodb.issues.push(`Collection ${collectionName}: ${error.message}`);
        log.error(`Failed to validate collection ${collectionName}: ${error.message}`);
      }
    }
  }

  async validateCollectionStructure(collection, collectionName) {
    const requiredFields = {
      'force_lore': ['_id', 'type', 'name'],
      'characters': ['_id', 'type', 'category'],
      'locations': ['_id', 'type', 'region'],
      'timeline_events': ['_id', 'type', 'name'],
      'factions': ['_id', 'type', 'category']
    };

    if (!requiredFields[collectionName]) return;

    const missingFields = await collection.findOne({
      $or: requiredFields[collectionName].map(field => ({ [field]: { $exists: false } }))
    });

    if (missingFields) {
      this.validationResults.mongodb.issues.push(
        `Collection ${collectionName} has documents missing required fields`
      );
    }

    // Check for duplicates
    const duplicates = await collection.aggregate([
      { $group: { _id: '$name', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicates.length > 0) {
      this.validationResults.mongodb.issues.push(
        `Collection ${collectionName} has ${duplicates.length} duplicate names`
      );
    }
  }

  async validateNeo4j() {
    const session = this.neo4jDriver.session();
    log.info('Validating Neo4j lore data...');

    try {
      // Count nodes by label
      const nodeLabels = ['Character', 'Location', 'Faction', 'ForceTradition', 'System'];
      
      for (const label of nodeLabels) {
        const result = await session.run(`MATCH (n:${label}) RETURN count(n) as count`);
        const count = result.records[0].get('count').toNumber();
        
        this.validationResults.neo4j.nodes[label] = count;
        this.validationResults.neo4j.totalNodes += count;
        log.info(`${label} nodes: ${count}`);
      }

      // Count relationships by type
      const relationshipTypes = await session.run(`
        CALL db.relationshipTypes() YIELD relationshipType 
        RETURN relationshipType
      `);

      for (const record of relationshipTypes.records) {
        const relType = record.get('relationshipType');
        const result = await session.run(`MATCH ()-[r:${relType}]->() RETURN count(r) as count`);
        const count = result.records[0].get('count').toNumber();
        
        this.validationResults.neo4j.relationships[relType] = count;
        this.validationResults.neo4j.totalRelationships += count;
        log.info(`${relType} relationships: ${count}`);
      }

      // Validate data consistency
      await this.validateNeo4jConsistency(session);

    } catch (error) {
      this.validationResults.neo4j.issues.push(`Neo4j validation error: ${error.message}`);
      log.error(`Neo4j validation failed: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  async validateNeo4jConsistency(session) {
    // Check for orphaned nodes (nodes without any relationships)
    const orphanedNodes = await session.run(`
      MATCH (n) 
      WHERE NOT (n)--() 
      RETURN labels(n) as labels, count(n) as count
    `);

    for (const record of orphanedNodes.records) {
      const labels = record.get('labels');
      const count = record.get('count').toNumber();
      if (count > 0) {
        this.validationResults.neo4j.issues.push(
          `Found ${count} orphaned ${labels.join(':')} nodes`
        );
      }
    }

    // Check for nodes without required properties
    const nodesWithoutNames = await session.run(`
      MATCH (n) 
      WHERE n.name IS NULL OR n.name = '' 
      RETURN labels(n) as labels, count(n) as count
    `);

    for (const record of nodesWithoutNames.records) {
      const labels = record.get('labels');
      const count = record.get('count').toNumber();
      if (count > 0) {
        this.validationResults.neo4j.issues.push(
          `Found ${count} ${labels.join(':')} nodes without names`
        );
      }
    }
  }

  async validateCrossDatabase() {
    log.info('Validating cross-database consistency...');
    
    const db = this.mongoClient.db(config.mongodb.database);
    const session = this.neo4jDriver.session();

    try {
      // Check if character counts match
      const mongoCharacters = await db.collection('characters').countDocuments();
      const neo4jCharacters = await session.run(`MATCH (c:Character) RETURN count(c) as count`);
      const neo4jCharacterCount = neo4jCharacters.records[0].get('count').toNumber();

      if (mongoCharacters !== neo4jCharacterCount) {
        this.validationResults.mongodb.issues.push(
          `Character count mismatch: MongoDB ${mongoCharacters}, Neo4j ${neo4jCharacterCount}`
        );
      }

      // Check if location counts match
      const mongoLocations = await db.collection('locations').countDocuments();
      const neo4jLocations = await session.run(`MATCH (l:Location) RETURN count(l) as count`);
      const neo4jLocationCount = neo4jLocations.records[0].get('count').toNumber();

      if (mongoLocations !== neo4jLocationCount) {
        this.validationResults.mongodb.issues.push(
          `Location count mismatch: MongoDB ${mongoLocations}, Neo4j ${neo4jLocationCount}`
        );
      }

      // Sample a few characters and check if they exist in both databases
      const sampleCharacters = await db.collection('characters')
        .find({}, { projection: { slug: 1, full_name: 1 } })
        .limit(5)
        .toArray();

      for (const char of sampleCharacters) {
        const neo4jResult = await session.run(
          `MATCH (c:Character) WHERE c.id = $id OR c.name = $name RETURN c`,
          { id: char.slug, name: char.full_name }
        );

        if (neo4jResult.records.length === 0) {
          this.validationResults.mongodb.issues.push(
            `Character ${char.full_name} exists in MongoDB but not in Neo4j`
          );
        }
      }

    } catch (error) {
      this.validationResults.mongodb.issues.push(`Cross-validation error: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  generateReport() {
    log.report('='.repeat(60));
    log.report('STAR WARS LORE DATA VALIDATION REPORT');
    log.report('='.repeat(60));

    // MongoDB Report
    log.report('\nMONGODB VALIDATION:');
    log.report(`Total Documents: ${this.validationResults.mongodb.totalDocuments}`);
    
    for (const [collection, stats] of Object.entries(this.validationResults.mongodb.collections)) {
      log.report(`  ${collection}: ${stats.count} documents`);
      if (!stats.hasData) {
        log.warn(`    WARNING: Collection ${collection} is empty`);
      }
    }

    if (this.validationResults.mongodb.issues.length > 0) {
      log.report('\nMongoDB Issues:');
      for (const issue of this.validationResults.mongodb.issues) {
        log.warn(`  - ${issue}`);
      }
    } else {
      log.success('  No MongoDB issues found');
    }

    // Neo4j Report
    log.report('\nNEO4J VALIDATION:');
    log.report(`Total Nodes: ${this.validationResults.neo4j.totalNodes}`);
    log.report(`Total Relationships: ${this.validationResults.neo4j.totalRelationships}`);

    log.report('\nNode Counts:');
    for (const [label, count] of Object.entries(this.validationResults.neo4j.nodes)) {
      log.report(`  ${label}: ${count} nodes`);
    }

    log.report('\nRelationship Counts:');
    for (const [type, count] of Object.entries(this.validationResults.neo4j.relationships)) {
      log.report(`  ${type}: ${count} relationships`);
    }

    if (this.validationResults.neo4j.issues.length > 0) {
      log.report('\nNeo4j Issues:');
      for (const issue of this.validationResults.neo4j.issues) {
        log.warn(`  - ${issue}`);
      }
    } else {
      log.success('  No Neo4j issues found');
    }

    // Overall Assessment
    log.report('\n' + '='.repeat(60));
    const totalIssues = this.validationResults.mongodb.issues.length + 
                       this.validationResults.neo4j.issues.length;

    if (totalIssues === 0) {
      log.success('VALIDATION PASSED: All lore data is valid and consistent!');
    } else {
      log.warn(`VALIDATION COMPLETED: Found ${totalIssues} issues that need attention`);
    }

    log.report('='.repeat(60));
  }

  async cleanup() {
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
    
    if (this.neo4jDriver) {
      await this.neo4jDriver.close();
    }
  }

  async run() {
    try {
      log.info('Starting Star Wars lore data validation...');
      
      await this.initialize();
      await this.validateMongoDB();
      await this.validateNeo4j();
      await this.validateCrossDatabase();
      
      this.generateReport();
      
    } catch (error) {
      log.error(`Validation failed: ${error.message}`);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the validation if this file is executed directly
if (require.main === module) {
  const validator = new LoreDataValidator();
  validator.run().catch(console.error);
}

module.exports = LoreDataValidator;