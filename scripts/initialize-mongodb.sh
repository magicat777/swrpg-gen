#!/bin/bash

# Initialize MongoDB schema validation for Star Wars RPG Generator
cd /home/magic/projects/swrpg-gen

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Initializing MongoDB schema validation...${NC}"

# Wait for MongoDB to be ready
echo -e "${YELLOW}Waiting for MongoDB to be ready...${NC}"
until docker exec swrpg-mongodb mongosh -u admin -p password --authenticationDatabase admin --eval "db.adminCommand('ping');" > /dev/null 2>&1; do
  echo "MongoDB not ready yet, waiting 5 seconds..."
  sleep 5
done

echo -e "${GREEN}MongoDB is ready. Applying schema validation...${NC}"

# Apply schema validation from the script
docker exec -i swrpg-mongodb mongosh -u admin -p password --authenticationDatabase admin < /home/magic/projects/swrpg-gen/config/database/mongo-schema-validation.js

if [ $? -eq 0 ]; then
  echo -e "${GREEN}MongoDB schema validation initialized successfully!${NC}"
else
  echo -e "${RED}Failed to initialize MongoDB schema validation. Check the error output above.${NC}"
  exit 1
fi