#!/bin/bash

# CodeGuardian AI - Manual Docker Setup for WSL 2
# Alternative to docker-compose when Docker Desktop integration is not available

set -e

echo "🐳 CodeGuardian AI - Manual Docker Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not accessible in WSL 2"
    echo ""
    echo "Please follow these steps:"
    echo "1. Install Docker Desktop on Windows"
    echo "2. Enable WSL 2 integration in Docker Desktop settings"
    echo "3. Restart WSL 2: wsl --shutdown (from Windows PowerShell)"
    echo ""
    echo "For details: https://docs.docker.com/go/wsl2/"
    exit 1
fi

print_status "Docker is available, proceeding with manual setup..."

# Create Docker network
print_status "Creating Docker network..."
docker network create codeguardian-network 2>/dev/null || print_warning "Network already exists"

# Start PostgreSQL container
print_status "Starting PostgreSQL database..."
docker run -d \
    --name codeguardian-postgres \
    --network codeguardian-network \
    -e POSTGRES_DB=codeguardian \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -p 5432:5432 \
    -v pgdata:/var/lib/postgresql/data \
    postgres:15 2>/dev/null || print_warning "PostgreSQL container already running"

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 10

# Generate Prisma client
print_status "Setting up database schema..."
cd /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing main dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Push database schema
print_status "Setting up database schema..."
npx prisma db push

print_success "Database setup completed!"

# Create environment file if not exists
if [ ! -f ".env" ]; then
    print_status "Creating environment file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codeguardian"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server Configuration
PORT=3001
NODE_ENV=development

# OpenAI API (Optional - for AI features)
OPENAI_API_KEY="your-openai-api-key-here"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"
EOF
    print_success "Environment file created"
else
    print_success "Environment file already exists"
fi

# Build and run backend container
print_status "Building backend application..."
docker build -t codeguardian-backend -f backend/Dockerfile .

print_status "Starting backend server..."
docker run -d \
    --name codeguardian-backend \
    --network codeguardian-network \
    -p 3001:3001 \
    -v $(pwd):/app \
    -w /app \
    --env-file .env \
    codeguardian-backend 2>/dev/null || {
        print_warning "Backend container already exists, restarting..."
        docker stop codeguardian-backend 2>/dev/null || true
        docker rm codeguardian-backend 2>/dev/null || true
        docker run -d \
            --name codeguardian-backend \
            --network codeguardian-network \
            -p 3001:3001 \
            -v $(pwd):/app \
            -w /app \
            --env-file .env \
            codeguardian-backend
    }

# Build and run frontend container
print_status "Building frontend application..."
docker build -t codeguardian-frontend -f frontend/Dockerfile frontend/

print_status "Starting frontend server..."
docker run -d \
    --name codeguardian-frontend \
    --network codeguardian-network \
    -p 3000:3000 \
    -v $(pwd)/frontend:/app \
    -w /app \
    codeguardian-frontend 2>/dev/null || {
        print_warning "Frontend container already exists, restarting..."
        docker stop codeguardian-frontend 2>/dev/null || true
        docker rm codeguardian-frontend 2>/dev/null || true
        docker run -d \
            --name codeguardian-frontend \
            --network codeguardian-network \
            -p 3000:3000 \
            -v $(pwd)/frontend:/app \
            -w /app \
            codeguardian-frontend
    }

# Wait for services to start
print_status "Waiting for services to start..."
sleep 15

# Health checks
print_status "Performing health checks..."

# Check PostgreSQL
if docker exec codeguardian-postgres pg_isready -U postgres > /dev/null 2>&1; then
    print_success "PostgreSQL is healthy"
else
    print_error "PostgreSQL health check failed"
fi

# Check backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Backend is healthy"
    BACKEND_HEALTH=$(curl -s http://localhost:3001/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo "   Status: $BACKEND_HEALTH"
else
    print_warning "Backend health check failed - may still be starting"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is healthy"
else
    print_warning "Frontend health check failed - may still be starting"
fi

echo ""
print_success "CodeGuardian AI Setup Complete!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   API Health: http://localhost:3001/health"
echo ""
echo "🐳 Docker Containers:"
echo "   codeguardian-postgres  (Database)"
echo "   codeguardian-backend   (API Server)"
echo "   codeguardian-frontend  (React App)"
echo ""
echo "📋 Management Commands:"
echo "   View logs: docker logs codeguardian-backend"
echo "   Stop all:  docker stop codeguardian-postgres codeguardian-backend codeguardian-frontend"
echo "   Remove all: docker rm codeguardian-postgres codeguardian-backend codeguardian-frontend"
echo ""
print_success "Your AI-Enhanced DevSecOps Platform is ready! 🚀"
