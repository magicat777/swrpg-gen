#!/bin/bash

# Run database tests for Star Wars RPG Generator
cd /home/magic/projects/swrpg-gen

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Running database tests...${NC}"

# Test MongoDB
echo -e "\n${YELLOW}Testing MongoDB...${NC}"
docker exec -i swrpg-mongodb mongosh -u admin -p password --authenticationDatabase admin < ./scripts/test-mongodb.js

# Test Neo4j
echo -e "\n${YELLOW}Testing Neo4j...${NC}"
cat ./scripts/test-neo4j.cypher | docker exec -i swrpg-neo4j cypher-shell -u neo4j -p password

# Test connections from MongoDB to Neo4j
echo -e "\n${YELLOW}Testing Inter-Database Communication...${NC}"
docker exec swrpg-mongodb ping -c 3 swrpg-neo4j

echo -e "\n${GREEN}All tests completed!${NC}"
echo "You can now proceed with initializing the database schemas:"
echo "  ./scripts/initialize-databases.sh"