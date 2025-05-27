#!/bin/bash

# Cross-Database Validation Test Suite
# ====================================

echo "🔗 Cross-Database Validation Test Suite"
echo "========================================"
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

# Create admin test user and get token
echo "Setting up admin test user..."
ADMIN_USER="validationadmin_$(date +%s)"
ADMIN_PASSWORD="AdminTest123"

# Register admin user
curl -s -X POST $BACKEND_URL/api/auth/register \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$ADMIN_USER\",\"email\":\"${ADMIN_USER}@example.com\",\"password\":\"$ADMIN_PASSWORD\"}" \
    >/dev/null

# Update user to admin role (using MongoDB directly for testing)
if command -v mongosh >/dev/null 2>&1; then
    mongosh mongodb://admin:password@localhost:27017/swrpg --authenticationDatabase admin \
        --eval "db.users.updateOne({username:'$ADMIN_USER'}, {\$set: {roles: ['admin']}})" \
        >/dev/null 2>&1
fi

# Get admin token
ADMIN_TOKEN=$(curl -s -X POST $BACKEND_URL/api/auth/login \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASSWORD\"}" \
    | jq -r '.data.token' 2>/dev/null)

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}Failed to create admin user. Skipping admin tests.${NC}"
    SKIP_ADMIN=true
else
    echo -e "${GREEN}✓ Admin user created${NC}"
    SKIP_ADMIN=false
fi

# Create regular test user
TEST_USER="validationuser_$(date +%s)"
TEST_PASSWORD="UserTest123"
USER_TOKEN=$(curl -s -X POST $BACKEND_URL/api/auth/register \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$TEST_USER\",\"email\":\"${TEST_USER}@example.com\",\"password\":\"$TEST_PASSWORD\"}" \
    | jq -r '.data.token' 2>/dev/null)

if [ "$USER_TOKEN" = "null" ] || [ -z "$USER_TOKEN" ]; then
    echo -e "${RED}Failed to create regular user. Exiting.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Regular user created${NC}"
echo ""

echo -e "${BLUE}1. VALIDATION STATUS TESTS${NC}"
echo "---------------------------"

# Test 1: Get validation status (should work for regular users)
run_validation_test "Validation Status (Regular User)" \
    "curl -s -H 'Authorization: Bearer $USER_TOKEN' $BACKEND_URL/api/validation/status" \
    "success"

if [ "$SKIP_ADMIN" = false ]; then
    # Test 2: Get validation status (admin user)
    run_validation_test "Validation Status (Admin User)" \
        "curl -s -H 'Authorization: Bearer $ADMIN_TOKEN' $BACKEND_URL/api/validation/status" \
        "success"
fi

# Test 3: Validation status without authentication
run_validation_test "Validation Status (Unauthenticated)" \
    "curl -s $BACKEND_URL/api/validation/status" \
    "error"

echo ""
echo -e "${BLUE}2. CROSS-DATABASE VALIDATION TESTS${NC}"
echo "----------------------------------"

if [ "$SKIP_ADMIN" = false ]; then
    # Test 4: Run full database validation (admin only)
    run_validation_test "Full Database Validation (Admin)" \
        "curl -s -X POST -H 'Authorization: Bearer $ADMIN_TOKEN' $BACKEND_URL/api/validation/databases" \
        "success"

    # Test 5: Validate specific database (Neo4j)
    run_validation_test "Neo4j Validation (Admin)" \
        "curl -s -X POST -H 'Authorization: Bearer $ADMIN_TOKEN' $BACKEND_URL/api/validation/databases/neo4j" \
        "success"

    # Test 6: Validate specific database (MongoDB)
    run_validation_test "MongoDB Validation (Admin)" \
        "curl -s -X POST -H 'Authorization: Bearer $ADMIN_TOKEN' $BACKEND_URL/api/validation/databases/mongodb" \
        "success"

    # Test 7: Validate specific database (Weaviate)
    run_validation_test "Weaviate Validation (Admin)" \
        "curl -s -X POST -H 'Authorization: Bearer $ADMIN_TOKEN' $BACKEND_URL/api/validation/databases/weaviate" \
        "success"
else
    echo -e "${YELLOW}⚠ Skipping admin validation tests (no admin user)${NC}"
    TESTS_RUN=$((TESTS_RUN + 4))
fi

# Test 8: Regular user attempting full validation (should fail)
run_validation_test "Full Database Validation (Regular User)" \
    "curl -s -X POST -H 'Authorization: Bearer $USER_TOKEN' $BACKEND_URL/api/validation/databases" \
    "error"

# Test 9: Invalid database name
if [ "$SKIP_ADMIN" = false ]; then
    run_validation_test "Invalid Database Validation" \
        "curl -s -X POST -H 'Authorization: Bearer $ADMIN_TOKEN' $BACKEND_URL/api/validation/databases/invalid" \
        "error"
else
    echo -e "${YELLOW}⚠ Skipping invalid database test (no admin user)${NC}"
    TESTS_RUN=$((TESTS_RUN + 1))
fi

echo ""
echo -e "${BLUE}3. VALIDATION REPORT TESTS${NC}"
echo "-------------------------"

if [ "$SKIP_ADMIN" = false ]; then
    # Test 10: Generate validation report (admin only)
    run_validation_test "Generate Validation Report (Admin)" \
        "curl -s -H 'Authorization: Bearer $ADMIN_TOKEN' $BACKEND_URL/api/validation/report" \
        "success"
else
    echo -e "${YELLOW}⚠ Skipping validation report test (no admin user)${NC}"
    TESTS_RUN=$((TESTS_RUN + 1))
fi

# Test 11: Regular user attempting to generate report (should fail)
run_validation_test "Generate Validation Report (Regular User)" \
    "curl -s -H 'Authorization: Bearer $USER_TOKEN' $BACKEND_URL/api/validation/report" \
    "error"

echo ""
echo -e "${BLUE}4. VALIDATION REPAIR TESTS${NC}"
echo "-------------------------"

if [ "$SKIP_ADMIN" = false ]; then
    # Test 12: Valid repair request (admin only)
    run_validation_test "Validation Repair (Valid Request)" \
        "curl -s -X POST -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"repairSuggestion\":{\"action\":\"create\",\"database\":\"weaviate\",\"entity\":\"WorldKnowledge\",\"details\":{\"title\":\"Test\",\"content\":\"Test content\"}}}' $BACKEND_URL/api/validation/repair" \
        "success"

    # Test 13: Invalid repair request (missing fields)
    run_validation_test "Validation Repair (Invalid Request)" \
        "curl -s -X POST -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"repairSuggestion\":{\"action\":\"invalid\"}}' $BACKEND_URL/api/validation/repair" \
        "error"
else
    echo -e "${YELLOW}⚠ Skipping validation repair tests (no admin user)${NC}"
    TESTS_RUN=$((TESTS_RUN + 2))
fi

# Test 14: Regular user attempting repair (should fail)
run_validation_test "Validation Repair (Regular User)" \
    "curl -s -X POST -H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json' -d '{\"repairSuggestion\":{\"action\":\"create\",\"database\":\"weaviate\",\"entity\":\"WorldKnowledge\",\"details\":{}}}' $BACKEND_URL/api/validation/repair" \
    "error"

echo ""
echo -e "${BLUE}5. INTEGRATION TESTS${NC}"
echo "-------------------"

if [ "$SKIP_ADMIN" = false ]; then
    # Test 15: Verify validation results contain expected structure
    echo -n "Testing: Validation Result Structure... "
    validation_response=$(curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" $BACKEND_URL/api/validation/databases)
    
    # Check if response contains expected fields
    has_summary=$(echo "$validation_response" | jq -e '.data.summary' >/dev/null 2>&1 && echo "true" || echo "false")
    has_validation=$(echo "$validation_response" | jq -e '.data.validation' >/dev/null 2>&1 && echo "true" || echo "false")
    
    if [ "$has_summary" = "true" ] && [ "$has_validation" = "true" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Missing expected fields in validation response"
        ((TESTS_FAILED++))
    fi
    ((TESTS_RUN++))

    # Test 16: Verify status endpoint returns database health
    echo -n "Testing: Status Response Structure... "
    status_response=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" $BACKEND_URL/api/validation/status)
    
    has_databases=$(echo "$status_response" | jq -e '.data.validationStatus.summary.databases' >/dev/null 2>&1 && echo "true" || echo "false")
    has_issues=$(echo "$status_response" | jq -e '.data.validationStatus.summary.issues' >/dev/null 2>&1 && echo "true" || echo "false")
    
    if [ "$has_databases" = "true" ] && [ "$has_issues" = "true" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Missing expected fields in status response"
        ((TESTS_FAILED++))
    fi
    ((TESTS_RUN++))
else
    echo -e "${YELLOW}⚠ Skipping integration tests (no admin user)${NC}"
    TESTS_RUN=$((TESTS_RUN + 2))
fi

echo ""
echo -e "${GREEN}📊 TEST RESULTS${NC}"
echo "==============="
echo "Tests Run: $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ "$SKIP_ADMIN" = true ]; then
    echo -e "${YELLOW}Note: Some tests were skipped due to admin user setup issues${NC}"
fi

echo ""

# Calculate success percentage
if [ $TESTS_RUN -gt 0 ]; then
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_RUN))
    echo "Success Rate: $SUCCESS_RATE%"
fi

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL VALIDATION TESTS PASSED!${NC}"
    echo "Cross-database validation system is working correctly."
    exit 0
else
    echo -e "${YELLOW}⚠️  Some validation tests failed${NC}"
    echo "Please review the failed tests above."
    exit 1
fi