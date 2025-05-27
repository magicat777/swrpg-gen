#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');

const MONGODB_URI = 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin';
const NEO4J_URI = 'bolt://localhost:7687';
const NEO4J_USER = 'neo4j';
const NEO4J_PASSWORD = 'password';

async function syncFactionsToNeo4j() {
  console.log('🔄 Syncing Enhanced Faction Data from MongoDB to Neo4j');
  console.log('====================================================');
  console.log('');

  let mongoClient, neo4jDriver;
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB');
    
    // Connect to Neo4j
    console.log('📡 Connecting to Neo4j...');
    neo4jDriver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    const neo4jSession = neo4jDriver.session();
    console.log('✅ Connected to Neo4j');
    
    console.log('');
    
    // Get enhanced factions from MongoDB
    const db = mongoClient.db();
    const factionsCollection = db.collection('factions');
    const enhancedFactions = await factionsCollection.find({}).toArray();
    
    console.log(`📚 Found ${enhancedFactions.length} factions in MongoDB`);
    console.log('');
    
    console.log('⚔️ Updating Neo4j factions with enhanced data...');
    
    let updatedCount = 0;
    for (const faction of enhancedFactions) {
      try {
        // Update existing faction in Neo4j with enhanced fields
        const query = `
          MATCH (f:Faction {name: $name})
          SET f.detailed_content = $detailed_content,
              f.key_figures = $key_figures,
              f.wookieepedia_url = $wookieepedia_url,
              f.philosophy = $philosophy,
              f.source = $source
          RETURN f
        `;
        
        const params = {
          name: faction.name,
          detailed_content: faction.detailed_content || null,
          key_figures: faction.key_figures || null,
          wookieepedia_url: faction.wookieepedia_url || null,
          philosophy: faction.philosophy || null,
          source: faction.source || null
        };
        
        const result = await neo4jSession.run(query, params);
        
        if (result.records.length > 0) {
          console.log(`   ✅ Updated: ${faction.name}`);
          updatedCount++;
        } else {
          console.log(`   ⚠️  Not found in Neo4j: ${faction.name}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Failed: ${faction.name} - ${error.message}`);
      }
    }
    
    await neo4jSession.close();
    
    console.log('');
    console.log(`🎯 Sync complete! (${updatedCount}/${enhancedFactions.length} updated in Neo4j)`);
    console.log('');
    console.log('📊 Enhanced Fields Synced:');
    console.log('   • detailed_content - 2-3 paragraph descriptions');
    console.log('   • key_figures - Important leaders and members');
    console.log('   • wookieepedia_url - Direct links to canonical sources');
    console.log('   • philosophy - Organizational beliefs and goals');
    console.log('   • source - Original trilogy movie sources');
    console.log('');
    
  } catch (error) {
    console.error('💥 Sync failed:', error.message);
    throw error;
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('📡 Disconnected from MongoDB');
    }
    if (neo4jDriver) {
      await neo4jDriver.close();
      console.log('📡 Disconnected from Neo4j');
    }
  }
}

// Run the sync
syncFactionsToNeo4j()
  .then(() => {
    console.log('✨ Enhanced faction data now available via API!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });