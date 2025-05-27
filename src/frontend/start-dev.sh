#!/bin/bash

# Start Development Server with Auto-Restart
# This script will automatically restart the development server if it crashes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting SWRPG Generator Frontend Development Server"
echo "📁 Working directory: $SCRIPT_DIR"
echo "🌐 Server will be available at: http://localhost:3001"
echo ""

# Function to check if port is in use
check_port() {
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port 3001 is already in use. Attempting to kill existing process..."
        kill -9 $(lsof -t -i:3001) 2>/dev/null
        sleep 2
    fi
}

# Function to start the dev server
start_server() {
    echo "🔄 Starting Vite development server..."
    
    # Check and clear port
    check_port
    
    # Clear any cached dependencies
    rm -rf node_modules/.vite 2>/dev/null
    
    # Start the server
    npm run dev
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development server..."
    # Kill any remaining vite processes
    pkill -f "vite" 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main loop with auto-restart
RESTART_COUNT=0
MAX_RESTARTS=5

while true; do
    if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
        echo "❌ Too many restarts ($MAX_RESTARTS). Stopping auto-restart."
        echo "💡 Try running 'npm install' to fix dependency issues."
        exit 1
    fi
    
    if [ $RESTART_COUNT -gt 0 ]; then
        echo "🔄 Restart attempt #$RESTART_COUNT"
        sleep 3
    fi
    
    start_server
    
    # If we get here, the server has stopped
    RESTART_COUNT=$((RESTART_COUNT + 1))
    echo "⚠️  Development server stopped unexpectedly."
    
    # Check if it was intentional (Ctrl+C)
    if [ $? -eq 130 ]; then
        echo "👋 Server stopped by user."
        break
    fi
    
    echo "🔄 Attempting to restart in 3 seconds..."
    sleep 3
done

cleanup