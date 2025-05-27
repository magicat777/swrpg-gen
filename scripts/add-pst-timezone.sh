#!/bin/bash

# Add PST Timezone to All Containers
# This script adds TZ=America/Los_Angeles to all services in docker-compose.yml

set -e

echo "🕒 Adding PST Timezone to All Containers"
echo "========================================"

# Backup original docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup

# Create timezone environment variable addition
TIMEZONE_VAR="      - TZ=America/Los_Angeles"

echo "🔧 Adding timezone to services..."

# Add timezone to each service that has environment section
services=("neo4j" "mongodb" "weaviate" "localai" "backend" "frontend" "grafana")

for service in "${services[@]}"; do
    echo "Adding timezone to $service..."
    
    # Find the line with "environment:" for this service and add TZ after it
    awk -v service="$service" -v tz="$TIMEZONE_VAR" '
    BEGIN { in_service = 0; found_env = 0 }
    /^  [a-z]/ { 
        current_service = $1
        gsub(/:$/, "", current_service)
        in_service = (current_service == service)
        found_env = 0
    }
    /^    environment:/ && in_service && !found_env {
        print $0
        print tz
        found_env = 1
        next
    }
    { print }
    ' docker-compose.yml > docker-compose.yml.tmp && mv docker-compose.yml.tmp docker-compose.yml
done

# For services without environment section, add it
echo "🔧 Adding environment section for services that need it..."

# Add environment section to prometheus (doesn't have one)
sed -i '/^  prometheus:/,/^  [a-z]/ {
    /command:/i\    environment:\
      - TZ=America/Los_Angeles
}' docker-compose.yml

# Add environment section to node-exporter (doesn't have one)  
sed -i '/^  node-exporter:/,/^  [a-z]/ {
    /volumes:/i\    environment:\
      - TZ=America/Los_Angeles
}' docker-compose.yml

echo "✅ Timezone configuration added to all services"

echo "🔍 Verification - services with timezone:"
grep -A 1 "TZ=America/Los_Angeles" docker-compose.yml | grep -B 1 "TZ=America/Los_Angeles" | grep -v "TZ=America/Los_Angeles" | grep -v "^--$"

echo ""
echo "🚀 Ready to restart containers with PST timezone"
echo "Run: docker-compose down && docker-compose up -d"