#!/bin/bash

# CodeGuardian AI - Complete Setup Script
# This script sets up the complete project based on the PRD

echo "🚀 Setting up CodeGuardian AI - DevSecOps Platform"
echo "================================================="

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required but not installed."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is required but not installed."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is required but not installed."
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
}

# Setup environment
setup_environment() {
    echo "📝 Setting up environment..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "⚠️  Please edit .env file with your API keys before continuing"
        echo "   Required: OPENAI_API_KEY"
        read -p "Press Enter after editing .env file..."
    fi
    
    echo "✅ Environment setup complete"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    echo "Installing backend dependencies..."
    npm install
    
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    echo "✅ Dependencies installed"
}

# Setup database
setup_database() {
    echo "🗃️ Setting up database..."
    
    echo "Starting PostgreSQL with Docker..."
    docker-compose up -d postgres
    
    echo "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    echo "Running database migrations..."
    npx prisma migrate dev --name initial
    npx prisma generate
    
    echo "✅ Database setup complete"
}

# Run tests
run_tests() {
    echo "🧪 Running tests..."
    
    echo "Running backend tests..."
    npm run test:backend
    
    echo "Running frontend tests..."
    cd frontend
    npm test -- --coverage --watchAll=false
    cd ..
    
    echo "✅ Tests completed"
}

# Start development servers
start_dev_servers() {
    echo "🏃 Starting development servers..."
    
    echo "Backend will start on http://localhost:3001"
    echo "Frontend will start on http://localhost:3000"
    echo ""
    echo "Use Ctrl+C to stop servers"
    echo ""
    
    npm run dev
}

# Main setup function
main() {
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Quick commands:"
    echo "  npm run dev              # Start both servers"
    echo "  npm run dev:backend      # Backend only"
    echo "  npm run dev:frontend     # Frontend only"
    echo "  npm test                 # Run all tests"
    echo "  npx prisma studio        # Database GUI"
    echo ""
    
    read -p "Start development servers now? (y/n): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_dev_servers
    else
        echo "To start later, run: npm run dev"
    fi
}

# Run main function
main
