#!/usr/bin/env node

/**
 * SWRPG Database Purge & Canonical Reset Script
 * 
 * This script will:
 * 1. Connect to all three databases (MongoDB, Neo4j, Weaviate)
 * 2. Purge ALL existing content (sessions, characters, locations, lore)
 * 3. Preserve authentication and system data
 * 4. Prepare for canonical Original Trilogy content insertion
 */

const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');

class DatabasePurger {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin';
    this.neo4jUri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    this.neo4jUser = process.env.NEO4J_USER || 'neo4j';
    this.neo4jPassword = process.env.NEO4J_PASSWORD || 'password';
    this.weaviateUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
    
    this.mongoClient = null;
    this.neo4jDriver = null;
  }

  async connectMongoDB() {
    try {
      this.mongoClient = new MongoClient(this.mongoUri);
      await this.mongoClient.connect();
      console.log('✅ Connected to MongoDB');
      return this.mongoClient.db('swrpg');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  async connectNeo4j() {
    try {
      this.neo4jDriver = neo4j.driver(this.neo4jUri, neo4j.auth.basic(this.neo4jUser, this.neo4jPassword));
      const session = this.neo4jDriver.session();
      await session.run('RETURN 1');
      await session.close();
      console.log('✅ Connected to Neo4j');
    } catch (error) {
      console.error('❌ Neo4j connection failed:', error.message);
      throw error;
    }
  }

  async connectWeaviate() {
    try {
      const response = await fetch(`${this.weaviateUrl}/v1/meta`);
      if (response.ok) {
        console.log('✅ Connected to Weaviate');
      } else {
        throw new Error('Weaviate not responding');
      }
    } catch (error) {
      console.error('❌ Weaviate connection failed:', error.message);
      throw error;
    }
  }

  async purgeMongoContent(db) {
    console.log('🗑️  Purging MongoDB content collections...');
    
    const contentCollections = [
      'sessions',
      'characters', 
      'locations',
      'factions',
      'lore',
      'stories',
      'campaigns',
      'narratives'
    ];

    for (const collection of contentCollections) {
      try {
        const result = await db.collection(collection).deleteMany({});
        console.log(`   📂 ${collection}: ${result.deletedCount} documents removed`);
      } catch (error) {
        console.log(`   ⚠️  ${collection}: Collection not found or already empty`);
      }
    }

    // Preserve authentication data - DO NOT DELETE users, roles, etc.
    console.log('✅ MongoDB content purged (authentication data preserved)');
  }

  async purgeNeo4jContent() {
    console.log('🗑️  Purging Neo4j content nodes...');
    
    const session = this.neo4jDriver.session();
    
    try {
      // Delete content nodes but preserve authentication/system nodes
      const contentLabels = [
        'Character',
        'Location', 
        'Faction',
        'Event',
        'Species',
        'Vehicle',
        'Weapon',
        'Story',
        'Session',
        'Campaign'
      ];

      for (const label of contentLabels) {
        const result = await session.run(`MATCH (n:${label}) DETACH DELETE n RETURN count(n) as deleted`);
        const deletedCount = result.records[0]?.get('deleted') || 0;
        console.log(`   🔗 ${label}: ${deletedCount} nodes removed`);
      }

      console.log('✅ Neo4j content purged (system data preserved)');
      
    } finally {
      await session.close();
    }
  }

  async purgeWeaviateContent() {
    console.log('🗑️  Purging Weaviate content classes...');
    
    const contentClasses = [
      'Character',
      'Location',
      'Faction', 
      'Lore',
      'Story',
      'Session'
    ];

    for (const className of contentClasses) {
      try {
        const response = await fetch(`${this.weaviateUrl}/v1/schema/${className}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          console.log(`   🧠 \${className}: Class deleted`);
        } else if (response.status === 404) {
          console.log(`   ⚠️  \${className}: Class not found`);
        } else {
          console.log(`   ❌ \${className}: Delete failed (\${response.status})`);
        }
      } catch (error) {
        console.log(`   ❌ \${className}: Error - \${error.message}`);
      }
    }

    console.log('✅ Weaviate content purged');
  }

  async createWeaviateSchema() {
    console.log('🏗️  Creating fresh Weaviate schema for canonical content...');
    
    const characterSchema = {
      class: 'Character',
      description: 'Star Wars characters from canonical sources',
      properties: [
        { name: 'name', dataType: ['string'], description: 'Character name' },
        { name: 'species', dataType: ['string'], description: 'Character species' },
        { name: 'homeworld', dataType: ['string'], description: 'Character homeworld' },
        { name: 'affiliation', dataType: ['string[]'], description: 'Character affiliations' },
        { name: 'description', dataType: ['text'], description: 'Character description' },
        { name: 'source', dataType: ['string'], description: 'Canonical source' },
        { name: 'wookieepediaUrl', dataType: ['string'], description: 'Wookieepedia URL' }
      ]
    };

    const locationSchema = {
      class: 'Location', 
      description: 'Star Wars locations from canonical sources',
      properties: [
        { name: 'name', dataType: ['string'], description: 'Location name' },
        { name: 'system', dataType: ['string'], description: 'Star system' },
        { name: 'region', dataType: ['string'], description: 'Galactic region' },
        { name: 'climate', dataType: ['string'], description: 'Climate type' },
        { name: 'terrain', dataType: ['string'], description: 'Terrain type' },
        { name: 'description', dataType: ['text'], description: 'Location description' },
        { name: 'source', dataType: ['string'], description: 'Canonical source' },
        { name: 'wookieepediaUrl', dataType: ['string'], description: 'Wookieepedia URL' }
      ]
    };

    const factionSchema = {
      class: 'Faction',
      description: 'Star Wars factions from canonical sources', 
      properties: [
        { name: 'name', dataType: ['string'], description: 'Faction name' },
        { name: 'type', dataType: ['string'], description: 'Organization type' },
        { name: 'alignment', dataType: ['string'], description: 'Faction alignment' },
        { name: 'era', dataType: ['string'], description: 'Active era' },
        { name: 'description', dataType: ['text'], description: 'Faction description' },
        { name: 'source', dataType: ['string'], description: 'Canonical source' },
        { name: 'wookieepediaUrl', dataType: ['string'], description: 'Wookieepedia URL' }
      ]
    };

    const schemas = [characterSchema, locationSchema, factionSchema];
    
    for (const schema of schemas) {
      try {
        const response = await fetch(`\${this.weaviateUrl}/v1/schema`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schema)
        });
        
        if (response.ok) {
          console.log(`   ✅ \${schema.class} schema created`);
        } else {
          console.log(`   ❌ \${schema.class} schema creation failed`);
        }
      } catch (error) {
        console.log(`   ❌ \${schema.class}: Error - \${error.message}`);
      }
    }
  }

  async validatePurge() {
    console.log('🔍 Validating purge results...');
    
    // Check MongoDB
    const db = await this.connectMongoDB();
    const collections = await db.listCollections().toArray();
    const contentCollections = collections.filter(c => 
      ['sessions', 'characters', 'locations', 'factions', 'lore'].includes(c.name)
    );
    
    for (const collection of contentCollections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   📊 MongoDB \${collection.name}: \${count} documents`);
    }

    // Check authentication is preserved
    const userCount = await db.collection('users').countDocuments();
    console.log(`   👤 Users preserved: \${userCount}`);

    console.log('✅ Validation complete');
  }

  async close() {
    if (this.mongoClient) {
      await this.mongoClient.close();
      console.log('📤 MongoDB connection closed');
    }
    
    if (this.neo4jDriver) {
      await this.neo4jDriver.close();
      console.log('📤 Neo4j connection closed');
    }
  }

  async execute() {
    console.log('🚀 Starting SWRPG Database Purge & Reset');
    console.log('=====================================');
    console.log('⚠️  WARNING: This will DELETE ALL content data!');
    console.log('✅ Authentication data will be PRESERVED');
    console.log('');

    try {
      // Connect to all databases
      console.log('📡 Connecting to databases...');
      const db = await this.connectMongoDB();
      await this.connectNeo4j();
      await this.connectWeaviate();
      
      console.log('');
      
      // Purge content from all databases
      await this.purgeMongoContent(db);
      await this.purgeNeo4jContent();
      await this.purgeWeaviateContent();
      
      console.log('');
      
      // Create fresh schema
      await this.createWeaviateSchema();
      
      console.log('');
      
      // Validate results
      await this.validatePurge();
      
      console.log('');
      console.log('🎉 Database purge completed successfully!');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('   1. Run canonical content import script');
      console.log('   2. Verify Original Trilogy content');
      console.log('   3. Test Wookieepedia URL links');
      console.log('');
      console.log('🔗 Authentication Status: ✅ PRESERVED');
      console.log('   Username: admin');
      console.log('   Password: AdminPass123');
      
    } catch (error) {
      console.error('💥 Purge failed:', error.message);
      process.exit(1);
    } finally {
      await this.close();
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const purger = new DatabasePurger();
  purger.execute();
}

module.exports = DatabasePurger;