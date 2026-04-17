#!/bin/bash
# Setup script for Pipeline AI Integration Manager
# ================================================

set -e

echo "🚀 Setting up Pipeline AI Integration Manager..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Setting up Python virtual environment...${NC}"
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

echo -e "${YELLOW}Step 2: Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${YELLOW}Step 3: Setting up frontend...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo -e "${YELLOW}Step 4: Creating environment file...${NC}"
cd ..
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}Created .env file. Please edit it with your credentials.${NC}"
fi

echo -e "${YELLOW}Step 5: Starting Redis (if not running)...${NC}"
if ! docker ps | grep -q redis; then
    docker run -d --name pipeline-redis -p 6379:6379 redis:7-alpine 2>/dev/null || docker start pipeline-redis 2>/dev/null || echo -e "${YELLOW}Please start Redis manually${NC}"
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your OAuth credentials"
echo "2. Start backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "3. Start frontend: cd frontend && npm start"
echo "4. Open http://localhost:3000 in your browser"
