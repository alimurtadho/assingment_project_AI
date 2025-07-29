#!/bin/bash

# CodeGuardian AI Setup Script
echo "🛡️  Setting up CodeGuardian AI Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    print_status "Creating .env file..."
    cp backend/.env.example backend/.env
    print_warning "Please update the .env file with your actual configuration values."
fi

# Create upload directory
print_status "Creating upload directory..."
mkdir -p backend/uploads

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 10

# Run database migrations
print_status "Setting up database..."
docker-compose exec backend alembic upgrade head

# Install Python dependencies in backend container
print_status "Installing additional dependencies..."
docker-compose exec backend pip install -r requirements.txt

print_status "Setup complete! 🎉"
echo ""
echo "Services running:"
echo "- API Documentation: http://localhost:8000/docs"
echo "- API: http://localhost:8000"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"
echo "To restart services: docker-compose restart"
