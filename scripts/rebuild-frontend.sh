#!/bin/bash

echo "🎨 Rebuilding Frontend Container (WSL2/Docker Safe)"
echo "=================================================="
echo ""

echo "🛑 Stopping frontend..."
docker-compose stop frontend

echo "🗑️ Removing old frontend container and image..."
docker-compose rm -f frontend
docker rmi swrpg-gen-frontend:latest 2>/dev/null || echo "Image already removed"

echo "🔧 Rebuilding frontend (no cache)..."
docker-compose build --no-cache frontend

echo "🚀 Starting frontend..."
docker-compose up -d frontend

echo "⏳ Waiting for startup..."
sleep 15

echo "🔍 Verifying frontend health..."
curl -s "http://localhost:3001" > /dev/null && echo "✅ Frontend rebuilt successfully" || echo "❌ Frontend rebuild failed"

echo "📋 Container status:"
docker-compose ps | grep frontend