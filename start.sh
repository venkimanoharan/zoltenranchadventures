#!/bin/bash

# Quick start script for Zolten Ranch Booking System

echo "🐎 Zolten Ranch Adventures - Booking System"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose found${NC}"
echo ""

# Determine compose file
COMPOSE_FILE="docker-compose.yml"
if [ "$1" = "dev" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    echo -e "${YELLOW}📝 Running in DEVELOPMENT mode${NC}"
else
    echo -e "${YELLOW}📝 Running in PRODUCTION mode${NC}"
fi

echo ""
echo "Starting containers with: $COMPOSE_FILE"
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be ready
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check API health
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || echo "000")

if [ "$HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Application is ready!${NC}"
    echo ""
    echo "Access the application at:"
    echo "  • Website:  http://localhost"
    echo "  • Booking:  http://localhost/booking"
    echo "  • Admin:    http://localhost/admin"
    echo ""
    echo "Default credentials:"
    echo "  • Username: admin"
    echo "  • Password: admin123"
    echo ""
    echo "⚠️  IMPORTANT: Change these credentials in production!"
    echo ""
    echo "View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "Stop: docker-compose -f $COMPOSE_FILE down"
else
    echo -e "${RED}❌ Application failed to start${NC}"
    echo ""
    echo "Checking logs..."
    docker-compose -f "$COMPOSE_FILE" logs
    exit 1
fi
