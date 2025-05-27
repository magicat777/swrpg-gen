#!/bin/bash

# Restore Script for Star Wars RPG Generator Databases
# This script restores databases from a backup
# Usage: ./restore-databases.sh [backup_name]

# Set up variables
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_NAME=$1

# Check if backup name is provided
if [ -z "$BACKUP_NAME" ]; then
    echo "Error: Backup name is required"
    echo "Usage: ./restore-databases.sh [backup_name]"
    exit 1
fi

BACKUP_DIR="$PROJECT_DIR/backups/$BACKUP_NAME"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    # Check if it might be a tarball
    if [ -f "$PROJECT_DIR/backups/$BACKUP_NAME.tar.gz" ]; then
        echo "Found backup archive $BACKUP_NAME.tar.gz, extracting..."
        cd $PROJECT_DIR/backups
        tar -xzf $BACKUP_NAME.tar.gz
        if [ ! -d "$BACKUP_DIR" ]; then
            echo "Error: Failed to extract backup archive"
            exit 1
        fi
    else
        echo "Error: Backup directory $BACKUP_DIR does not exist"
        echo "Available backups:"
        ls -1 $PROJECT_DIR/backups | grep -v '\.tar\.gz$'
        exit 1
    fi
fi

# Print header
echo "=============================================="
echo "Star Wars RPG Generator Database Restore"
echo "=============================================="
echo "Backup Name: $BACKUP_NAME"
echo "Backup Location: $BACKUP_DIR"
echo "Started at: $(date)"
echo "=============================================="

# Check if metadata file exists
if [ ! -f "$BACKUP_DIR/metadata.json" ]; then
    echo "Warning: Metadata file not found, proceeding without verification"
fi

# Function to restore a Docker volume
restore_volume() {
    local volume_name=$1
    local backup_file=$2
    
    # Check if backup file exists
    if [ ! -f "$BACKUP_DIR/$backup_file" ]; then
        echo "Warning: Backup file $backup_file not found, skipping restore of $volume_name"
        return
    }
    
    echo "Restoring $volume_name from $backup_file..."
    
    # Make sure the volume exists
    if ! docker volume ls | grep -q "swrpg-gen_$volume_name"; then
        echo "Volume swrpg-gen_$volume_name does not exist, creating..."
        docker volume create swrpg-gen_$volume_name
    fi
    
    # Restore the volume
    docker run --rm \
        -v swrpg-gen_${volume_name}:/data \
        -v $BACKUP_DIR:/backup \
        alpine sh -c "rm -rf /data/* && tar -xzf /backup/${backup_file} -C /data"
        
    if [ $? -eq 0 ]; then
        echo "✅ Restore of $volume_name completed successfully."
    else
        echo "❌ Restore of $volume_name failed."
        exit 1
    fi
}

# Function to restore MongoDB from dump
restore_mongodb_dump() {
    echo "Restoring MongoDB from dump..."
    
    # Check if MongoDB dump directory exists
    if [ ! -d "$BACKUP_DIR/mongodb" ]; then
        echo "Warning: MongoDB dump directory not found, skipping restore of MongoDB data"
        return
    }
    
    # Copy dump to container
    docker cp $BACKUP_DIR/mongodb swrpg-mongodb:/data/db/restore
    
    # Run mongorestore inside the container
    docker exec swrpg-mongodb mongorestore \
        --username admin \
        --password password \
        --authenticationDatabase admin \
        --nsInclude "swrpg.*" \
        --drop \
        /data/db/restore
    
    # Remove temporary restore directory in container
    docker exec swrpg-mongodb rm -rf /data/db/restore
    
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB restore completed successfully."
    else
        echo "❌ MongoDB restore failed."
    fi
}

# Stop all containers before restore
echo "Stopping all containers..."
docker-compose -f $PROJECT_DIR/docker-compose.yml down

# Restore volumes
echo "Restoring database volumes..."
restore_volume "neo4j_data" "neo4j_data.tar.gz"
restore_volume "neo4j_logs" "neo4j_logs.tar.gz"
restore_volume "neo4j_plugins" "neo4j_plugins.tar.gz"
restore_volume "weaviate_data" "weaviate_data.tar.gz"
restore_volume "transformer_cache" "transformer_cache.tar.gz"
restore_volume "localai_models" "localai_models.tar.gz"

# Start the containers
echo "Starting containers..."
docker-compose -f $PROJECT_DIR/docker-compose.yml up -d

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to start..."
sleep 15

# Restore MongoDB dump if volume restore wasn't sufficient
restore_mongodb_dump

# Print summary
echo "=============================================="
echo "Restore completed at: $(date)"
echo "Restored from: $BACKUP_DIR"
echo "=============================================="
echo "Next steps:"
echo "1. Verify that all services are running:"
echo "   docker-compose ps"
echo "2. Check database connectivity:"
echo "   ./scripts/test-mongodb.sh"
echo "   ./scripts/test-neo4j.sh"
echo "=============================================="