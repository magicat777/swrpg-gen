#!/bin/bash

# Test Neo4j to verify Docker Compose functionality
cd /home/magic/projects/swrpg-gen

echo "Starting Neo4j container..."
docker-compose up -d neo4j

echo "Waiting for Neo4j to start (this may take a minute)..."
sleep 30

echo "Testing Neo4j connection..."
docker exec swrpg-neo4j cypher-shell -u neo4j -p password "RETURN 'Neo4j is working!' AS message;"

echo "Test complete!"