#!/bin/bash

# 🚀 PocketCloud Server Launcher
# Simple one-command server startup

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║          🚀 PocketCloud Server          ║"
echo "║            Starting Now...             ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "backend" ]]; then
    echo -e "${RED}❌ Error: Please run this script from the PocketCloud root directory${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Node.js is not installed!${NC}"
    echo -e "${YELLOW}Please install Node.js first: https://nodejs.org/${NC}"
    exit 1
fi

# Check if dependencies are installed
if [[ ! -d "backend/node_modules" ]]; then
    echo -e "${YELLOW}⚠️  Dependencies not found. Installing...${NC}"
    cd backend
    npm install --silent
    cd ..
    echo -e "${GREEN}✅ Dependencies installed!${NC}"
fi

# Check if USB storage is available (optional check)
if [[ ! -d "/mnt/pocketcloud" ]]; then
    echo -e "${YELLOW}⚠️  USB storage not detected at /mnt/pocketcloud${NC}"
    echo -e "${YELLOW}   PocketCloud will use local storage instead${NC}"
fi

# Start the server
echo -e "${BLUE}🖥️  Starting PocketCloud server...${NC}"
cd backend

# Check if server is already running
if pgrep -f "node.*server.js" > /dev/null; then
    echo -e "${YELLOW}⚠️  PocketCloud server is already running!${NC}"
    echo -e "${BLUE}ℹ️  To restart, first stop it with: pkill -f 'node.*server.js'${NC}"
    exit 1
fi

# Start the server
echo -e "${GREEN}✅ Starting server on port 3000...${NC}"
echo -e "${BLUE}ℹ️  Press Ctrl+C to stop the server${NC}"
echo ""

# Get local IP for network access info
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")

echo -e "${GREEN}🌐 PocketCloud is running!${NC}"
echo -e "${BLUE}   Local:   http://localhost:3000${NC}"
echo -e "${BLUE}   Network: http://$LOCAL_IP:3000${NC}"
echo ""
echo -e "${YELLOW}📋 Logs will appear below:${NC}"
echo "----------------------------------------"

# Start the Node.js server
node server.js