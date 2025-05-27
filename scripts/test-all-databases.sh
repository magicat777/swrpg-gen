#!/bin/bash

# Test all databases for Star Wars RPG Generator
cd /home/magic/projects/swrpg-gen

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Testing all databases for Star Wars RPG Generator${NC}"
echo -e "===================================================="

# Test MongoDB
echo -e "\n${YELLOW}Testing MongoDB...${NC}"
if docker exec -i swrpg-mongodb mongosh -u admin -p password --authenticationDatabase admin --eval "db.adminCommand('ping');" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ MongoDB is working${NC}"
  
  # Count users
  users_count=$(docker exec -i swrpg-mongodb mongosh -u admin -p password --authenticationDatabase admin --quiet --eval "db = db.getSiblingDB('swrpg'); db.users.countDocuments()")
  echo "   Users count: $users_count"
  
  # List collections
  collections=$(docker exec -i swrpg-mongodb mongosh -u admin -p password --authenticationDatabase admin --quiet --eval "db = db.getSiblingDB('swrpg'); db.getCollectionNames()")
  echo "   Collections: $collections"
else
  echo -e "${RED}❌ MongoDB is not responding${NC}"
fi

# Test Neo4j
echo -e "\n${YELLOW}Testing Neo4j...${NC}"
if docker exec -i swrpg-neo4j cypher-shell -u neo4j -p password "RETURN 1;" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Neo4j is working${NC}"
  
  # Count characters
  characters_count=$(docker exec -i swrpg-neo4j cypher-shell -u neo4j -p password "MATCH (c:Character) RETURN count(c) AS count;")
  echo "   Characters count: $(echo "$characters_count" | grep -v "count" | tr -d '[:space:]')"
  
  # List character names
  character_names=$(docker exec -i swrpg-neo4j cypher-shell -u neo4j -p password "MATCH (c:Character) RETURN c.name;")
  echo "   Character names:"
  echo "$character_names" | grep -v "c.name" | sed 's/^/      /'
else
  echo -e "${RED}❌ Neo4j is not responding${NC}"
fi

# Test Weaviate
echo -e "\n${YELLOW}Testing Weaviate...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/v1/meta | grep -q "200"; then
  echo -e "${GREEN}✅ Weaviate is working${NC}"
  
  # Count objects by class
  class_counts=$(curl -s http://localhost:8080/v1/meta | jq '.objects')
  echo "   Object counts: $class_counts"
  
  # List available classes
  classes=$(curl -s http://localhost:8080/v1/schema | jq -r '.classes[].class')
  echo "   Schema classes:"
  echo "$classes" | sed 's/^/      /'
else
  echo -e "${RED}❌ Weaviate is not responding${NC}"
fi

echo -e "\n${GREEN}All tests completed!${NC}"
echo -e "===================================================="
echo "MongoDB: http://localhost:27017 (admin/password)"
echo "Neo4j:   http://localhost:7474/browser/ (neo4j/password)"
echo "         bolt://localhost:7687"
echo "Weaviate: http://localhost:8080/v1/console"