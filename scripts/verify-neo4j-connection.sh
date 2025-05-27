#!/bin/bash

# Verify Neo4j Connection
cd /home/magic/projects/swrpg-gen

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Verifying Neo4j connection...${NC}"

# Wait for Neo4j to be ready
echo -e "${YELLOW}Waiting for Neo4j to be ready...${NC}"
for i in {1..30}; do
  if docker exec swrpg-neo4j cypher-shell -u neo4j -p password "RETURN 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}Neo4j is ready! (Attempt $i)${NC}"
    break
  fi
  
  if [ $i -eq 30 ]; then
    echo -e "${RED}Failed to connect to Neo4j after 30 attempts. Please check the container logs.${NC}"
    exit 1
  fi
  
  echo "Waiting... (Attempt $i)"
  sleep 2
done

# Check connection details
echo -e "\n${YELLOW}Connection Details:${NC}"
echo "Bolt URL: bolt://localhost:7687"
echo "HTTP URL: http://localhost:7474"
echo "Username: neo4j"
echo "Password: password"

# Run test query
echo -e "\n${YELLOW}Running test query to fetch character names:${NC}"
docker exec -i swrpg-neo4j cypher-shell -u neo4j -p password "MATCH (c:Character) RETURN c.name LIMIT 5;"

# Show Neo4j connection settings
echo -e "\n${YELLOW}Neo4j connection settings:${NC}"
docker exec -i swrpg-neo4j cypher-shell -u neo4j -p password "CALL dbms.listConfig() YIELD name, value WHERE name CONTAINS 'connector' OR name CONTAINS 'listen' RETURN name, value;"

echo -e "\n${GREEN}Connection verification complete. If all tests passed, you should be able to connect in the browser.${NC}"
echo "Browser URL: http://localhost:7474/browser/"