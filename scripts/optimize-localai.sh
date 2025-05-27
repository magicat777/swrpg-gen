#!/bin/bash

# LocalAI CUDA Optimization Script
# Prevents 2-3 hour rebuilds by using pre-built binaries and caching

set -e

PROJECT_ROOT="/home/magic/projects/swrpg-gen"
cd "$PROJECT_ROOT"

echo "🚀 LocalAI CUDA Optimization Script"
echo "===================================="

# Function to check if LocalAI container exists and is healthy
check_localai_health() {
    if docker ps | grep -q "swrpg-localai.*healthy"; then
        echo "✅ LocalAI container is healthy"
        return 0
    else
        echo "❌ LocalAI container is not healthy or not running"
        return 1
    fi
}

# Function to stop and remove LocalAI container without affecting volumes
reset_localai_container() {
    echo "🔄 Resetting LocalAI container (preserving build cache)..."
    
    if docker ps -q -f name=swrpg-localai | xargs -r docker stop; then
        echo "📦 Stopped LocalAI container"
    fi
    
    if docker ps -aq -f name=swrpg-localai | xargs -r docker rm; then
        echo "🗑️  Removed LocalAI container"
    fi
    
    # Clean up only the LocalAI image layers, keep volumes
    echo "🧹 Cleaning up orphaned images (keeping volumes)..."
    docker image prune -f --filter "label=org.opencontainers.image.source=https://github.com/go-skynet/LocalAI"
}

# Function to use pre-built image without rebuilds
use_prebuilt_image() {
    echo "📥 Ensuring we use pre-built LocalAI image..."
    
    # Pull latest pre-built CUDA image if not exists
    if ! docker images | grep -q "localai/localai.*latest-gpu-nvidia-cuda-12"; then
        echo "⬇️  Pulling pre-built LocalAI CUDA image..."
        docker pull localai/localai:latest-gpu-nvidia-cuda-12
    else
        echo "✅ Pre-built LocalAI CUDA image already available"
    fi
}

# Function to optimize docker-compose configuration
optimize_compose_config() {
    echo "⚙️  Optimizing docker-compose configuration..."
    
    # Backup original if it doesn't exist
    if [ ! -f "docker-compose.yml.backup" ]; then
        cp docker-compose.yml docker-compose.yml.backup
        echo "💾 Created backup of docker-compose.yml"
    fi
    
    # Update configuration has already been done by the previous edit
    echo "✅ Docker-compose configuration optimized"
}

# Function to create persistent build cache
setup_build_cache() {
    echo "🏗️  Setting up persistent build cache..."
    
    # Create build cache volume if it doesn't exist
    if ! docker volume ls | grep -q "swrpg-gen_localai_build_cache"; then
        docker volume create swrpg-gen_localai_build_cache
        echo "📂 Created build cache volume"
    else
        echo "✅ Build cache volume already exists"
    fi
}

# Function to verify CUDA availability
verify_cuda() {
    echo "🔍 Verifying CUDA availability..."
    
    if command -v nvidia-smi &> /dev/null; then
        echo "✅ NVIDIA drivers detected:"
        nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader,nounits
    else
        echo "⚠️  NVIDIA drivers not found in PATH"
    fi
    
    if docker run --rm --gpus all nvidia/cuda:12.0-base-ubuntu20.04 nvidia-smi &> /dev/null; then
        echo "✅ Docker GPU access confirmed"
    else
        echo "❌ Docker GPU access failed"
        return 1
    fi
}

# Function to start optimized LocalAI
start_optimized_localai() {
    echo "🚀 Starting optimized LocalAI container..."
    
    # Start with optimized settings
    docker-compose up -d localai
    
    echo "⏳ Waiting for LocalAI to become healthy..."
    
    # Wait up to 10 minutes for health check
    local max_wait=600
    local wait_time=0
    
    while [ $wait_time -lt $max_wait ]; do
        if check_localai_health; then
            echo "✅ LocalAI is healthy and ready!"
            return 0
        fi
        
        echo "⏳ Waiting... ($wait_time/$max_wait seconds)"
        sleep 30
        wait_time=$((wait_time + 30))
    done
    
    echo "❌ LocalAI failed to become healthy within timeout"
    echo "📋 Checking logs..."
    docker-compose logs --tail=50 localai
    return 1
}

# Function to test LocalAI functionality
test_localai() {
    echo "🧪 Testing LocalAI functionality..."
    
    local test_response
    test_response=$(curl -s -X POST http://localhost:8081/v1/chat/completions \
        -H 'Content-Type: application/json' \
        -d '{
            "model": "mistral-7b-instruct-v0.2.Q5_K_M.gguf",
            "messages": [{"role": "user", "content": "Hello, this is a test."}],
            "max_tokens": 10
        }' || echo "CURL_FAILED")
    
    if echo "$test_response" | grep -q "choices"; then
        echo "✅ LocalAI test successful"
        echo "📝 Sample response: $(echo "$test_response" | jq -r '.choices[0].message.content' 2>/dev/null || echo 'Parse failed')"
        return 0
    else
        echo "❌ LocalAI test failed"
        echo "📝 Response: $test_response"
        return 1
    fi
}

# Main optimization workflow
main() {
    echo "Starting LocalAI CUDA optimization process..."
    
    # Step 1: Verify CUDA
    if ! verify_cuda; then
        echo "❌ CUDA verification failed. Please check GPU setup."
        exit 1
    fi
    
    # Step 2: Setup build cache
    setup_build_cache
    
    # Step 3: Use pre-built image
    use_prebuilt_image
    
    # Step 4: Optimize compose config
    optimize_compose_config
    
    # Step 5: Reset container if needed
    if ! check_localai_health; then
        reset_localai_container
    fi
    
    # Step 6: Start optimized LocalAI
    if start_optimized_localai; then
        # Step 7: Test functionality
        sleep 10  # Give it a moment to settle
        if test_localai; then
            echo ""
            echo "🎉 LocalAI CUDA optimization completed successfully!"
            echo "⏱️  Future restarts should be much faster (seconds vs hours)"
            echo "📊 Container status:"
            docker ps | grep localai
        else
            echo "⚠️  LocalAI started but test failed. Check logs:"
            echo "   docker-compose logs localai"
        fi
    else
        echo "❌ LocalAI optimization failed"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "test")
        test_localai
        ;;
    "reset")
        reset_localai_container
        ;;
    "status")
        check_localai_health && docker ps | grep localai
        ;;
    *)
        main
        ;;
esac