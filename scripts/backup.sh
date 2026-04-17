#!/bin/bash
# Backup Script for Pipeline AI Integration Manager
# ==================================================

set -e

# Configuration
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
RETENTION_DAYS=${RETENTION_DAYS:-7}
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="pipeline_backup_$DATE"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "💾 Starting backup process..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup Redis data
if docker ps | grep -q pipeline-redis; then
    echo -e "${GREEN}[BACKUP]${NC} Backing up Redis data..."
    docker exec pipeline-redis redis-cli BGSAVE
    docker cp pipeline-redis:/data/dump.rdb "$BACKUP_DIR/${BACKUP_NAME}_redis.rdb"
else
    echo -e "${YELLOW}[WARN]${NC} Redis container not running, skipping Redis backup"
fi

# Backup environment file
if [ -f ".env" ]; then
    echo -e "${GREEN}[BACKUP]${NC} Backing up environment file..."
    cp .env "$BACKUP_DIR/${BACKUP_NAME}_env.txt"
fi

# Create archive
echo -e "${GREEN}[BACKUP]${NC} Creating backup archive..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" -C "$BACKUP_DIR" \
    ${BACKUP_NAME}_redis.rdb \
    ${BACKUP_NAME}_env.txt \
    2>/dev/null || true

# Clean up individual files
rm -f "$BACKUP_DIR/${BACKUP_NAME}_redis.rdb" "$BACKUP_DIR/${BACKUP_NAME}_env.txt"

# Clean old backups
echo -e "${GREEN}[BACKUP]${NC} Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "pipeline_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo -e "${GREEN}[BACKUP]${NC} Backup complete: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo ""
echo "Backup summary:"
echo "  Location: $BACKUP_DIR"
echo "  Retention: $RETENTION_DAYS days"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -5
