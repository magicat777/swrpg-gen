#!/bin/bash

# Initialize Weaviate schema for Star Wars RPG Generator
cd /home/magic/projects/swrpg-gen

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Initializing Weaviate schema...${NC}"

# Wait for Weaviate to be ready
echo -e "${YELLOW}Waiting for Weaviate to be ready...${NC}"
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  ((attempt++))
  status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/v1/meta)
  
  if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}Weaviate is ready! (Attempt $attempt)${NC}"
    break
  fi
  
  if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}Failed to connect to Weaviate after $max_attempts attempts. Please check the container logs.${NC}"
    exit 1
  fi
  
  echo "Waiting... (Attempt $attempt)"
  sleep 2
done

# Apply schema
echo -e "\n${YELLOW}Applying Weaviate schema from file...${NC}"
curl -X POST \
  -H "Content-Type: application/json" \
  -d @/home/magic/projects/swrpg-gen/config/database/weaviate-schema.json \
  http://localhost:8080/v1/schema

if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}Weaviate schema applied successfully!${NC}"
else
  echo -e "\n${RED}Failed to apply Weaviate schema. Check the error output above.${NC}"
  exit 1
fi

# Add sample data
echo -e "\n${YELLOW}Adding sample data to Weaviate...${NC}"

# Function to add a character
add_character() {
  local name="$1"
  local description="$2"
  local species="$3"
  local occupation="$4"
  
  curl -X POST \
    -H "Content-Type: application/json" \
    -d "{
      \"class\": \"Character\",
      \"properties\": {
        \"name\": \"$name\",
        \"description\": \"$description\",
        \"species\": \"$species\",
        \"occupation\": \"$occupation\"
      }
    }" \
    http://localhost:8080/v1/objects
  
  # Add a small delay to prevent overwhelming Weaviate
  sleep 0.5
}

echo -e "${YELLOW}Adding Star Wars characters...${NC}"
add_character "Luke Skywalker" "Farm boy from Tatooine who became a Jedi Knight" "Human" "Jedi Knight"
add_character "Darth Vader" "Fallen Jedi and Dark Lord of the Sith" "Human" "Sith Lord"
add_character "Han Solo" "Smuggler captain of the Millennium Falcon" "Human" "Smuggler"
add_character "Leia Organa" "Princess of Alderaan and Rebel leader" "Human" "Princess/General"
add_character "Chewbacca" "Wookiee warrior and Han Solo's co-pilot" "Wookiee" "Co-pilot"

echo -e "\n${GREEN}Weaviate initialization complete!${NC}"
echo -e "You can now access Weaviate at http://localhost:8080/v1/console"