#!/bin/bash

# Test script for Weaviate
cd /home/magic/projects/swrpg-gen

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Testing Weaviate Vector Database...${NC}"

# Test 1: Check if Weaviate is running
echo -e "\n${YELLOW}Test 1: Checking Weaviate Status${NC}"
status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/v1/meta)
if [ "$status_code" = "200" ]; then
  echo -e "${GREEN}✅ Weaviate is running${NC}"
else
  echo -e "${RED}❌ Weaviate is not responding (HTTP $status_code)${NC}"
  exit 1
fi

# Test 2: Check schema
echo -e "\n${YELLOW}Test 2: Checking Weaviate Schema${NC}"
curl -s http://localhost:8080/v1/schema | jq '.classes[] | .class'

# Test 3: Test semantic search
echo -e "\n${YELLOW}Test 3: Testing Semantic Search${NC}"
search_json='{
  "query": {
    "nearText": {
      "concepts": ["jedi knight"],
      "certainty": 0.7
    }
  }
}'

echo -e "${YELLOW}Searching for 'jedi knight'...${NC}"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$search_json" \
  http://localhost:8080/v1/graphql | jq '.data.Get.Character[] | { name: .name, description: .description }'

# Test 4: Test vector embedding
echo -e "\n${YELLOW}Test 4: Testing Vector Embedding${NC}"
echo -e "${YELLOW}Adding a new character...${NC}"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "class": "Character",
    "properties": {
      "name": "Obi-Wan Kenobi",
      "description": "Wise Jedi Master and mentor to Anakin Skywalker",
      "species": "Human",
      "occupation": "Jedi Master"
    }
  }' \
  http://localhost:8080/v1/objects | jq '.id'

echo -e "\n${GREEN}All tests completed!${NC}"
echo "You can access the Weaviate Console at: http://localhost:8080/v1/console"