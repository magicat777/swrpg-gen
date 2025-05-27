#!/usr/bin/env node

const neo4j = require('neo4j-driver');

const NEO4J_URI = 'bolt://localhost:7687';
const NEO4J_USER = 'neo4j';
const NEO4J_PASSWORD = 'password';

async function testNeo4jData() {
  console.log('🔍 Testing Neo4j Faction Data');
  console.log('=============================');
  console.log('');

  let driver;
  
  try {
    // Connect to Neo4j
    console.log('📡 Connecting to Neo4j...');
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    const session = driver.session();
    console.log('✅ Connected to Neo4j');
    
    console.log('');
    
    // Query for a specific faction
    const query = 'MATCH (f:Faction {name: "Bounty Hunters\' Guild"}) RETURN f';
    const result = await session.run(query);
    
    if (result.records.length > 0) {
      const record = result.records[0];
      const faction = record.get('f').properties;
      
      console.log('📊 Bounty Hunters\' Guild data in Neo4j:');
      console.log(JSON.stringify(faction, null, 2));
      
      // Check if enhanced fields exist
      console.log('');
      console.log('🔍 Enhanced fields check:');
      console.log(`   detailed_content: ${faction.detailed_content ? 'EXISTS' : 'MISSING'}`);
      console.log(`   key_figures: ${faction.key_figures ? 'EXISTS' : 'MISSING'}`);
      console.log(`   wookieepedia_url: ${faction.wookieepedia_url ? 'EXISTS' : 'MISSING'}`);
      console.log(`   philosophy: ${faction.philosophy ? 'EXISTS' : 'MISSING'}`);
      console.log(`   source: ${faction.source ? 'EXISTS' : 'MISSING'}`);
      
    } else {
      console.log('❌ Faction not found in Neo4j');
    }
    
    await session.close();
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    throw error;
  } finally {
    if (driver) {
      await driver.close();
      console.log('📡 Disconnected from Neo4j');
    }
  }
}

// Run the test
testNeo4jData()
  .then(() => {
    console.log('✨ Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });