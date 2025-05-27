#!/usr/bin/env node

const axios = require('axios');

async function testBackendAPI() {
  try {
    console.log('🧪 Testing Backend API Response');
    console.log('==============================');
    console.log('');
    
    const response = await axios.get('http://localhost:3000/api/world/factions?limit=1');
    const faction = response.data.data[0];
    
    console.log('📊 API Response:');
    console.log(JSON.stringify(faction, null, 2));
    
    console.log('');
    console.log('🔍 Field Check:');
    console.log(`   id: ${faction.id}`);
    console.log(`   name: ${faction.name}`);
    console.log(`   detailed_content: ${faction.detailed_content ? 'EXISTS (' + faction.detailed_content.substring(0, 50) + '...)' : 'MISSING'}`);
    console.log(`   key_figures: ${faction.key_figures || 'MISSING'}`);
    console.log(`   wookieepedia_url: ${faction.wookieepedia_url || 'MISSING'}`);
    console.log(`   philosophy: ${faction.philosophy || 'MISSING'}`);
    console.log(`   source: ${faction.source || 'MISSING'}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testBackendAPI();