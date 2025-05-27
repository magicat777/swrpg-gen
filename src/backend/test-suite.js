#!/usr/bin/env node

/**
 * Comprehensive API Test Suite for Star Wars RPG Generator
 * Tests all endpoints with various scenarios including authentication, validation, and data integrity
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Test user credentials for authentication tests
const testUser = {
  username: 'testuser_' + Date.now(),
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123'
};

let authToken = null;
let userId = null;

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  switch (type) {
    case 'success':
      console.log(`[${timestamp}] ✅ ${message}`.green);
      break;
    case 'error':
      console.log(`[${timestamp}] ❌ ${message}`.red);
      break;
    case 'warning':
      console.log(`[${timestamp}] ⚠️ ${message}`.yellow);
      break;
    case 'info':
    default:
      console.log(`[${timestamp}] ℹ️ ${message}`.cyan);
      break;
  }
}

function recordTest(testName, passed, error = null) {
  totalTests++;
  if (passed) {
    passedTests++;
    log(`${testName} - PASSED`, 'success');
  } else {
    failedTests++;
    log(`${testName} - FAILED: ${error}`, 'error');
  }
  
  testResults.push({
    test: testName,
    passed,
    error: error ? error.toString() : null,
    timestamp: new Date().toISOString()
  });
}

// HTTP request wrapper with error handling
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    return await axios(config);
  } catch (error) {
    return error.response || { status: 0, data: error.message };
  }
}

// Test Suites

/**
 * Health Check Tests
 */
async function testHealthEndpoints() {
  log('🏥 Testing Health Check Endpoints', 'info');
  
  // Test basic health endpoint
  try {
    const response = await makeRequest('GET', '/health');
    const passed = response.status === 200 && response.data.status === 'ok';
    recordTest('Basic health check', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('Basic health check', false, error.message);
  }
  
  // Test detailed health endpoint
  try {
    const response = await makeRequest('GET', '/health/detailed');
    const passed = response.status === 200 && response.data.components;
    recordTest('Detailed health check', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('Detailed health check', false, error.message);
  }
}

/**
 * Authentication Tests
 */
async function testAuthenticationEndpoints() {
  log('🔐 Testing Authentication Endpoints', 'info');
  
  // Test user registration
  try {
    const response = await makeRequest('POST', '/auth/register', testUser);
    const passed = response.status === 201 && response.data.data.token;
    if (passed) {
      authToken = response.data.data.token;
      userId = response.data.data.user.id;
    }
    recordTest('User registration', passed, !passed ? `Status: ${response.status}, Data: ${JSON.stringify(response.data)}` : null);
  } catch (error) {
    recordTest('User registration', false, error.message);
  }
  
  // Test duplicate registration (should fail)
  try {
    const response = await makeRequest('POST', '/auth/register', testUser);
    const passed = response.status === 409; // Conflict expected
    recordTest('Duplicate user registration (should fail)', passed, !passed ? `Expected 409, got ${response.status}` : null);
  } catch (error) {
    recordTest('Duplicate user registration (should fail)', false, error.message);
  }
  
  // Test login
  try {
    const response = await makeRequest('POST', '/auth/login', {
      username: testUser.username,
      password: testUser.password
    });
    const passed = response.status === 200 && response.data.data.token;
    if (passed && !authToken) {
      authToken = response.data.data.token;
      userId = response.data.data.user.id;
    }
    recordTest('User login', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('User login', false, error.message);
  }
  
  // Test invalid login
  try {
    const response = await makeRequest('POST', '/auth/login', {
      username: testUser.username,
      password: 'wrongpassword'
    });
    const passed = response.status === 401;
    recordTest('Invalid login (should fail)', passed, !passed ? `Expected 401, got ${response.status}` : null);
  } catch (error) {
    recordTest('Invalid login (should fail)', false, error.message);
  }
  
  // Test get current user (requires auth)
  if (authToken) {
    try {
      const response = await makeRequest('GET', '/auth/me', null, {
        'Authorization': `Bearer ${authToken}`
      });
      const passed = response.status === 200 && response.data.data.user.id === userId;
      recordTest('Get current user (authenticated)', passed, !passed ? `Status: ${response.status}` : null);
    } catch (error) {
      recordTest('Get current user (authenticated)', false, error.message);
    }
    
    // Test API key generation
    try {
      const response = await makeRequest('POST', '/auth/api-key', null, {
        'Authorization': `Bearer ${authToken}`
      });
      const passed = response.status === 200 && response.data.data.apiKey;
      recordTest('API key generation', passed, !passed ? `Status: ${response.status}` : null);
    } catch (error) {
      recordTest('API key generation', false, error.message);
    }
  }
  
  // Test unauthorized access
  try {
    const response = await makeRequest('GET', '/auth/me');
    const passed = response.status === 401;
    recordTest('Unauthorized access (should fail)', passed, !passed ? `Expected 401, got ${response.status}` : null);
  } catch (error) {
    recordTest('Unauthorized access (should fail)', false, error.message);
  }
}

/**
 * World Data Tests (Characters, Locations, Factions)
 */
async function testWorldDataEndpoints() {
  log('🌍 Testing World Data Endpoints', 'info');
  
  // Test characters endpoint
  try {
    const response = await makeRequest('GET', '/world/characters?limit=5');
    const passed = response.status === 200 && 
                  response.data.data && 
                  Array.isArray(response.data.data) &&
                  typeof response.data.total === 'number';
    recordTest('Get characters', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('Get characters', false, error.message);
  }
  
  // Test characters with pagination
  try {
    const response = await makeRequest('GET', '/world/characters?limit=10&offset=5');
    const passed = response.status === 200 && response.data.limit === 10 && response.data.offset === 5;
    recordTest('Characters pagination', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('Characters pagination', false, error.message);
  }
  
  // Test characters with search
  try {
    const response = await makeRequest('GET', '/world/characters?search=Luke');
    const passed = response.status === 200 && Array.isArray(response.data.data);
    recordTest('Characters search', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('Characters search', false, error.message);
  }
  
  // Test invalid character limits
  try {
    const response = await makeRequest('GET', '/world/characters?limit=500');
    const passed = response.status === 400; // Should validate limit
    recordTest('Invalid character limit (should fail)', passed, !passed ? `Expected 400, got ${response.status}` : null);
  } catch (error) {
    recordTest('Invalid character limit (should fail)', false, error.message);
  }
  
  // Test locations endpoint
  try {
    const response = await makeRequest('GET', '/world/locations?limit=5');
    const passed = response.status === 200 && 
                  response.data.data && 
                  Array.isArray(response.data.data) &&
                  typeof response.data.total === 'number';
    recordTest('Get locations', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('Get locations', false, error.message);
  }
  
  // Test locations with filters
  try {
    const response = await makeRequest('GET', '/world/locations?climate=Desert');
    const passed = response.status === 200 && Array.isArray(response.data.data);
    recordTest('Locations filtering', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('Locations filtering', false, error.message);
  }
  
  // Test factions endpoint
  try {
    const response = await makeRequest('GET', '/world/factions?limit=5');
    const passed = response.status === 200 && 
                  response.data.data && 
                  Array.isArray(response.data.data) &&
                  typeof response.data.total === 'number';
    recordTest('Get factions', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('Get factions', false, error.message);
  }
  
  // Test faction by ID (get first faction and test individual lookup)
  try {
    const listResponse = await makeRequest('GET', '/world/factions?limit=1');
    if (listResponse.status === 200 && listResponse.data.data.length > 0) {
      const factionId = listResponse.data.data[0].id;
      const response = await makeRequest('GET', `/world/factions/${factionId}`);
      const passed = response.status === 200 && response.data.data.id === factionId;
      recordTest('Get faction by ID', passed, !passed ? `Status: ${response.status}` : null);
    } else {
      recordTest('Get faction by ID', false, 'No factions available for ID test');
    }
  } catch (error) {
    recordTest('Get faction by ID', false, error.message);
  }
  
  // Test non-existent faction ID
  try {
    const response = await makeRequest('GET', '/world/factions/non-existent-id');
    const passed = response.status === 404;
    recordTest('Non-existent faction ID (should fail)', passed, !passed ? `Expected 404, got ${response.status}` : null);
  } catch (error) {
    recordTest('Non-existent faction ID (should fail)', false, error.message);
  }
}

/**
 * Validation Endpoints Tests
 */
async function testValidationEndpoints() {
  log('🔍 Testing Validation Endpoints', 'info');
  
  // Test database validation (requires auth)
  if (authToken) {
    try {
      const response = await makeRequest('GET', '/validation/databases', null, {
        'Authorization': `Bearer ${authToken}`
      });
      const passed = response.status === 200 && response.data.data;
      recordTest('Database validation (authenticated)', passed, !passed ? `Status: ${response.status}` : null);
    } catch (error) {
      recordTest('Database validation (authenticated)', false, error.message);
    }
  }
  
  // Test validation status
  try {
    const response = await makeRequest('GET', '/validation/status');
    const passed = response.status === 200;
    recordTest('Validation status', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('Validation status', false, error.message);
  }
}

/**
 * Input Validation Tests
 */
async function testInputValidation() {
  log('🛡️ Testing Input Validation', 'info');
  
  // Test registration with invalid data
  const invalidUserTests = [
    { user: { username: 'ab', email: 'test@test.com', password: 'Password123' }, reason: 'Username too short' },
    { user: { username: 'validuser', email: 'invalid-email', password: 'Password123' }, reason: 'Invalid email' },
    { user: { username: 'validuser', email: 'test@test.com', password: 'weak' }, reason: 'Weak password' },
    { user: { username: 'valid user', email: 'test@test.com', password: 'Password123' }, reason: 'Username with spaces' }
  ];
  
  for (const test of invalidUserTests) {
    try {
      const response = await makeRequest('POST', '/auth/register', test.user);
      const passed = response.status === 400;
      recordTest(`Registration validation: ${test.reason}`, passed, !passed ? `Expected 400, got ${response.status}` : null);
    } catch (error) {
      recordTest(`Registration validation: ${test.reason}`, false, error.message);
    }
  }
  
  // Test SQL injection attempts
  try {
    const response = await makeRequest('GET', "/world/characters?search='; DROP TABLE characters; --");
    const passed = response.status === 200; // Should handle safely, not crash
    recordTest('SQL injection protection', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('SQL injection protection', false, error.message);
  }
  
  // Test XSS attempts
  try {
    const response = await makeRequest('GET', '/world/characters?search=<script>alert("xss")</script>');
    const passed = response.status === 200; // Should handle safely
    recordTest('XSS injection protection', passed, !passed ? `Status: ${response.status}` : null);
  } catch (error) {
    recordTest('XSS injection protection', false, error.message);
  }
}

/**
 * Rate Limiting Tests
 */
async function testRateLimiting() {
  log('⚡ Testing Rate Limiting', 'info');
  
  // Make rapid requests to test rate limiting
  try {
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(makeRequest('GET', '/health'));
    }
    
    const responses = await Promise.all(requests);
    const allPassed = responses.every(response => response.status === 200);
    recordTest('Burst requests within limit', allPassed, !allPassed ? 'Some requests failed' : null);
  } catch (error) {
    recordTest('Burst requests within limit', false, error.message);
  }
}

/**
 * Error Handling Tests
 */
async function testErrorHandling() {
  log('🚨 Testing Error Handling', 'info');
  
  // Test 404 for non-existent endpoint
  try {
    const response = await makeRequest('GET', '/nonexistent');
    const passed = response.status === 404;
    recordTest('404 for non-existent endpoint', passed, !passed ? `Expected 404, got ${response.status}` : null);
  } catch (error) {
    recordTest('404 for non-existent endpoint', false, error.message);
  }
  
  // Test 405 for wrong HTTP method
  try {
    const response = await makeRequest('DELETE', '/health');
    const passed = response.status === 404 || response.status === 405;
    recordTest('405 for wrong HTTP method', passed, !passed ? `Expected 404/405, got ${response.status}` : null);
  } catch (error) {
    recordTest('405 for wrong HTTP method', false, error.message);
  }
  
  // Test malformed JSON handling
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, 'invalid-json', {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true
    });
    const passed = response.status === 400;
    recordTest('Malformed JSON handling', passed, !passed ? `Expected 400, got ${response.status}` : null);
  } catch (error) {
    recordTest('Malformed JSON handling', false, error.message);
  }
}

/**
 * Performance Tests
 */
async function testPerformance() {
  log('🚀 Testing Performance', 'info');
  
  // Test response times for various endpoints
  const performanceTests = [
    { endpoint: '/health', maxTime: 100 },
    { endpoint: '/world/characters?limit=20', maxTime: 1000 },
    { endpoint: '/world/locations?limit=20', maxTime: 1000 },
    { endpoint: '/world/factions?limit=20', maxTime: 1000 }
  ];
  
  for (const test of performanceTests) {
    try {
      const startTime = Date.now();
      const response = await makeRequest('GET', test.endpoint);
      const responseTime = Date.now() - startTime;
      
      const passed = response.status === 200 && responseTime < test.maxTime;
      recordTest(
        `Performance: ${test.endpoint} (<${test.maxTime}ms)`,
        passed,
        !passed ? `Response time: ${responseTime}ms, Status: ${response.status}` : null
      );
    } catch (error) {
      recordTest(`Performance: ${test.endpoint}`, false, error.message);
    }
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🧪 Starting Comprehensive API Test Suite'.bold.yellow);
  console.log(`🎯 Target: ${BASE_URL}`.gray);
  console.log('=' * 60);
  
  const startTime = Date.now();
  
  try {
    // Run all test suites
    await testHealthEndpoints();
    await testAuthenticationEndpoints();
    await testWorldDataEndpoints();
    await testValidationEndpoints();
    await testInputValidation();
    await testRateLimiting();
    await testErrorHandling();
    await testPerformance();
    
  } catch (error) {
    log(`Test suite crashed: ${error.message}`, 'error');
  }
  
  // Calculate results
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
  
  // Print summary
  console.log('\\n' + '=' * 60);
  console.log('📊 TEST SUMMARY'.bold.yellow);
  console.log('=' * 60);
  console.log(`⏱️  Duration: ${duration}s`.gray);
  console.log(`📈 Success Rate: ${successRate}%`.cyan);
  console.log(`✅ Passed: ${passedTests}`.green);
  console.log(`❌ Failed: ${failedTests}`.red);
  console.log(`📊 Total: ${totalTests}`.white);
  
  if (failedTests > 0) {
    console.log('\\n🔍 FAILED TESTS:'.red);
    testResults
      .filter(result => !result.passed)
      .forEach(result => {
        console.log(`   ❌ ${result.test}: ${result.error}`.red);
      });
  }
  
  console.log('\\n🎯 RECOMMENDATIONS:'.bold.yellow);
  if (successRate >= 95) {
    console.log('   🎉 Excellent! API is production-ready.'.green);
  } else if (successRate >= 85) {
    console.log('   ✅ Good! Minor issues need attention.'.yellow);
  } else if (successRate >= 70) {
    console.log('   ⚠️  Moderate issues detected. Review failed tests.'.yellow);
  } else {
    console.log('   🚨 Major issues detected. API needs significant fixes.'.red);
  }
  
  // Save detailed results
  const reportPath = `./test-results-${Date.now()}.json`;
  require('fs').writeFileSync(reportPath, JSON.stringify({
    summary: {
      duration,
      successRate,
      passed: passedTests,
      failed: failedTests,
      total: totalTests,
      timestamp: new Date().toISOString()
    },
    results: testResults
  }, null, 2));
  
  console.log(`\\n📄 Detailed results saved to: ${reportPath}`.gray);
  
  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the test suite
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Test suite failed to start:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testHealthEndpoints,
  testAuthenticationEndpoints,
  testWorldDataEndpoints
};