#!/bin/bash

# Create scripts directory if it doesn't exist
mkdir -p /home/magic/projects/swrpg-gen/scripts

# Test MongoDB only to verify Docker Compose functionality
cd /home/magic/projects/swrpg-gen

echo "Starting MongoDB container only..."
docker-compose up -d mongodb

echo "Waiting for MongoDB to start..."
sleep 10

echo "Testing MongoDB connection..."
docker exec swrpg-mongodb mongosh -u admin -p password --authenticationDatabase admin --eval "db.runCommand({ ping: 1 })"

echo "Checking if initialization script was executed..."
docker exec swrpg-mongodb mongosh -u admin -p password --authenticationDatabase admin --eval "db = db.getSiblingDB('swrpg'); db.users.find({username: 'demo-user'}).pretty()"

echo "Test complete!"