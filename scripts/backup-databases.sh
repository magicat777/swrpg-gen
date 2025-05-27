#!/bin/bash

# Backup Script for Star Wars RPG Generator Databases
# This script creates backups of all database volumes
# Usage: ./backup-databases.sh [backup_name]

# Set up variables
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME=${1:-"backup-$DATE"}
BACKUP_DIR="$PROJECT_DIR/backups/$BACKUP_NAME"

# Create backup directory
mkdir -p $BACKUP_DIR

# Print header
echo "==============================================" 
echo "Star Wars RPG Generator Database Backup"
echo "=============================================="
echo "Backup Name: $BACKUP_NAME"
echo "Backup Location: $BACKUP_DIR"
echo "Started at: $(date)"
echo "=============================================="

# Function to backup a Docker volume
backup_volume() {
    local volume_name=$1
    local backup_file=$2
    
    echo "Backing up $volume_name to $backup_file..."
    
    docker run --rm \
        -v swrpg-gen_${volume_name}:/data \
        -v $BACKUP_DIR:/backup \
        alpine tar -czf /backup/${backup_file} -C /data .
        
    if [ $? -eq 0 ]; then
        echo "✅ Backup of $volume_name completed successfully."
    else
        echo "❌ Backup of $volume_name failed."
        exit 1
    fi
}

# Function to create MongoDB dump
backup_mongodb() {
    echo "Creating MongoDB database dump..."
    
    # Create temporary directory for MongoDB dump
    mkdir -p $BACKUP_DIR/mongodb
    
    # Run mongodump inside the container
    docker exec swrpg-mongodb mongodump \
        --username admin \
        --password password \
        --authenticationDatabase admin \
        --db swrpg \
        --out /data/db/backup
    
    # Copy dump from container to backup directory
    docker cp swrpg-mongodb:/data/db/backup $BACKUP_DIR/mongodb
    
    # Remove temporary dump directory in container
    docker exec swrpg-mongodb rm -rf /data/db/backup
    
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB dump completed successfully."
    else
        echo "❌ MongoDB dump failed."
    fi
}

# Function to create Neo4j dump
backup_neo4j_data() {
    echo "Creating Neo4j database backup..."
    
    # Stop Neo4j before backup to ensure consistency
    echo "Temporarily stopping Neo4j container..."
    docker stop swrpg-neo4j
    
    # Backup Neo4j volumes
    backup_volume "neo4j_data" "neo4j_data.tar.gz"
    backup_volume "neo4j_logs" "neo4j_logs.tar.gz"
    backup_volume "neo4j_plugins" "neo4j_plugins.tar.gz"
    
    # Restart Neo4j
    echo "Restarting Neo4j container..."
    docker start swrpg-neo4j
}

# Function to backup Weaviate data
backup_weaviate() {
    echo "Creating Weaviate backup..."
    
    # Stop Weaviate before backup to ensure consistency
    echo "Temporarily stopping Weaviate container..."
    docker stop swrpg-weaviate
    
    # Backup Weaviate volume
    backup_volume "weaviate_data" "weaviate_data.tar.gz"
    
    # Restart Weaviate
    echo "Restarting Weaviate container..."
    docker start swrpg-weaviate
}

# Backup transformer cache (optional)
backup_transformer_cache() {
    echo "Creating transformer cache backup..."
    backup_volume "transformer_cache" "transformer_cache.tar.gz"
}

# Backup LocalAI models
backup_localai_models() {
    echo "Creating LocalAI models backup..."
    backup_volume "localai_models" "localai_models.tar.gz"
}

# Create metadata file
create_metadata() {
    echo "Creating backup metadata..."
    
    cat > $BACKUP_DIR/metadata.json << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "containers": {
    "neo4j": "$(docker inspect --format='{{.Config.Image}}' swrpg-neo4j)",
    "mongodb": "$(docker inspect --format='{{.Config.Image}}' swrpg-mongodb)",
    "weaviate": "$(docker inspect --format='{{.Config.Image}}' swrpg-weaviate)",
    "t2v_transformers": "$(docker inspect --format='{{.Config.Image}}' swrpg-t2v)",
    "localai": "$(docker inspect --format='{{.Config.Image}}' swrpg-localai)"
  },
  "volumes": [
    "neo4j_data",
    "neo4j_logs",
    "neo4j_plugins",
    "mongodb_data",
    "weaviate_data",
    "transformer_cache",
    "localai_models"
  ]
}
EOF
}

# Run backups
backup_mongodb
backup_neo4j_data
backup_weaviate
backup_transformer_cache
backup_localai_models
create_metadata

# Create a combined backup archive (optional)
echo "Creating combined backup archive..."
cd $PROJECT_DIR/backups
tar -czf $BACKUP_NAME.tar.gz $BACKUP_NAME

# Print summary
echo "=============================================="
echo "Backup completed at: $(date)"
echo "Backup location: $BACKUP_DIR"
echo "Archive: $PROJECT_DIR/backups/$BACKUP_NAME.tar.gz"
echo "=============================================="