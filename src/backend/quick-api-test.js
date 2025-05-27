#!/usr/bin/env node

/**
 * Quick API Test - Tests core functionality that should be working
 * Focused on endpoints that are currently functional
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) config.data = data;
    
    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      status: error.response?.status || 0, 
      error: error.response?.data || error.message 
    };
  }
}

async function testAPI() {
  console.log('🔬 Quick API Functionality Test\\n');
  
  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      url: '/health',
      expectStatus: 200
    },
    {
      name: 'Detailed Health Check',
      method: 'GET',
      url: '/health/detailed',
      expectStatus: 200
    },
    {
      name: 'Get Characters (First 5)',
      method: 'GET',
      url: '/world/characters?limit=5',
      expectStatus: 200
    },
    {
      name: 'Get Characters with Search',
      method: 'GET',
      url: '/world/characters?search=Luke',
      expectStatus: 200
    },
    {
      name: 'Get Locations (First 5)',
      method: 'GET',
      url: '/world/locations?limit=5',
      expectStatus: 200
    },
    {
      name: 'Get Locations with Filter',
      method: 'GET',
      url: '/world/locations?climate=Desert',
      expectStatus: 200
    },
    {
      name: 'Get Factions (First 5)',
      method: 'GET',
      url: '/world/factions?limit=5',
      expectStatus: 200
    },
    {
      name: 'Get Factions with Search',
      method: 'GET',
      url: '/world/factions?search=Jedi',
      expectStatus: 200
    },
    {
      name: 'Pagination Test (Characters)',
      method: 'GET',
      url: '/world/characters?limit=10&offset=20',
      expectStatus: 200
    },
    {
      name: 'Input Validation (Invalid Limit)',
      method: 'GET',
      url: '/world/characters?limit=500',
      expectStatus: 400
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`${test.name}... `);
    
    const result = await makeRequest(test.method, test.url, test.data);
    
    if (result.status === test.expectStatus) {
      console.log('✅ PASS');
      passed++;
      
      // Show some data for successful GET requests
      if (test.method === 'GET' && result.success && result.data.data) {
        if (Array.isArray(result.data.data)) {
          console.log(`   📊 Returned ${result.data.data.length} items (Total: ${result.data.total || 'N/A'})`);
        }
      }
    } else {
      console.log(`❌ FAIL (Expected ${test.expectStatus}, got ${result.status})`);
      if (result.error) {
        console.log(`   Error: ${JSON.stringify(result.error)}`);
      }
      failed++;
    }
  }

  console.log(`\\n📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  // Test authentication flow
  console.log('\\n🔐 Testing Authentication Flow...');
  
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123'
  };

  // Register
  process.stdout.write('User Registration... ');
  const registerResult = await makeRequest('POST', '/auth/register', testUser);
  if (registerResult.success) {
    console.log('✅ PASS');
    console.log(`   📝 User ID: ${registerResult.data.data.user.id}`);
    
    // Login
    process.stdout.write('User Login... ');
    const loginResult = await makeRequest('POST', '/auth/login', {
      username: testUser.username,
      password: testUser.password
    });
    
    if (loginResult.success) {
      console.log('✅ PASS');
      console.log(`   🎫 Token: ${loginResult.data.data.token.substring(0, 20)}...`);
    } else {
      console.log('❌ FAIL');
    }
  } else {
    console.log('❌ FAIL');
    console.log(`   Error: ${JSON.stringify(registerResult.error)}`);
  }

  // Test data integrity
  console.log('\\n📈 Testing Data Integrity...');
  
  const dataTests = [
    { name: 'Characters', url: '/world/characters?limit=1' },
    { name: 'Locations', url: '/world/locations?limit=1' },
    { name: 'Factions', url: '/world/factions?limit=1' }
  ];

  for (const dataTest of dataTests) {
    process.stdout.write(`${dataTest.name} Data Structure... `);
    const result = await makeRequest('GET', dataTest.url);
    
    if (result.success && result.data.data && result.data.data.length > 0) {
      const item = result.data.data[0];
      const hasRequiredFields = item.id && item.name;
      
      if (hasRequiredFields) {
        console.log('✅ PASS');
        console.log(`   📋 Sample: ${item.name} (${item.id})`);
      } else {
        console.log('❌ FAIL (Missing required fields)');
      }
    } else {
      console.log('❌ FAIL (No data returned)');
    }
  }

  console.log('\\n🎉 Quick API test complete!');
}

testAPI().catch(console.error);