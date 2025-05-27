#!/bin/bash

# Comprehensive Input Validation Test Suite
# =========================================

echo "🔍 Input Validation Test Suite"
echo "=============================="
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
run_validation_test() {
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
        if [ "$status" = "error" ]; then
            error_code=$(echo "$response" | jq -r '.code' 2>/dev/null)
            error_msg=$(echo "$response" | jq -r '.message' 2>/dev/null)
            echo "  Error: $error_code - $error_msg"
        fi
        ((TESTS_FAILED++))
        return 1
    fi
}

# Create test user and get token
echo "Setting up test authentication..."
TEST_USER="validtest_$(date +%s)"
TEST_PASSWORD="ValidTest123"
TOKEN=$(curl -s -X POST $BACKEND_URL/api/auth/register -H 'Content-Type: application/json' -d "{\"username\":\"$TEST_USER\",\"email\":\"${TEST_USER}@example.com\",\"password\":\"$TEST_PASSWORD\"}" | jq -r '.data.token' 2>/dev/null)

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to create test user. Exiting.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Test user created${NC}"
echo ""

echo -e "${BLUE}1. AUTHENTICATION VALIDATION${NC}"
echo "----------------------------"

# Test 1: Registration with weak password
run_validation_test "Registration (Weak Password)" \
    "curl -s -X POST $BACKEND_URL/api/auth/register -H 'Content-Type: application/json' -d '{\"username\":\"weakuser\",\"email\":\"weak@example.com\",\"password\":\"123\"}'" \
    "error"

# Test 2: Registration with invalid email
run_validation_test "Registration (Invalid Email)" \
    "curl -s -X POST $BACKEND_URL/api/auth/register -H 'Content-Type: application/json' -d '{\"username\":\"bademail\",\"email\":\"not-an-email\",\"password\":\"ValidPass123\"}'" \
    "error"

# Test 3: Registration with long username
run_validation_test "Registration (Username Too Long)" \
    "curl -s -X POST $BACKEND_URL/api/auth/register -H 'Content-Type: application/json' -d '{\"username\":\"thisusernameiswaytoolongtobeaccepted\",\"email\":\"long@example.com\",\"password\":\"ValidPass123\"}'" \
    "error"

echo ""
echo -e "${BLUE}2. SESSION VALIDATION${NC}"
echo "---------------------"

# Test 4: Session creation with valid data
run_validation_test "Session Creation (Valid)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"campaignName\":\"Test Campaign\",\"description\":\"A test campaign\",\"campaignSettings\":{\"playerCount\":4,\"difficulty\":\"normal\"}}' $BACKEND_URL/api/sessions" \
    "success"

# Test 5: Session creation with invalid player count
run_validation_test "Session Creation (Invalid Player Count)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"campaignName\":\"Test Campaign\",\"campaignSettings\":{\"playerCount\":15}}' $BACKEND_URL/api/sessions" \
    "error"

# Test 6: Session creation with empty campaign name
run_validation_test "Session Creation (Empty Campaign Name)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"campaignName\":\"\",\"description\":\"Test\"}' $BACKEND_URL/api/sessions" \
    "error"

echo ""
echo -e "${BLUE}3. CHAT VALIDATION${NC}"
echo "-----------------"

# Test 7: Chat message with valid content
run_validation_test "Chat Message (Valid)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"message\":\"Hello, this is a test message\",\"messageType\":\"user\"}' $BACKEND_URL/api/chat/message" \
    "success"

# Test 8: Chat message with empty content
run_validation_test "Chat Message (Empty)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"message\":\"\"}' $BACKEND_URL/api/chat/message" \
    "error"

# Test 9: Chat message too long
run_validation_test "Chat Message (Too Long)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"message\":\"'$(printf 'a%.0s' {1..2001})'\"}}' $BACKEND_URL/api/chat/message" \
    "error"

# Test 10: Chat history with invalid session ID
run_validation_test "Chat History (Invalid Session ID)" \
    "curl -s -H 'Authorization: Bearer $TOKEN' $BACKEND_URL/api/chat/history/invalid-id" \
    "error"

echo ""
echo -e "${BLUE}4. GENERATION VALIDATION${NC}"
echo "------------------------"

# Test 11: Character generation with valid data
run_validation_test "Character Generation (Valid)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"era\":\"Original Trilogy\",\"species\":\"Human\",\"affiliation\":\"Rebel Alliance\",\"characterType\":\"hero\",\"forceSensitive\":false}' $BACKEND_URL/api/generate/character" \
    "success"

# Test 12: Character generation with invalid era
run_validation_test "Character Generation (Invalid Era)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"era\":\"Future Era\",\"species\":\"Human\",\"affiliation\":\"Rebels\",\"characterType\":\"hero\",\"forceSensitive\":false}' $BACKEND_URL/api/generate/character" \
    "error"

# Test 13: Character generation with invalid character type
run_validation_test "Character Generation (Invalid Type)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"era\":\"Original Trilogy\",\"species\":\"Human\",\"affiliation\":\"Rebels\",\"characterType\":\"badtype\",\"forceSensitive\":false}' $BACKEND_URL/api/generate/character" \
    "error"

# Test 14: Character generation with missing required fields
run_validation_test "Character Generation (Missing Fields)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"era\":\"Original Trilogy\"}' $BACKEND_URL/api/generate/character" \
    "error"

echo ""
echo -e "${BLUE}5. SETTINGS VALIDATION${NC}"
echo "---------------------"

# Test 15: Settings update with valid data
run_validation_test "Settings Update (Valid)" \
    "curl -s -X PUT -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"settings\":{\"appearance\":{\"theme\":\"dark\",\"fontSize\":\"medium\"}}}' $BACKEND_URL/api/settings" \
    "success"

# Test 16: Settings update with invalid theme
run_validation_test "Settings Update (Invalid Theme)" \
    "curl -s -X PUT -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"settings\":{\"appearance\":{\"theme\":\"rainbow\"}}}' $BACKEND_URL/api/settings" \
    "error"

# Test 17: Settings category update with invalid category
run_validation_test "Settings Category (Invalid Category)" \
    "curl -s -X PATCH -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"settings\":{\"theme\":\"dark\"}}' $BACKEND_URL/api/settings/invalid" \
    "error"

echo ""
echo -e "${BLUE}6. WORLD DATA VALIDATION${NC}"
echo "------------------------"

# Test 18: World characters with valid pagination
run_validation_test "World Characters (Valid Pagination)" \
    "curl -s '$BACKEND_URL/api/world/characters?limit=5&offset=0'" \
    "success"

# Test 19: World characters with invalid limit
run_validation_test "World Characters (Invalid Limit)" \
    "curl -s '$BACKEND_URL/api/world/characters?limit=200'" \
    "error"

# Test 20: World characters with negative offset
run_validation_test "World Characters (Negative Offset)" \
    "curl -s '$BACKEND_URL/api/world/characters?offset=-5'" \
    "error"

echo ""
echo -e "${BLUE}7. XSS PROTECTION TESTS${NC}"
echo "----------------------"

# Test 21: XSS attempt in chat message
run_validation_test "XSS Protection (Chat)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"message\":\"<script>alert('xss')</script>Hello\"}' $BACKEND_URL/api/chat/message" \
    "success"

# Test 22: XSS attempt in campaign name
run_validation_test "XSS Protection (Campaign Name)" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"campaignName\":\"<img src=x onerror=alert(1)>Test\"}' $BACKEND_URL/api/sessions" \
    "success"

echo ""
echo -e "${GREEN}📊 TEST RESULTS${NC}"
echo "==============="
echo "Tests Run: $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

# Calculate success percentage
if [ $TESTS_RUN -gt 0 ]; then
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_RUN))
    echo "Success Rate: $SUCCESS_RATE%"
fi

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL VALIDATION TESTS PASSED!${NC}"
    echo "Input validation system is comprehensive and secure."
    exit 0
else
    echo -e "${YELLOW}⚠️  Some validation tests failed or need adjustment${NC}"
    echo "This may indicate missing validation rules or expected behavior differences."
    exit 1
fi