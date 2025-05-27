#!/bin/bash

# Test script for network connectivity between containers
cd /home/magic/projects/swrpg-gen

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Testing network connectivity between containers...${NC}"

# Start required services if not already running
docker-compose up -d mongodb neo4j

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Create a test container on the same network
echo -e "\n${YELLOW}== Testing Inter-Container Communication ==${NC}"

echo "Creating test container on the swrpg-network..."
docker run --rm --name swrpg-network-test --network swrpg-gen_swrpg-network alpine sh -c "apk add --no-cache curl iputils && echo 'Test container ready'"

# Test connectivity to MongoDB
echo -e "\n${YELLOW}Testing connectivity to MongoDB...${NC}"
docker exec swrpg-network-test ping -c 3 swrpg-mongodb
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Successfully pinged MongoDB container${NC}"
else
  echo -e "${RED}✗ Failed to ping MongoDB container${NC}"
fi

# Test connectivity to Neo4j
echo -e "\n${YELLOW}Testing connectivity to Neo4j...${NC}"
docker exec swrpg-network-test ping -c 3 swrpg-neo4j
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Successfully pinged Neo4j container${NC}"
else
  echo -e "${RED}✗ Failed to ping Neo4j container${NC}"
fi

# Test connectivity to host (from inside container)
echo -e "\n${YELLOW}Testing connectivity from container to host...${NC}"
docker exec swrpg-network-test ping -c 3 host.docker.internal
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Successfully pinged host from container${NC}"
else
  echo -e "${RED}✗ Failed to ping host from container${NC}"
  echo -e "${YELLOW}Note: This is expected in some Docker configurations${NC}"
fi

# Test port connectivity to MongoDB
echo -e "\n${YELLOW}Testing port connectivity to MongoDB (27017)...${NC}"
docker exec swrpg-network-test sh -c "nc -zv swrpg-mongodb 27017"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Successfully connected to MongoDB port${NC}"
else
  echo -e "${RED}✗ Failed to connect to MongoDB port${NC}"
fi

# Test port connectivity to Neo4j
echo -e "\n${YELLOW}Testing port connectivity to Neo4j (7687)...${NC}"
docker exec swrpg-network-test sh -c "nc -zv swrpg-neo4j 7687"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Successfully connected to Neo4j Bolt port${NC}"
else
  echo -e "${RED}✗ Failed to connect to Neo4j Bolt port${NC}"
fi

# Clean up test container
echo -e "\n${YELLOW}Cleaning up test container...${NC}"
docker stop swrpg-network-test >/dev/null 2>&1

echo -e "\n${YELLOW}== Testing Host-to-Container Access ==${NC}"

# Test access to MongoDB from host
echo -e "\n${YELLOW}Testing access to MongoDB from host...${NC}"
nc -zv localhost 27017
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Successfully connected to MongoDB from host${NC}"
else
  echo -e "${RED}✗ Failed to connect to MongoDB from host${NC}"
fi

# Test access to Neo4j from host
echo -e "\n${YELLOW}Testing access to Neo4j from host...${NC}"
nc -zv localhost 7474
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Successfully connected to Neo4j HTTP from host${NC}"
else
  echo -e "${RED}✗ Failed to connect to Neo4j HTTP from host${NC}"
fi

echo -e "\n${GREEN}Network connectivity testing complete!${NC}"