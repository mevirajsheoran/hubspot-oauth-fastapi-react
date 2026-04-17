#!/bin/bash
# Health Check Script for Pipeline AI Integration Manager
# ========================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🏥 Running Health Checks..."
echo ""

# Check Backend
if curl -s http://localhost:8000/ > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend is running on port 8000"
else
    echo -e "${RED}✗${NC} Backend is not responding on port 8000"
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null 2>&1 || curl -s http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is running"
else
    echo -e "${RED}✗${NC} Frontend is not responding"
fi

# Check Redis
if docker exec pipeline-redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✓${NC} Redis is running and responding"
else
    echo -e "${RED}✗${NC} Redis is not responding"
fi

# Check environment file
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Environment file (.env) exists"
else
    echo -e "${YELLOW}⚠${NC} Environment file (.env) not found"
fi

echo ""
echo "Health check complete!"
