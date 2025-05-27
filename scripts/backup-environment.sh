#!/bin/bash

# Star Wars RPG Generator - Environment Backup Script
# Creates a complete backup of the Docker environment and source code

set -e

PROJECT_DIR="/home/magic/projects/swrpg-gen"
BACKUP_BASE="/home/magic/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE/swrpg-$TIMESTAMP"

echo "🚀 Starting Star Wars RPG Generator Environment Backup..."
echo "📅 Timestamp: $TIMESTAMP"
echo "📁 Backup Directory: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

echo "📦 Creating backup directory structure..."

# Backup source code
echo "📋 Backing up source code..."
cp -r "$PROJECT_DIR" ./source
echo "✅ Source code backed up"

# Get container status before backup
echo "📊 Recording container status..."
cd "$PROJECT_DIR"
docker-compose ps > "$BACKUP_DIR/container-status.txt"
docker images | grep swrpg > "$BACKUP_DIR/image-status.txt"
docker volume ls | grep swrpg > "$BACKUP_DIR/volume-status.txt"

# Export container images
echo "💾 Exporting container images..."
echo "  📦 Exporting frontend image..."
docker save swrpg-gen-frontend:latest | gzip > "$BACKUP_DIR/frontend-image.tar.gz"
echo "  📦 Exporting backend image..."
docker save swrpg-gen-backend:latest | gzip > "$BACKUP_DIR/backend-image.tar.gz"
echo "✅ Container images exported"

# Backup volumes
echo "🗄️ Backing up persistent volumes..."

echo "  📚 Backing up MongoDB data..."
docker run --rm \
  -v swrpg-gen_mongodb_data:/data \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf /backup/mongodb-data.tar.gz -C /data .

echo "  🕸️ Backing up Neo4j data..."
docker run --rm \
  -v swrpg-gen_neo4j_data:/data \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf /backup/neo4j-data.tar.gz -C /data .

echo "  🔍 Backing up Weaviate data..."
docker run --rm \
  -v swrpg-gen_weaviate_data:/data \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf /backup/weaviate-data.tar.gz -C /data .

echo "  🤖 Backing up LocalAI models..."
docker run --rm \
  -v swrpg-gen_localai_models:/data \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf /backup/localai-models.tar.gz -C /data .

echo "✅ All volumes backed up"

# Create backup manifest
echo "📋 Creating backup manifest..."
cat > "$BACKUP_DIR/backup-manifest.txt" << EOF
Star Wars RPG Generator - Environment Backup
============================================

Backup Date: $(date)
Backup Directory: $BACKUP_DIR
Project Directory: $PROJECT_DIR

Components Backed Up:
- ✅ Source Code (complete project directory)
- ✅ Frontend Container Image (swrpg-gen-frontend:latest)
- ✅ Backend Container Image (swrpg-gen-backend:latest)
- ✅ MongoDB Data Volume (sessions, messages, settings)
- ✅ Neo4j Data Volume (graph database, Star Wars entities)
- ✅ Weaviate Data Volume (vector embeddings, semantic search)
- ✅ LocalAI Models Volume (Mistral 7B model files)

Container Status at Backup:
$(cat container-status.txt)

Image Status at Backup:
$(cat image-status.txt)

Volume Status at Backup:
$(cat volume-status.txt)

Backup File Sizes:
$(ls -lh *.tar.gz 2>/dev/null || echo "No .tar.gz files found")

To restore this backup, run:
  ./restore-environment.sh $BACKUP_DIR

EOF

# Create restore script
echo "🔧 Creating restore script..."
cat > "$BACKUP_DIR/restore-environment.sh" << 'EOF'
#!/bin/bash

# Star Wars RPG Generator - Environment Restore Script

set -e

BACKUP_DIR="$1"
PROJECT_DIR="/home/magic/projects/swrpg-gen"

if [ -z "$BACKUP_DIR" ]; then
    echo "❌ Error: Please provide backup directory path"
    echo "Usage: $0 /path/to/backup/directory"
    exit 1
fi

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: Backup directory does not exist: $BACKUP_DIR"
    exit 1
fi

echo "🚀 Starting Star Wars RPG Generator Environment Restore..."
echo "📁 Backup Directory: $BACKUP_DIR"
echo "📁 Project Directory: $PROJECT_DIR"

# Stop existing environment
echo "🛑 Stopping existing environment..."
cd "$PROJECT_DIR"
docker-compose down -v || true

# Restore source code
echo "📋 Restoring source code..."
if [ -d "$BACKUP_DIR/source" ]; then
    rm -rf "$PROJECT_DIR"
    cp -r "$BACKUP_DIR/source" "$PROJECT_DIR"
    echo "✅ Source code restored"
else
    echo "❌ Error: Source code backup not found"
    exit 1
fi

cd "$BACKUP_DIR"

# Load container images
echo "💾 Loading container images..."
if [ -f "frontend-image.tar.gz" ]; then
    echo "  📦 Loading frontend image..."
    docker load < frontend-image.tar.gz
else
    echo "⚠️ Warning: Frontend image backup not found"
fi

if [ -f "backend-image.tar.gz" ]; then
    echo "  📦 Loading backend image..."
    docker load < backend-image.tar.gz
else
    echo "⚠️ Warning: Backend image backup not found"
fi

# Restore volumes
echo "🗄️ Restoring persistent volumes..."

echo "  📚 Creating MongoDB volume..."
docker volume create swrpg-gen_mongodb_data || true
if [ -f "mongodb-data.tar.gz" ]; then
    docker run --rm \
        -v swrpg-gen_mongodb_data:/data \
        -v "$BACKUP_DIR":/backup \
        alpine tar xzf /backup/mongodb-data.tar.gz -C /data
    echo "✅ MongoDB data restored"
else
    echo "⚠️ Warning: MongoDB backup not found"
fi

echo "  🕸️ Creating Neo4j volume..."
docker volume create swrpg-gen_neo4j_data || true
if [ -f "neo4j-data.tar.gz" ]; then
    docker run --rm \
        -v swrpg-gen_neo4j_data:/data \
        -v "$BACKUP_DIR":/backup \
        alpine tar xzf /backup/neo4j-data.tar.gz -C /data
    echo "✅ Neo4j data restored"
else
    echo "⚠️ Warning: Neo4j backup not found"
fi

echo "  🔍 Creating Weaviate volume..."
docker volume create swrpg-gen_weaviate_data || true
if [ -f "weaviate-data.tar.gz" ]; then
    docker run --rm \
        -v swrpg-gen_weaviate_data:/data \
        -v "$BACKUP_DIR":/backup \
        alpine tar xzf /backup/weaviate-data.tar.gz -C /data
    echo "✅ Weaviate data restored"
else
    echo "⚠️ Warning: Weaviate backup not found"
fi

echo "  🤖 Creating LocalAI volume..."
docker volume create swrpg-gen_localai_models || true
if [ -f "localai-models.tar.gz" ]; then
    docker run --rm \
        -v swrpg-gen_localai_models:/data \
        -v "$BACKUP_DIR":/backup \
        alpine tar xzf /backup/localai-models.tar.gz -C /data
    echo "✅ LocalAI models restored"
else
    echo "⚠️ Warning: LocalAI models backup not found"
fi

# Start environment
echo "🚀 Starting restored environment..."
cd "$PROJECT_DIR"
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔍 Checking service health..."
docker-compose ps

echo ""
echo "✅ Environment restore complete!"
echo ""
echo "🌐 Frontend: http://localhost:3001"
echo "🔧 Backend API: http://localhost:3000/api/health"
echo "📊 Backend Health: http://localhost:3000/api/health/detailed"
echo ""
echo "📋 Verify the following:"
echo "  - All 6 containers are running and healthy"
echo "  - Frontend loads with backend connectivity status"
echo "  - Database queries work correctly"
echo "  - Settings and session management functional"
EOF

chmod +x "$BACKUP_DIR/restore-environment.sh"

# Calculate backup size
echo "📊 Calculating backup size..."
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo ""
echo "✅ Backup Complete!"
echo "📁 Backup Location: $BACKUP_DIR"
echo "💾 Backup Size: $BACKUP_SIZE"
echo "📋 Manifest: $BACKUP_DIR/backup-manifest.txt"
echo "🔧 Restore Script: $BACKUP_DIR/restore-environment.sh"
echo ""
echo "To restore this backup later:"
echo "  $BACKUP_DIR/restore-environment.sh $BACKUP_DIR"
echo ""
echo "🎉 Star Wars RPG Generator environment successfully backed up!"
EOF

chmod +x /home/magic/projects/swrpg-gen/scripts/backup-environment.sh