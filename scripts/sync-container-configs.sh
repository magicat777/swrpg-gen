#!/bin/bash

# Container Configuration Synchronization Script
# Fixes critical differences between dev and production configurations

set -e

PROJECT_ROOT="/home/magic/projects/swrpg-gen"
cd "$PROJECT_ROOT"

echo "🔧 Synchronizing Container Configurations"
echo "========================================"

# Backup original production config
if [ ! -f "docker-compose.prod.yml.backup" ]; then
    cp docker-compose.prod.yml docker-compose.prod.yml.backup
    echo "✅ Created backup of docker-compose.prod.yml"
fi

echo "🔨 Applying critical fixes..."

# Fix 1: Resolve port conflict - Change Grafana port from 3001 to 3002
echo "1. Fixing port conflict: Grafana 3001 → 3002"
sed -i 's/- "3001:3000"/- "3002:3000"/' docker-compose.prod.yml

# Fix 2: Add missing environment variables to production backend
echo "2. Adding missing backend environment variables"

# Create a temporary file with the enhanced backend config
cat > /tmp/backend_prod_config.yml << 'EOF'
  backend:
    build:
      context: ./src/backend
    environment:
      - NODE_ENV=production
      - PORT=3000
      - LOG_LEVEL=info
      - JWT_SECRET=${JWT_SECRET:-your_production_jwt_secret_here}
      - LOCALAI_API_URL=http://localai:8080
      - LOCALAI_API_KEY=${LOCALAI_API_KEY:-change_this_key}
      - LOCALAI_DEFAULT_MODEL=mistral-7b-instruct-v0.2.Q5_K_M
      - MONGODB_URI=mongodb://${MONGO_ROOT_USERNAME:-admin}:${MONGO_ROOT_PASSWORD:-your_mongo_password_here}@mongodb:27017/swrpg?authSource=admin
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USER=neo4j
      - NEO4J_PASSWORD=${NEO4J_PASSWORD:-your_neo4j_password_here}
      - WEAVIATE_HOST=weaviate
      - WEAVIATE_PORT=8080
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
EOF

# Fix 3: Add LocalAI CUDA optimizations to production
echo "3. Adding LocalAI CUDA optimizations"
cat > /tmp/localai_prod_config.yml << 'EOF'
  localai:
    environment:
      - MODELS_PATH=/models
      - REBUILD=false
      - BUILD_CACHE_PATH=/build/cache
      - LOG_LEVEL=warn
      - THREADS=8
      - F16=true
      - CONTEXT_SIZE=8192
      - DEBUG=false
      - GPU_LAYERS=40
      - PARALLEL=4
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G
      restart_policy:
        condition: on-failure
        delay: 10s
        max_attempts: 3
EOF

# Fix 4: Add missing production volumes
echo "4. Adding missing volumes configuration"
if ! grep -q "localai_build_cache:" docker-compose.prod.yml; then
    cat >> docker-compose.prod.yml << 'EOF'

  localai_build_cache:
    driver: local
EOF
fi

echo "✅ Core synchronization fixes applied"

echo -e "\n📋 MANUAL FIXES STILL NEEDED:"
echo "1. Review and update environment variable defaults"
echo "2. Test production configuration with: docker-compose -f docker-compose.yml -f docker-compose.prod.yml config"
echo "3. Add health checks to database services in production"
echo "4. Add service dependencies (depends_on) to production config"
echo "5. Add container names and network configuration"

echo -e "\n🎯 RECOMMENDED NEXT STEPS:"
echo "1. Create docker-compose.override.yml for local development"
echo "2. Use docker-compose.prod.yml as production-specific overrides only"
echo "3. Implement CI/CD pipeline to validate configurations"
echo "4. Add environment-specific .env files"

echo -e "\n✅ Container synchronization partially completed!"
echo "🔍 Run validation script again to check remaining issues."