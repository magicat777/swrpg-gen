#!/bin/bash

# Development Stack Management Script
# This script helps manage the full development stack

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "SWRPG Generator Development Stack Manager"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start           Start the full development stack"
    echo "  stop            Stop the development stack"
    echo "  restart         Restart the development stack"
    echo "  logs [service]  Show logs for all services or specific service"
    echo "  status          Show status of all services"
    echo "  build           Build all services"
    echo "  clean           Clean up containers, networks, and volumes"
    echo "  reset           Reset everything and start fresh"
    echo "  frontend-only   Start only frontend dependencies"
    echo "  backend-only    Start only backend dependencies"
    echo "  health          Check health of all services"
    echo "  help            Show this help message"
    echo ""
    echo "Services: neo4j, mongodb, weaviate, localai, backend, frontend"
}

# Function to start the stack
start_stack() {
    print_status "Starting SWRPG development stack..."
    check_docker
    
    docker-compose up -d
    
    print_success "Development stack started!"
    print_status "Services available at:"
    echo "  Frontend:  http://localhost:3001"
    echo "  Backend:   http://localhost:3000"
    echo "  Neo4j:     http://localhost:7474"
    echo "  MongoDB:   mongodb://localhost:27017"
    echo "  Weaviate:  http://localhost:8080"
    echo "  LocalAI:   http://localhost:8081"
}

# Function to stop the stack
stop_stack() {
    print_status "Stopping SWRPG development stack..."
    docker-compose down
    print_success "Development stack stopped!"
}

# Function to restart the stack
restart_stack() {
    print_status "Restarting SWRPG development stack..."
    docker-compose restart
    print_success "Development stack restarted!"
}

# Function to show logs
show_logs() {
    if [ -n "$1" ]; then
        print_status "Showing logs for service: $1"
        docker-compose logs -f "$1"
    else
        print_status "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Function to show status
show_status() {
    print_status "Service status:"
    docker-compose ps
    echo ""
    print_status "Health checks:"
    docker-compose ps --filter "health=healthy" --format "table {{.Service}}\t{{.Status}}\t{{.Health}}"
}

# Function to build services
build_services() {
    print_status "Building all services..."
    docker-compose build
    print_success "All services built!"
}

# Function to clean up
clean_stack() {
    print_warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up development stack..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Development stack cleaned!"
    else
        print_status "Clean operation cancelled."
    fi
}

# Function to reset everything
reset_stack() {
    print_warning "This will completely reset the development stack. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        clean_stack
        build_services
        start_stack
    else
        print_status "Reset operation cancelled."
    fi
}

# Function to start only frontend dependencies
start_frontend_only() {
    print_status "Starting frontend dependencies..."
    docker-compose up -d backend
    print_success "Frontend dependencies started!"
}

# Function to start only backend dependencies
start_backend_only() {
    print_status "Starting backend dependencies..."
    docker-compose up -d neo4j mongodb weaviate localai
    print_success "Backend dependencies started!"
}

# Function to check health
check_health() {
    print_status "Checking service health..."
    
    services=("neo4j" "mongodb" "weaviate" "localai" "backend" "frontend")
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            health=$(docker-compose ps "$service" --format "{{.Health}}")
            if [ "$health" = "healthy" ]; then
                print_success "$service: healthy"
            elif [ "$health" = "unhealthy" ]; then
                print_error "$service: unhealthy"
            else
                print_warning "$service: health check in progress"
            fi
        else
            print_error "$service: not running"
        fi
    done
}

# Main command handling
case "${1:-help}" in
    start)
        start_stack
        ;;
    stop)
        stop_stack
        ;;
    restart)
        restart_stack
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        show_status
        ;;
    build)
        build_services
        ;;
    clean)
        clean_stack
        ;;
    reset)
        reset_stack
        ;;
    frontend-only)
        start_frontend_only
        ;;
    backend-only)
        start_backend_only
        ;;
    health)
        check_health
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac