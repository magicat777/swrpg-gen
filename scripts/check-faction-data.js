#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin';

async function checkFactionData() {
  let client;
  try {
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const factionsCollection = db.collection('factions');
    
    console.log('🔍 Checking faction data structure...');
    const sampleFaction = await factionsCollection.findOne({ name: "Bounty Hunters' Guild" });
    
    console.log('📊 Sample faction data:');
    console.log(JSON.stringify(sampleFaction, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkFactionData();