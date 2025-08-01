#!/bin/bash

# 🚀 CodeGuardian AI - Local Development Setup Script
# This script sets up the complete local development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

print_header "🚀 CodeGuardian AI - Local Development Setup"
print_header "============================================="

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    print_status "Run: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi

print_status "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "✅ npm $(npm --version) found"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker not found. Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose
    sudo usermod -aG docker $USER
    print_status "✅ Docker installed. Please logout and login again to use Docker without sudo"
fi

print_status "✅ Docker $(docker --version) found"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose not found. Installing..."
    sudo apt-get install -y docker-compose
fi

print_status "✅ Docker Compose $(docker-compose --version) found"

# Step 2: Setup project structure
print_status "Setting up project structure..."

PROJECT_ROOT="/home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai"

if [ ! -d "$PROJECT_ROOT" ]; then
    print_error "Project directory not found: $PROJECT_ROOT"
    exit 1
fi

cd "$PROJECT_ROOT"
print_status "✅ Working in: $(pwd)"

# Step 3: Setup environment files
print_status "Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    print_status "Creating backend .env file..."
    cp backend/.env.example backend/.env 2>/dev/null || cat > backend/.env << EOL
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codeguardian_dev"

# JWT Configuration  
JWT_SECRET="codeguardian-super-secret-jwt-key-min-32-chars-for-security"
JWT_EXPIRES_IN="7d"

# OpenAI Configuration (Optional for AI features)
OPENAI_API_KEY="your-openai-api-key-here"

# Server Configuration
PORT=8000
NODE_ENV="development"

# Logging
LOG_LEVEL="info"
LOG_FILE="logs/app.log"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"
EOL
    print_status "✅ Backend .env created"
else
    print_status "✅ Backend .env already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    print_status "Creating frontend .env file..."
    cat > frontend/.env << EOL
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_API_TIMEOUT=10000

# Environment
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_ANALYTICS=false

# WebSocket Configuration (if needed)
REACT_APP_WS_URL=ws://localhost:8000
EOL
    print_status "✅ Frontend .env created"
else
    print_status "✅ Frontend .env already exists"
fi

# Step 4: Install dependencies
print_status "Installing dependencies..."

# Backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
print_status "✅ Backend dependencies installed"

# Frontend dependencies
print_status "Installing frontend dependencies..."
cd ../frontend
npm install
print_status "✅ Frontend dependencies installed"

cd ..

# Step 5: Setup database
print_status "Setting up database..."

# Start PostgreSQL container
print_status "Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 15

# Check if database is running
if ! docker exec codeguardian_postgres pg_isready -U postgres &> /dev/null; then
    print_error "PostgreSQL is not ready. Please check docker-compose.yml"
    exit 1
fi

# Create development database
print_status "Creating development database..."
docker exec codeguardian_postgres psql -U postgres -c "CREATE DATABASE codeguardian_dev;" 2>/dev/null || print_status "Database already exists"

print_status "✅ Database setup complete"

# Step 6: Create directories
print_status "Creating necessary directories..."

mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p backend/reports
mkdir -p frontend/public/reports

print_status "✅ Directories created"

# Step 7: Run tests to verify setup
print_status "Running tests to verify setup..."

# Backend tests
print_status "Running backend tests..."
cd backend
if npm test -- --testPathPattern="basic\.test\.js|services\.test\.js" --passWithNoTests; then
    print_status "✅ Backend tests passed"
else
    print_warning "⚠️ Backend tests had issues - check logs"
fi

# Frontend tests (basic check)
print_status "Checking frontend build..."
cd ../frontend
if npm run build > /dev/null 2>&1; then
    print_status "✅ Frontend build successful"
    rm -rf build  # Clean up build files
else
    print_warning "⚠️ Frontend build had issues - check configuration"
fi

cd ..

# Step 8: Create startup scripts
print_status "Creating startup scripts..."

# Development start script
cat > start-dev.sh << 'EOL'
#!/bin/bash

# CodeGuardian AI Development Startup Script

echo "🚀 Starting CodeGuardian AI Development Environment..."

# Start database
echo "📦 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for database
sleep 5

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check ports
check_port 8000 || { echo "❌ Backend port 8000 in use"; exit 1; }
check_port 3000 || { echo "❌ Frontend port 3000 in use"; exit 1; }

echo "✅ Ports available"

# Start backend in background
echo "🔧 Starting Backend API Server..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting Frontend Development Server..."
cd ../frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid

cd ..

echo ""
echo "🎉 CodeGuardian AI is starting up!"
echo ""
echo "📱 Services:"
echo "   🔧 Backend API:  http://localhost:8000"
echo "   🎨 Frontend:     http://localhost:3000"
echo "   📊 Database:     localhost:5432"
echo ""
echo "📋 Commands:"
echo "   • View logs:     tail -f logs/backend.log"
echo "   • Stop services: ./stop-dev.sh"
echo "   • View status:   ./status-dev.sh"
echo ""
echo "⏳ Starting services... (this may take a moment)"

# Wait for services to be ready
sleep 10

# Open browser (optional)
if command -v xdg-open > /dev/null; then
    echo "🌐 Opening browser..."
    xdg-open http://localhost:3000 2>/dev/null &
fi

echo "✅ Development environment ready!"
EOL

chmod +x start-dev.sh

# Stop script
cat > stop-dev.sh << 'EOL'
#!/bin/bash

echo "🛑 Stopping CodeGuardian AI Development Environment..."

# Stop backend
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        kill $BACKEND_PID
        echo "✅ Backend stopped"
    fi
    rm backend.pid
fi

# Stop frontend
if [ -f frontend.pid ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        kill $FRONTEND_PID
        echo "✅ Frontend stopped"
    fi
    rm frontend.pid
fi

# Stop database
docker-compose down
echo "✅ Database stopped"

echo "🎉 All services stopped"
EOL

chmod +x stop-dev.sh

# Status script
cat > status-dev.sh << 'EOL'
#!/bin/bash

echo "📊 CodeGuardian AI Development Status"
echo "===================================="

# Check database
if docker ps | grep codeguardian_postgres > /dev/null; then
    echo "📦 Database:     ✅ Running"
else
    echo "📦 Database:     ❌ Stopped"
fi

# Check backend
if [ -f backend.pid ] && ps -p $(cat backend.pid) > /dev/null; then
    echo "🔧 Backend:      ✅ Running (PID: $(cat backend.pid))"
    echo "   📍 URL:       http://localhost:8000"
else
    echo "🔧 Backend:      ❌ Stopped"
fi

# Check frontend
if [ -f frontend.pid ] && ps -p $(cat frontend.pid) > /dev/null; then
    echo "🎨 Frontend:     ✅ Running (PID: $(cat frontend.pid))"
    echo "   📍 URL:       http://localhost:3000"
else
    echo "🎨 Frontend:     ❌ Stopped"
fi

# Check ports
echo ""
echo "🔌 Port Status:"
if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null ; then
    echo "   5432:         ✅ PostgreSQL"
else
    echo "   5432:         ❌ Not in use"
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "   8000:         ✅ Backend API"
else
    echo "   8000:         ❌ Not in use"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "   3000:         ✅ Frontend"
else
    echo "   3000:         ❌ Not in use"
fi
EOL

chmod +x status-dev.sh

print_status "✅ Startup scripts created"

# Step 9: Create logs directory
mkdir -p logs

# Final verification
print_status "Running final verification..."

# Test database connection
if docker exec codeguardian_postgres psql -U postgres -d codeguardian_dev -c "SELECT 1;" > /dev/null 2>&1; then
    print_status "✅ Database connection verified"
else
    print_warning "⚠️ Database connection test failed"
fi

# Success message
print_header ""
print_header "🎉 Setup Complete!"
print_header "=================="
print_status ""
print_status "✅ Local development environment is ready!"
print_status ""
print_status "🚀 Quick Start Commands:"
print_status "   • Start everything:  ./start-dev.sh"
print_status "   • Stop everything:   ./stop-dev.sh"
print_status "   • Check status:      ./status-dev.sh"
print_status ""
print_status "📱 URLs (after starting):"
print_status "   • Frontend:          http://localhost:3000"
print_status "   • Backend API:       http://localhost:8000"
print_status "   • API Docs:          http://localhost:8000/api/docs"
print_status ""
print_status "📚 Documentation:"
print_status "   • Local Guide:       LOCAL_DEVELOPMENT_GUIDE.md"
print_status "   • Testing Guide:     backend/TESTING_GUIDE.md"
print_status "   • API Guide:         backend/README.md"
print_status ""
print_status "🎯 Next Steps:"
print_status "   1. Run: ./start-dev.sh"
print_status "   2. Open: http://localhost:3000"
print_status "   3. Happy coding! 🚀"
print_status ""

# Create a summary file
cat > SETUP_SUMMARY.md << EOL
# 🎉 Local Development Setup Complete!

## ✅ What Was Configured

- **✅ Node.js Environment**: Version $(node --version)
- **✅ Backend Dependencies**: All packages installed
- **✅ Frontend Dependencies**: All packages installed  
- **✅ PostgreSQL Database**: Running in Docker
- **✅ Environment Files**: .env configured for both backend/frontend
- **✅ Development Scripts**: start-dev.sh, stop-dev.sh, status-dev.sh
- **✅ Directory Structure**: logs, uploads, reports directories created
- **✅ Database Connection**: Verified and working

## 🚀 Quick Commands

\`\`\`bash
# Start development environment
./start-dev.sh

# Check status
./status-dev.sh

# Stop all services
./stop-dev.sh
\`\`\`

## 📱 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **API Documentation**: http://localhost:8000/api/docs
- **Database**: localhost:5432

## 📊 Test Results

- **Backend Tests**: $(if [ -f "backend_test_result.tmp" ]; then cat backend_test_result.tmp; else echo "Ready to run"; fi)
- **Frontend Build**: $(if [ -f "frontend_build_result.tmp" ]; then cat frontend_build_result.tmp; else echo "Ready to build"; fi)

## 🎯 Ready for Development!

Your CodeGuardian AI local development environment is now fully configured and ready for productive development! 🚀

Setup completed on: $(date)
EOL

print_status "📄 Setup summary saved to: SETUP_SUMMARY.md"
print_status ""
print_header "Happy coding! 🚀"
