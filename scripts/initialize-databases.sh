#!/bin/bash

# Database Initialization Script for Star Wars RPG Generator
# This script initializes database schemas after containers are running
# Usage: ./initialize-databases.sh

# Set up variables
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Print header
echo "=============================================="
echo "Star Wars RPG Generator Database Initialization"
echo "=============================================="
echo "Started at: $(date)"
echo "=============================================="

# Check if containers are running
echo "Checking if database containers are running..."
if ! docker ps | grep -q swrpg-mongodb || ! docker ps | grep -q swrpg-neo4j || ! docker ps | grep -q swrpg-weaviate; then
    echo "Error: Not all required database containers are running"
    echo "Please start the containers with 'docker-compose up -d' first"
    exit 1
fi

# Initialize Neo4j Schema
initialize_neo4j() {
    echo "Initializing Neo4j schema..."
    
    # Wait for Neo4j to be ready
    echo "Waiting for Neo4j to be ready..."
    until docker exec swrpg-neo4j cypher-shell -u neo4j -p password "RETURN 'Neo4j is ready';" > /dev/null 2>&1; do
        echo "Neo4j not ready yet, waiting..."
        sleep 5
    done
    
    # Load schema from file
    echo "Loading Neo4j schema from file..."
    cat $PROJECT_DIR/config/database/neo4j-init.cypher | docker exec -i swrpg-neo4j cypher-shell -u neo4j -p password
    
    if [ $? -eq 0 ]; then
        echo "✅ Neo4j schema initialized successfully."
    else
        echo "❌ Neo4j schema initialization failed."
        exit 1
    fi
}

# Initialize MongoDB Schema Validation
initialize_mongodb() {
    echo "Initializing MongoDB schema validation..."
    
    # Wait for MongoDB to be ready
    echo "Waiting for MongoDB to be ready..."
    until docker exec swrpg-mongodb mongosh -u admin -p password --authenticationDatabase admin --eval "db.adminCommand('ping');" > /dev/null 2>&1; do
        echo "MongoDB not ready yet, waiting..."
        sleep 5
    done
    
    # Load schema validation from file
    echo "Loading MongoDB schema validation from file..."
    cat $PROJECT_DIR/config/database/mongo-schema-validation.js | docker exec -i swrpg-mongodb mongosh -u admin -p password --authenticationDatabase admin
    
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB schema validation initialized successfully."
    else
        echo "❌ MongoDB schema validation initialization failed."
        exit 1
    fi
}

# Initialize Weaviate Schema
initialize_weaviate() {
    echo "Initializing Weaviate schema..."
    
    # Wait for Weaviate to be ready
    echo "Waiting for Weaviate to be ready..."
    until curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/v1/meta | grep -q 200; do
        echo "Weaviate not ready yet, waiting..."
        sleep 5
    done
    
    # Apply schema
    echo "Applying Weaviate schema..."
    curl -X POST \
        -H "Content-Type: application/json" \
        -d @$PROJECT_DIR/config/database/weaviate-schema.json \
        http://localhost:8080/v1/schema
    
    if [ $? -eq 0 ]; then
        echo "✅ Weaviate schema initialized successfully."
    else
        echo "❌ Weaviate schema initialization failed."
        exit 1
    fi
}

# Run initializations
initialize_neo4j
initialize_mongodb
initialize_weaviate

# Print summary
echo "=============================================="
echo "Database initialization completed at: $(date)"
echo "=============================================="
echo "Next steps:"
echo "1. Verify schemas with test queries:"
echo "   - Neo4j: http://localhost:7474 - Login with neo4j/password"
echo "   - Weaviate: http://localhost:8080/v1/console"
echo "   - MongoDB: Use mongo shell or client application"
echo "=============================================="