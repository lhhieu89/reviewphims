#!/bin/bash

# Deploy script for Review Phim with Docker
# Usage: ./scripts/deploy.sh [staging|production] [server-ip] [user]

set -e

ENVIRONMENT=${1:-staging}
SERVER_IP=${2}
SERVER_USER=${3:-root}
PROJECT_NAME="review-phim"
CONTAINER_NAME="review-phim-app"
IMAGE_NAME="review-phim:latest"
APP_PORT="3001"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying Review Phim to Docker ($ENVIRONMENT)...${NC}"

# Validate parameters
if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}❌ Error: Server IP is required${NC}"
    echo -e "${YELLOW}Usage: ./scripts/deploy.sh [staging|production] [server-ip] [user]${NC}"
    echo -e "${YELLOW}Example: ./scripts/deploy.sh production 192.168.1.100 ubuntu${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "   Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "   Server: ${YELLOW}$SERVER_USER@$SERVER_IP${NC}"
echo -e "   Port: ${YELLOW}$APP_PORT${NC}"
echo -e "   Container: ${YELLOW}$CONTAINER_NAME${NC}"

# Confirm deployment for production
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${RED}⚠️  WARNING: Deploying to PRODUCTION!${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}❌ Deployment cancelled.${NC}"
        exit 0
    fi
fi

# Test SSH connection
echo -e "${BLUE}🔑 Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to $SERVER_USER@$SERVER_IP${NC}"
    echo -e "${YELLOW}Please check:${NC}"
    echo -e "   - Server IP is correct"
    echo -e "   - SSH key is configured"
    echo -e "   - Server is accessible"
    exit 1
fi

# Build Docker image locally
echo -e "${BLUE}🏗️  Building Docker image locally...${NC}"
docker build -t $IMAGE_NAME . || {
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
}

# Save and compress image
echo -e "${BLUE}📦 Preparing image for transfer...${NC}"
docker save $IMAGE_NAME | gzip > /tmp/${PROJECT_NAME}.tar.gz

# Transfer files to server
echo -e "${BLUE}📤 Transferring files to server...${NC}"
scp /tmp/${PROJECT_NAME}.tar.gz $SERVER_USER@$SERVER_IP:/tmp/ || {
    echo -e "${RED}❌ File transfer failed${NC}"
    exit 1
}

scp docker-compose.yml $SERVER_USER@$SERVER_IP:/opt/${PROJECT_NAME}/ 2>/dev/null || {
    # Create directory if it doesn't exist
    ssh $SERVER_USER@$SERVER_IP "mkdir -p /opt/${PROJECT_NAME}"
    scp docker-compose.yml $SERVER_USER@$SERVER_IP:/opt/${PROJECT_NAME}/
}

# Copy environment file
if [ -f ".env.${ENVIRONMENT}" ]; then
    scp .env.${ENVIRONMENT} $SERVER_USER@$SERVER_IP:/opt/${PROJECT_NAME}/.env
elif [ -f ".env" ]; then
    scp .env $SERVER_USER@$SERVER_IP:/opt/${PROJECT_NAME}/.env
else
    echo -e "${YELLOW}⚠️  No environment file found. Make sure to set environment variables on server.${NC}"
fi

# Deploy on server
echo -e "${BLUE}🚀 Deploying on server...${NC}"
ssh $SERVER_USER@$SERVER_IP "
    set -e
    cd /opt/${PROJECT_NAME}
    
    echo '📥 Loading Docker image...'
    docker load < /tmp/${PROJECT_NAME}.tar.gz
    
    echo '🛑 Stopping existing container...'
    docker-compose down 2>/dev/null || true
    
    echo '🗑️  Cleaning up old images...'
    docker image prune -f 2>/dev/null || true
    
    echo '🚀 Starting new container...'
    docker-compose up -d
    
    echo '⏱️  Waiting for container to be ready...'
    sleep 10
    
    echo '🔍 Checking container status...'
    docker-compose ps
    
    echo '📊 Container logs (last 10 lines):'
    docker-compose logs --tail=10
    
    # Health check
    echo '🩺 Performing health check...'
    if curl -f http://localhost:${APP_PORT} >/dev/null 2>&1; then
        echo '✅ Health check passed!'
    else
        echo '❌ Health check failed - checking logs...'
        docker-compose logs --tail=20
        exit 1
    fi
    
    echo '🧹 Cleaning up transfer file...'
    rm -f /tmp/${PROJECT_NAME}.tar.gz
"

# Cleanup local files
rm -f /tmp/${PROJECT_NAME}.tar.gz

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "   🌐 Application URL: http://$SERVER_IP:$APP_PORT"
echo -e "   🐳 Container: $CONTAINER_NAME"
echo -e "   📁 Server path: /opt/$PROJECT_NAME"
echo ""
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo -e "   Check status: ssh $SERVER_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose ps'"
echo -e "   View logs: ssh $SERVER_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose logs -f'"
echo -e "   Restart: ssh $SERVER_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose restart'"
echo -e "   Stop: ssh $SERVER_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose down'"