#!/bin/bash

# Authentication App Setup Script
# This script sets up both backend and frontend

set -e  # Exit on any error

echo "🚀 Setting up Authentication Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
check_python() {
    print_step "Checking Python installation..."
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
        print_success "Python $PYTHON_VERSION found"
    else
        print_error "Python 3 is not installed. Please install Python 3.8 or higher."
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    print_step "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION found"
    else
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
}

# Setup backend
setup_backend() {
    print_step "Setting up backend..."
    
    cd backend
    
    # Create virtual environment
    print_step "Creating Python virtual environment..."
    python3 -m venv venv
    
    # Activate virtual environment
    print_step "Activating virtual environment..."
    source venv/bin/activate
    
    # Install dependencies
    print_step "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Copy environment file
    if [ ! -f .env ]; then
        print_step "Creating environment file..."
        cp .env.example .env
        print_warning "Please review and update the .env file with your configuration"
    fi
    
    print_success "Backend setup completed!"
    cd ..
}

# Setup frontend
setup_frontend() {
    print_step "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_step "Installing Node.js dependencies..."
    npm install
    
    # Copy environment file
    if [ ! -f .env ]; then
        print_step "Creating environment file..."
        cp .env.example .env
    fi
    
    print_success "Frontend setup completed!"
    cd ..
}

# Create start scripts
create_start_scripts() {
    print_step "Creating start scripts..."
    
    # Backend start script
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "Starting Authentication API backend..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
EOF
    
    # Frontend start script
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "Starting Authentication App frontend..."
cd frontend
npm start
EOF
    
    # Combined start script
    cat > start-all.sh << 'EOF'
#!/bin/bash
echo "Starting Authentication Application..."

# Function to handle cleanup
cleanup() {
    echo "Shutting down..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to handle Ctrl+C
trap cleanup SIGINT

# Start backend
echo "Starting backend..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "Both services are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
EOF
    
    # Make scripts executable
    chmod +x start-backend.sh
    chmod +x start-frontend.sh
    chmod +x start-all.sh
    
    print_success "Start scripts created!"
}

# Main setup process
main() {
    echo "=========================================="
    echo "  Authentication App Setup"
    echo "=========================================="
    echo
    
    # Check prerequisites
    check_python
    check_node
    
    echo
    
    # Setup components
    setup_backend
    echo
    setup_frontend
    echo
    create_start_scripts
    
    echo
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo
    echo "Next steps:"
    echo "1. Review and update backend/.env file"
    echo "2. Review and update frontend/.env file (if needed)"
    echo "3. Start the application:"
    echo "   - Full application: ./start-all.sh"
    echo "   - Backend only: ./start-backend.sh"
    echo "   - Frontend only: ./start-frontend.sh"
    echo
    echo "URLs:"
    echo "- Frontend: http://localhost:3000"
    echo "- Backend API: http://localhost:8000"
    echo "- API Documentation: http://localhost:8000/docs"
    echo
}

# Run main function
main "$@"
