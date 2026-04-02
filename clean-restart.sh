#!/bin/bash

# Quick cleanup and restart script

echo "🔄 Cleaning up and restarting..."

# Stop containers
docker-compose down

# Remove volumes
read -p "Do you want to delete the database volume? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Deleting volumes..."
    docker-compose down -v
fi

# Remove build cache
read -p "Do you want to rebuild containers? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏗️  Rebuilding..."
    docker-compose build --no-cache
fi

# Start fresh
echo "🚀 Starting fresh..."
docker-compose up -d

sleep 5

echo ""
echo "✅ Ready! Access at:"
echo "  • http://localhost/booking"
echo "  • http://localhost/admin"
