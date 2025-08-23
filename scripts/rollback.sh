#!/bin/bash

# Rollback script for Review Phim Docker deployment
# Usage: ./scripts/rollback.sh [server-ip] [user]

set -e

SERVER_IP=${1}
SERVER_USER=${2:-root}
PROJECT_NAME="review-phim"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Rolling back Review Phim deployment...${NC}"

# Validate parameters
if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}❌ Error: Server IP is required${NC}"
    echo -e "${YELLOW}Usage: ./scripts/rollback.sh [server-ip] [user]${NC}"
    echo -e "${YELLOW}Example: ./scripts/rollback.sh 192.168.1.100 ubuntu${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Rollback Configuration:${NC}"
echo -e "   Server: ${YELLOW}$SERVER_USER@$SERVER_IP${NC}"
echo -e "   Project: ${YELLOW}$PROJECT_NAME${NC}"

# Confirm rollback
echo -e "${RED}⚠️  WARNING: This will rollback to the previous Docker image!${NC}"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Rollback cancelled.${NC}"
    exit 0
fi

# Test SSH connection
echo -e "${BLUE}🔑 Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to $SERVER_USER@$SERVER_IP${NC}"
    exit 1
fi

# Perform rollback on server
echo -e "${BLUE}🔄 Performing rollback on server...${NC}"
ssh $SERVER_USER@$SERVER_IP "
    set -e
    cd /opt/${PROJECT_NAME}
    
    echo '📋 Checking available Docker images...'
    echo 'Current images:'
    docker images review-phim --format 'table {{.Tag}}\t{{.CreatedAt}}\t{{.Size}}'
    
    echo ''
    echo '🛑 Stopping current container...'
    docker-compose down
    
    echo '🔍 Finding previous image...'
    PREVIOUS_IMAGE=\$(docker images review-phim --format '{{.ID}}' | sed -n '2p')
    
    if [ -z \"\$PREVIOUS_IMAGE\" ]; then
        echo '❌ No previous image found for rollback!'
        echo 'Available images:'
        docker images review-phim
        exit 1
    fi
    
    echo \"🏷️  Rolling back to image: \$PREVIOUS_IMAGE\"
    
    # Tag previous image as latest
    docker tag \$PREVIOUS_IMAGE review-phim:latest
    
    echo '🚀 Starting rolled-back container...'
    docker-compose up -d
    
    echo '⏱️  Waiting for container to be ready...'
    sleep 15
    
    echo '🔍 Checking container status...'
    docker-compose ps
    
    echo '📊 Container logs (last 10 lines):'
    docker-compose logs --tail=10
    
    # Health check
    echo '🩺 Performing health check...'
    if curl -f http://localhost:3001 >/dev/null 2>&1; then
        echo '✅ Rollback successful - application is healthy!'
    else
        echo '❌ Health check failed after rollback'
        echo 'Recent logs:'
        docker-compose logs --tail=20
        exit 1
    fi
"

echo ""
echo -e "${GREEN}✅ Rollback completed successfully!${NC}"
echo -e "${BLUE}📊 Rollback Summary:${NC}"
echo -e "   🌐 Application URL: http://$SERVER_IP:3001"
echo -e "   🔄 Rolled back to previous Docker image"
echo ""
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo -e "   Check status: ssh $SERVER_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose ps'"
echo -e "   View logs: ssh $SERVER_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose logs -f'"