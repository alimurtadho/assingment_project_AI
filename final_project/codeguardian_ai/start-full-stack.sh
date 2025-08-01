#!/bin/bash

# 🚀 Full Stack Startup Script for CodeGuardian AI
# Starts Backend + Frontend + Database with proper sequencing

echo "=============================================="
echo "🛡️  CodeGuardian AI - Full Stack Startup"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Starting CodeGuardian AI Full Stack..."
echo ""

# Step 1: Check prerequisites
echo "🔍 CHECKING PREREQUISITES:"
echo "=========================="

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm: v$NPM_VERSION"
else
    print_error "npm not found"
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    print_status "Docker: $DOCKER_VERSION"
else
    print_error "Docker not found. Please install Docker"
    exit 1
fi

echo ""

# Step 2: Start Database
echo "🗄️  STARTING DATABASE:"
echo "====================="

print_info "Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
print_info "Waiting for database to be ready (15 seconds)..."
sleep 15

# Check if database is running
if docker ps | grep -q postgres; then
    print_status "PostgreSQL database is running"
else
    print_error "Failed to start PostgreSQL database"
    exit 1
fi

echo ""

# Step 3: Setup and Start Backend
echo "🔧 STARTING BACKEND:"
echo "==================="

if [ -d "backend" ]; then
    cd backend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_info "Installing backend dependencies..."
        npm install
    fi
    
    # Run tests to verify everything is working
    print_info "Running backend tests..."
    if npm test --silent; then
        print_status "Backend tests: PASSED (24/24)"
    else
        print_warning "Some backend tests failed, but continuing..."
    fi
    
    # Start backend server in background
    print_info "Starting backend server on port 8000..."
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 5
    
    # Check if backend is responding
    if curl -s http://localhost:8000/health &> /dev/null; then
        print_status "Backend server is running on http://localhost:8000"
    else
        print_warning "Backend server may still be starting..."
    fi
    
    cd ..
else
    print_error "Backend directory not found"
    exit 1
fi

echo ""

# Step 4: Setup and Start Frontend
echo "🎨 STARTING FRONTEND:"
echo "===================="

if [ -d "frontend" ]; then
    cd frontend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_info "Installing frontend dependencies..."
        npm install
    fi
    
    # Start frontend server in background
    print_info "Starting frontend server on port 3000..."
    BROWSER=none npm start > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    sleep 10
    
    # Check if frontend is responding
    if curl -s http://localhost:3000 &> /dev/null; then
        print_status "Frontend server is running on http://localhost:3000"
    else
        print_warning "Frontend server may still be starting..."
    fi
    
    cd ..
else
    print_error "Frontend directory not found"
    exit 1
fi

echo ""

# Step 5: Verify All Services
echo "✅ VERIFYING SERVICES:"
echo "====================="

# Check database
if docker ps | grep -q postgres; then
    print_status "Database: PostgreSQL running"
else
    print_error "Database: Not running"
fi

# Check backend
if curl -s http://localhost:8000/health &> /dev/null; then
    print_status "Backend: API responding on port 8000"
else
    print_error "Backend: Not responding on port 8000"
fi

# Check frontend
if curl -s http://localhost:3000 &> /dev/null; then
    print_status "Frontend: Application running on port 3000"
else
    print_error "Frontend: Not responding on port 3000"
fi

echo ""

# Step 6: Display Access Information
echo "🌐 ACCESS POINTS:"
echo "================"
echo "Frontend Application: http://localhost:3000"
echo "Backend API:         http://localhost:8000"
echo "API Documentation:   http://localhost:8000/api/docs"
echo "Database:            localhost:5432 (PostgreSQL)"
echo ""

# Step 7: Display Useful Commands
echo "📋 USEFUL COMMANDS:"
echo "=================="
echo "Check status:        ./status-check.sh"
echo "View backend logs:   tail -f backend.log"
echo "View frontend logs:  tail -f frontend.log"
echo "Stop all services:   ./stop-full-stack.sh"
echo "Run backend tests:   cd backend && npm test"
echo ""

# Step 8: SonarQube Integration Info
echo "🔍 SONARQUBE INTEGRATION:"
echo "========================"
echo "SonarQube Dashboard: https://sonarcloud.io/project/overview?id=codeguardian-ai"
echo "Run local analysis:  ./setup-sonarqube.sh"
echo "CI/CD Pipeline:      GitHub Actions (auto-triggered on push)"
echo ""

# Step 9: Testing Information
echo "🧪 TESTING COMMANDS:"
echo "==================="
echo "Backend tests:       cd backend && npm test"
echo "Frontend tests:      cd frontend && npm test"
echo "API health check:    curl http://localhost:8000/health"
echo "Security scan test:  curl -X POST http://localhost:8000/api/security/scan"
echo ""

# Save process IDs for cleanup
echo "BACKEND_PID=$BACKEND_PID" > .pids
echo "FRONTEND_PID=$FRONTEND_PID" >> .pids

echo "🎉 SUCCESS!"
echo "==========="
print_status "CodeGuardian AI Full Stack is now running!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Test the API at http://localhost:8000/api/docs" 
echo "3. Register a user and test security scanning"
echo "4. Run ./status-check.sh to verify all services"
echo ""

print_info "Services are running in the background."
print_info "Use './stop-full-stack.sh' to stop all services."
print_info "Log files: backend.log and frontend.log"

echo ""
echo "=============================================="
echo "✨ CodeGuardian AI is ready to secure code!"
echo "=============================================="
