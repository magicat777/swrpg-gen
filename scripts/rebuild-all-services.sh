#!/bin/bash

echo "🚀 Rebuilding All Services (WSL2/Docker Safe)"
echo "=============================================="
echo ""

echo "🛑 Stopping all services..."
docker-compose down

echo "🗑️ Cleaning up old containers and images..."
docker-compose rm -f
docker rmi swrpg-gen-backend:latest swrpg-gen-frontend:latest 2>/dev/null || echo "Images already removed"

echo "🔧 Rebuilding all services (no cache)..."
docker-compose build --no-cache

echo "🚀 Starting all services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 20

echo "🔍 Verifying all services..."
echo ""
echo "Backend Health:"
curl -s "http://localhost:3000/api/health" && echo "" || echo "❌ Backend failed"

echo ""
echo "Frontend Health:"
curl -s "http://localhost:3001" > /dev/null && echo "✅ Frontend responding" || echo "❌ Frontend failed"

echo ""
echo "📋 All container status:"
docker-compose ps

echo ""
echo "✨ Complete rebuild finished!"