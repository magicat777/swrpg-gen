#!/bin/bash

echo "SWRPG-GEN Health Check"
echo "====================="

# Check services
services=("neo4j" "mongodb" "weaviate" "localai" "backend" "frontend")

for service in "${services[@]}"; do
    if docker compose ps --services --filter "status=running" | grep -q "^${service}$"; then
        echo "✓ $service: Running"
    else
        echo "✗ $service: Not running"
    fi
done

# Check endpoints
echo -e "\nEndpoint Checks:"
curl -s -o /dev/null -w "Backend API: %{http_code}\n" http://localhost:3000/api/health
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3001/
curl -s -o /dev/null -w "Neo4j: %{http_code}\n" http://localhost:7474/
curl -s -o /dev/null -w "Weaviate: %{http_code}\n" http://localhost:8080/v1/.well-known/ready