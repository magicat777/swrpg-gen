#!/bin/bash

echo "🔧 Rebuilding Backend Container (WSL2/Docker Safe)"
echo "================================================"
echo ""

echo "🛑 Stopping backend..."
docker-compose stop backend

echo "🗑️ Removing old backend container and image..."
docker-compose rm -f backend
docker rmi swrpg-gen-backend:latest 2>/dev/null || echo "Image already removed"

echo "🔧 Rebuilding backend (no cache)..."
docker-compose build --no-cache backend

echo "🚀 Starting backend..."
docker-compose up -d backend

echo "⏳ Waiting for startup..."
sleep 10

echo "🔍 Verifying backend health..."
curl -s "http://localhost:3000/api/health" && echo "" && echo "✅ Backend rebuilt successfully" || echo "❌ Backend rebuild failed"

echo "📋 Container status:"
docker-compose ps | grep backend