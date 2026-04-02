#!/bin/bash

# Zolten Ranch - Docker Setup Helper Script

set -e

echo "🐎 Zolten Ranch Adventures - Docker Setup"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Ask user what to do
echo "What would you like to do?"
echo "1. Start the application"
echo "2. Stop the application"
echo "3. View logs"
echo "4. Reset database (WARNING: loses all data)"
echo "5. Check health status"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Starting Zolten Ranch application..."
        docker-compose up --build -d
        sleep 5
        echo ""
        echo "✅ Application started successfully!"
        echo ""
        echo "Access the application at:"
        echo "  • Website: http://localhost"
        echo "  • Booking: http://localhost/booking"
        echo "  • Admin:   http://localhost/admin"
        echo ""
        echo "Default admin credentials:"
        echo "  • Username: admin"
        echo "  • Password: admin123"
        echo ""
        echo "View logs with: docker-compose logs -f"
        ;;
    2)
        echo "🛑 Stopping Zolten Ranch application..."
        docker-compose down
        echo "✅ Application stopped"
        ;;
    3)
        echo "📋 Showing application logs..."
        docker-compose logs -f
        ;;
    4)
        echo "⚠️  WARNING: This will delete all booking data and reset the database!"
        read -p "Are you absolutely sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "Resetting database..."
            docker-compose down -v
            docker-compose up --build -d
            sleep 5
            echo "✅ Database has been reset"
        else
            echo "Reset cancelled"
        fi
        ;;
    5)
        echo "🏥 Checking health status..."
        echo ""
        echo "Container status:"
        docker-compose ps
        echo ""
        status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health)
        if [ "$status_code" = "200" ]; then
            echo "✅ API is healthy"
        else
            echo "❌ API health check failed (HTTP $status_code)"
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
