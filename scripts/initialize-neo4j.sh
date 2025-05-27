#!/bin/bash

# Initialize Neo4j schema for Star Wars RPG Generator
cd /home/magic/projects/swrpg-gen

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Initializing Neo4j schema...${NC}"

# Wait for Neo4j to be ready
echo -e "${YELLOW}Waiting for Neo4j to be ready...${NC}"
until docker exec swrpg-neo4j cypher-shell -u neo4j -p password "RETURN 1;" > /dev/null 2>&1; do
  echo "Neo4j not ready yet, waiting 5 seconds..."
  sleep 5
done

echo -e "${GREEN}Neo4j is ready. Applying schema...${NC}"

# Apply constraints and indexes from the initialization script
cat /home/magic/projects/swrpg-gen/config/database/neo4j-init.cypher | docker exec -i swrpg-neo4j cypher-shell -u neo4j -p password

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Neo4j schema initialized successfully!${NC}"
else
  echo -e "${RED}Failed to initialize Neo4j schema. Check the error output above.${NC}"
  exit 1
fi