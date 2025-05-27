#!/bin/bash
set -e

echo "Starting SWRPG-GEN deployment..."

# Load environment
source /opt/swrpg-gen/.env

# Pull latest images
docker compose pull

# Deploy services in order
echo "Starting databases..."
docker compose up -d neo4j mongodb weaviate

echo "Waiting for databases to be ready..."
sleep 30

echo "Starting AI services..."
docker compose up -d localai t2v-transformers

echo "Waiting for AI services..."
sleep 20

echo "Starting application services..."
docker compose up -d backend frontend

echo "Starting monitoring..."
docker compose up -d prometheus grafana

echo "Deployment complete!"
docker compose ps