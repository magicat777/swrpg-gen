#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection URL
const MONGODB_URI = 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin';
const DATABASE_NAME = 'swrpg';

async function importExpandedTimeline() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const timelineCollection = db.collection('timelineEvents');
    
    // Load the expanded timeline data
    console.log('📖 Loading expanded timeline data...');
    const dataPath = path.join(__dirname, '..', 'data', 'lore', 'expanded_universe_timeline.json');
    const timelineData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Clear existing timeline events
    console.log('🗑️  Clearing existing timeline events...');
    await timelineCollection.deleteMany({});
    
    // Prepare events for insertion
    console.log('📝 Preparing timeline events for insertion...');
    const events = timelineData.expanded_universe_timeline.events.map(event => ({
      ...event,
      _id: event.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      canonical: true,
      source: 'Expanded Universe Compilation',
      verified: true
    }));
    
    // Insert timeline events
    console.log(`📅 Inserting ${events.length} timeline events...`);
    await timelineCollection.insertMany(events);
    
    // Create indexes for better performance
    console.log('🔍 Creating database indexes...');
    try {
      await timelineCollection.createIndex({ dateNumeric: 1 });
      await timelineCollection.createIndex({ era: 1 });
      await timelineCollection.createIndex({ category: 1 });
      await timelineCollection.createIndex({ significance: 1 });
      
      // Drop existing text index if it exists with different options
      try {
        await timelineCollection.dropIndex('title_text_description_text');
      } catch (e) {
        // Index might not exist, continue
      }
      
      await timelineCollection.createIndex({ 
        name: 'text', 
        description: 'text', 
        participants: 'text', 
        location: 'text' 
      });
    } catch (indexError) {
      console.log('⚠️  Index creation skipped (indexes may already exist)');
    }
    
    // Also populate timeline_eras collection
    const erasCollection = db.collection('timelineEras');
    await erasCollection.deleteMany({});
    
    const eras = [
      {
        _id: 'dawn_of_the_jedi',
        name: 'Dawn of the Jedi',
        description: 'The earliest period of Force-user history, from the formation of the Je\'daii Order to the birth of the Jedi and Sith.',
        startDate: -30000,
        endDate: -25000,
        color: '#8B4513',
        significance: 'critical',
        keyEvents: ['Formation of Je\'daii Order', 'Force Wars', 'Birth of Jedi and Sith']
      },
      {
        _id: 'old_republic',
        name: 'Old Republic',
        description: 'The era of the original Galactic Republic, featuring multiple wars between Jedi and Sith, including the events of Knights of the Old Republic and The Old Republic.',
        startDate: -25000,
        endDate: -1000,
        color: '#4169E1',
        significance: 'critical',
        keyEvents: ['Great Hyperspace War', 'Mandalorian Wars', 'Jedi Civil War', 'Great Galactic War', 'Cold War']
      },
      {
        _id: 'new_sith_wars',
        name: 'New Sith Wars',
        description: 'A thousand-year period of conflict between Jedi and various Sith factions.',
        startDate: -2000,
        endDate: -1000,
        color: '#8B0000',
        significance: 'high',
        keyEvents: ['Multiple Sith Wars', 'Battle of Ruusan', 'Rule of Two Established']
      },
      {
        _id: 'republic_classic',
        name: 'Republic Classic',
        description: 'The peaceful era of the Republic before the Clone Wars, when the Jedi served as peacekeepers.',
        startDate: -1000,
        endDate: -22,
        color: '#228B22',
        significance: 'medium',
        keyEvents: ['Ruusan Reformation', 'Rise of Palpatine', 'Birth of Anakin']
      },
      {
        _id: 'prequel_era',
        name: 'Prequel Era',
        description: 'The fall of the Republic and rise of the Empire, covering the events of Episodes I-III.',
        startDate: -32,
        endDate: -19,
        color: '#FFD700',
        significance: 'critical',
        keyEvents: ['Naboo Crisis', 'Clone Wars', 'Order 66', 'Empire Established']
      },
      {
        _id: 'imperial_era',
        name: 'Imperial Era',
        description: 'The dark times when the Empire ruled the galaxy and the Jedi were nearly extinct.',
        startDate: -19,
        endDate: 4,
        color: '#2F4F4F',
        significance: 'critical',
        keyEvents: ['Jedi Purge', 'Death Star Construction', 'Rebellion Forms']
      },
      {
        _id: 'original_trilogy',
        name: 'Original Trilogy',
        description: 'The Galactic Civil War and the fall of the Empire, covering Episodes IV-VI.',
        startDate: 0,
        endDate: 4,
        color: '#FF6347',
        significance: 'critical',
        keyEvents: ['Battle of Yavin', 'Battle of Hoth', 'Battle of Endor']
      },
      {
        _id: 'new_republic',
        name: 'New Republic',
        description: 'The restoration of democracy and Luke\'s attempts to rebuild the Jedi Order.',
        startDate: 5,
        endDate: 28,
        color: '#4682B4',
        significance: 'high',
        keyEvents: ['New Republic Formed', 'Jedi Academy', 'Ben Solo\'s Fall']
      },
      {
        _id: 'sequel_era',
        name: 'Sequel Era',
        description: 'The rise of the First Order and the final defeat of the Sith, covering Episodes VII-IX.',
        startDate: 29,
        endDate: 35,
        color: '#9932CC',
        significance: 'critical',
        keyEvents: ['First Order Rises', 'Force Awakens', 'Last Jedi', 'Rise of Skywalker']
      }
    ];
    
    console.log(`🏛️  Inserting ${eras.length} timeline eras...`);
    await erasCollection.insertMany(eras);
    
    // Verify the import
    const eventCount = await timelineCollection.countDocuments();
    const eraCount = await erasCollection.countDocuments();
    
    console.log('✅ Import completed successfully!');
    console.log(`📊 Statistics:`);
    console.log(`   • Timeline Events: ${eventCount}`);
    console.log(`   • Timeline Eras: ${eraCount}`);
    console.log(`   • SWTOR Events: ${events.filter(e => e.era === 'Old Republic' && e.dateNumeric > -3700).length}`);
    console.log(`   • Canonical Events: ${events.filter(e => e.canonical).length}`);
    console.log(`   • Total Date Range: ${Math.min(...events.map(e => e.dateNumeric))} BBY to ${Math.max(...events.map(e => e.dateNumeric))} ABY`);
    
  } catch (error) {
    console.error('❌ Error importing expanded timeline:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the import
importExpandedTimeline();