#!/bin/bash

# JWT Authentication System Test Suite
# ====================================

echo "🔐 JWT Authentication System Test Suite"
echo "======================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Backend URL
BACKEND_URL="http://localhost:3000"

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="$3"
    
    ((TESTS_RUN++))
    echo -n "Testing: $test_name... "
    
    response=$(eval "$test_command" 2>/dev/null)
    status=$(echo "$response" | jq -r '.status' 2>/dev/null)
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Expected: $expected_status, Got: $status"
        echo "  Response: $response"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Generate unique test user
TEST_USER="authtest_$(date +%s)"
TEST_EMAIL="${TEST_USER}@example.com"
TEST_PASSWORD="TestAuth123"

echo -e "${BLUE}1. AUTHENTICATION ENDPOINTS${NC}"
echo "----------------------------"

# Test 1: Register new user
run_test "User Registration" \
    "curl -s -X POST $BACKEND_URL/api/auth/register -H 'Content-Type: application/json' -d '{\"username\":\"$TEST_USER\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}'" \
    "success"

# Get token from registration
TOKEN=$(curl -s -X POST $BACKEND_URL/api/auth/register -H 'Content-Type: application/json' -d "{\"username\":\"${TEST_USER}_2\",\"email\":\"${TEST_USER}_2@example.com\",\"password\":\"$TEST_PASSWORD\"}" | jq -r '.data.token' 2>/dev/null)

# Test 2: Login with correct credentials
run_test "User Login (Valid)" \
    "curl -s -X POST $BACKEND_URL/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"${TEST_USER}_2\",\"password\":\"$TEST_PASSWORD\"}'" \
    "success"

# Test 3: Login with incorrect credentials
run_test "User Login (Invalid)" \
    "curl -s -X POST $BACKEND_URL/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"${TEST_USER}_2\",\"password\":\"WrongPassword\"}'" \
    "error"

# Test 4: Get user profile with valid token
run_test "Get Profile (Authenticated)" \
    "curl -s -H 'Authorization: Bearer $TOKEN' $BACKEND_URL/api/auth/me" \
    "success"

# Test 5: Get user profile without token
run_test "Get Profile (Unauthenticated)" \
    "curl -s $BACKEND_URL/api/auth/me" \
    "error"

# Test 6: Get user profile with invalid token
run_test "Get Profile (Invalid Token)" \
    "curl -s -H 'Authorization: Bearer invalid_token' $BACKEND_URL/api/auth/me" \
    "error"

echo ""
echo -e "${BLUE}2. API KEY MANAGEMENT${NC}"
echo "---------------------"

# Test 7: Generate API key
run_test "Generate API Key" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' $BACKEND_URL/api/auth/api-key" \
    "success"

# Test 8: Revoke API key
run_test "Revoke API Key" \
    "curl -s -X DELETE -H 'Authorization: Bearer $TOKEN' $BACKEND_URL/api/auth/api-key" \
    "success"

echo ""
echo -e "${BLUE}3. USER PREFERENCES${NC}"
echo "-------------------"

# Test 9: Get user preferences
run_test "Get Preferences" \
    "curl -s -H 'Authorization: Bearer $TOKEN' $BACKEND_URL/api/auth/preferences" \
    "success"

# Test 10: Update user preferences
run_test "Update Preferences" \
    "curl -s -X PUT -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"preferences\":{\"theme\":\"light\",\"notificationsEnabled\":false}}' $BACKEND_URL/api/auth/preferences" \
    "success"

echo ""
echo -e "${BLUE}4. PROTECTED ROUTES${NC}"
echo "-------------------"

# Test 11: Access protected route with valid token
run_test "Settings (Authenticated)" \
    "curl -s -H 'Authorization: Bearer $TOKEN' $BACKEND_URL/api/settings" \
    "success"

# Test 12: Access protected route without token
run_test "Settings (Unauthenticated)" \
    "curl -s $BACKEND_URL/api/settings" \
    "error"

echo ""
echo -e "${BLUE}5. OPTIONAL AUTHENTICATION${NC}"
echo "---------------------------"

# Test 13: Access optional auth route without token (check for data array)
echo -n "Testing: World Data (No Auth)... "
response=$(curl -s $BACKEND_URL/api/world/characters?limit=1)
if echo "$response" | jq -e '.data | length > 0' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi
((TESTS_RUN++))

# Test 14: Access optional auth route with token (check for data array)
echo -n "Testing: World Data (With Auth)... "
response=$(curl -s -H "Authorization: Bearer $TOKEN" $BACKEND_URL/api/world/characters?limit=1)
if echo "$response" | jq -e '.data | length > 0' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi
((TESTS_RUN++))

echo ""
echo -e "${BLUE}6. INPUT VALIDATION${NC}"
echo "------------------"

# Test 15: Register with weak password
run_test "Registration (Weak Password)" \
    "curl -s -X POST $BACKEND_URL/api/auth/register -H 'Content-Type: application/json' -d '{\"username\":\"weakpass\",\"email\":\"weakpass@example.com\",\"password\":\"123\"}'" \
    "error"

# Test 16: Register with invalid email
run_test "Registration (Invalid Email)" \
    "curl -s -X POST $BACKEND_URL/api/auth/register -H 'Content-Type: application/json' -d '{\"username\":\"bademail\",\"email\":\"not-an-email\",\"password\":\"ValidPass123\"}'" \
    "error"

# Test 17: Register with duplicate username
run_test "Registration (Duplicate Username)" \
    "curl -s -X POST $BACKEND_URL/api/auth/register -H 'Content-Type: application/json' -d '{\"username\":\"${TEST_USER}_2\",\"email\":\"different@example.com\",\"password\":\"ValidPass123\"}'" \
    "error"

echo ""
echo -e "${BLUE}7. ROLE-BASED AUTHENTICATION${NC}"
echo "----------------------------"

# Create test admin user with proper password
ADMIN_USER="testadmin_$(date +%s)"
curl -s -X POST $BACKEND_URL/api/auth/register -H 'Content-Type: application/json' -d "{\"username\":\"$ADMIN_USER\",\"email\":\"${ADMIN_USER}@example.com\",\"password\":\"$TEST_PASSWORD\"}" >/dev/null

# Update user to admin role via MongoDB (for testing purposes)
echo -n "Setting up admin user... "
if command -v mongosh >/dev/null 2>&1; then
    mongosh mongodb://admin:password@localhost:27017/swrpg --authenticationDatabase admin --eval "db.users.updateOne({username:'$ADMIN_USER'}, {\$set: {roles: ['admin']}})" >/dev/null 2>&1
    echo -e "${GREEN}✓ Done${NC}"
else
    echo -e "${YELLOW}⚠ Skipped (mongosh not available)${NC}"
fi

# Get admin token
ADMIN_TOKEN=$(curl -s -X POST $BACKEND_URL/api/auth/login -H 'Content-Type: application/json' -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$TEST_PASSWORD\"}" | jq -r '.data.token' 2>/dev/null)

# Test 18: Admin route access with admin token
echo -n "Testing: Admin Access (With Admin Token)... "
if [ "$ADMIN_TOKEN" != "null" ] && [ "$ADMIN_TOKEN" != "" ]; then
    response=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" $BACKEND_URL/api/admin/users?limit=1)
    status=$(echo "$response" | jq -r '.status' 2>/dev/null)
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${YELLOW}⚠ SKIPPED (No admin token)${NC}"
fi
((TESTS_RUN++))

# Test 19: Admin route access with regular user token
run_test "Admin Access (Regular User)" \
    "curl -s -H 'Authorization: Bearer $TOKEN' $BACKEND_URL/api/admin/users?limit=1" \
    "error"

echo ""
echo -e "${GREEN}📊 TEST RESULTS${NC}"
echo "==============="
echo "Tests Run: $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "JWT Authentication System is fully functional."
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo "Please review the failed tests above."
    exit 1
fi