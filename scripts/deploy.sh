#!/bin/bash
# Deployment Script for Pipeline AI Integration Manager
# =====================================================

set -e

# Configuration
DEPLOY_ENV=${1:-staging}
VERSION=$(git describe --tags --always 2>/dev/null || echo "latest")

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo "🚀 Starting deployment to $DEPLOY_ENV..."

# Pre-deployment checks
log "Running pre-deployment checks..."

if [ ! -f ".env" ]; then
    error ".env file not found"
fi

if ! docker info > /dev/null 2>&1; then
    error "Docker is not running"
fi

# Run tests
log "Running tests..."
make test || warn "Some tests failed, continuing anyway"

# Build Docker images
log "Building Docker images..."
docker-compose build

# Tag images
docker tag pipeline-backend:latest pipeline-backend:$VERSION
docker tag pipeline-frontend:latest pipeline-frontend:$VERSION

# Deploy based on environment
case $DEPLOY_ENV in
    staging)
        log "Deploying to staging..."
        docker-compose -f docker-compose.yml up -d
        ;;
    production)
        log "Deploying to production..."
        # Add production deployment steps here
        # e.g., docker-compose -f docker-compose.prod.yml up -d
        warn "Production deployment not fully configured"
        ;;
    *)
        error "Unknown environment: $DEPLOY_ENV"
        ;;
esac

# Health check
log "Running health checks..."
sleep 5
./scripts/health-check.sh || warn "Some health checks failed"

log "Deployment complete!"
echo ""
echo "Application is running at:"
echo "  - Frontend: http://localhost"
echo "  - Backend: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
