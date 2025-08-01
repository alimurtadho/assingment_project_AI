#!/bin/bash

# 🛑 Stop Full Stack Script for CodeGuardian AI
# Stops Backend + Frontend + Database gracefully

echo "=============================================="
echo "🛡️  CodeGuardian AI - Stopping Full Stack"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Stop Frontend and Backend processes
echo "🛑 STOPPING APPLICATION SERVERS:"
echo "================================"

# Read process IDs if they exist
if [ -f ".pids" ]; then
    source .pids
    
    # Stop backend process
    if [ ! -z "$BACKEND_PID" ]; then
        if kill -0 $BACKEND_PID 2>/dev/null; then
            print_info "Stopping backend server (PID: $BACKEND_PID)..."
            kill $BACKEND_PID
            print_status "Backend server stopped"
        else
            print_warning "Backend process not running"
        fi
    fi
    
    # Stop frontend process  
    if [ ! -z "$FRONTEND_PID" ]; then
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            print_info "Stopping frontend server (PID: $FRONTEND_PID)..."
            kill $FRONTEND_PID
            print_status "Frontend server stopped"
        else
            print_warning "Frontend process not running"
        fi
    fi
    
    # Remove PID file
    rm .pids
else
    print_warning "No PID file found, attempting to find and stop processes..."
    
    # Find and stop processes by port
    BACKEND_PID=$(lsof -ti:8000 2>/dev/null)
    if [ ! -z "$BACKEND_PID" ]; then
        print_info "Found backend process on port 8000 (PID: $BACKEND_PID)"
        kill $BACKEND_PID
        print_status "Backend server stopped"
    fi
    
    FRONTEND_PID=$(lsof -ti:3000 2>/dev/null)
    if [ ! -z "$FRONTEND_PID" ]; then
        print_info "Found frontend process on port 3000 (PID: $FRONTEND_PID)"
        kill $FRONTEND_PID
        print_status "Frontend server stopped"
    fi
fi

echo ""

# Step 2: Stop Database
echo "🗄️  STOPPING DATABASE:"
echo "====================="

print_info "Stopping PostgreSQL database..."
docker-compose down postgres

if ! docker ps | grep -q postgres; then
    print_status "PostgreSQL database stopped"
else
    print_warning "PostgreSQL may still be running"
fi

echo ""

# Step 3: Clean up log files
echo "🧹 CLEANING UP:"
echo "==============="

if [ -f "backend.log" ]; then
    print_info "Removing backend.log"
    rm backend.log
fi

if [ -f "frontend.log" ]; then
    print_info "Removing frontend.log"
    rm frontend.log
fi

print_status "Log files cleaned up"

echo ""

# Step 4: Verify all services are stopped
echo "✅ VERIFYING SERVICES STOPPED:"
echo "============================="

# Check if ports are free
if ! lsof -i:8000 &>/dev/null; then
    print_status "Port 8000: Free (Backend stopped)"
else
    print_warning "Port 8000: Still in use"
fi

if ! lsof -i:3000 &>/dev/null; then
    print_status "Port 3000: Free (Frontend stopped)"
else
    print_warning "Port 3000: Still in use"
fi

if ! docker ps | grep -q postgres; then
    print_status "Database: Stopped"
else
    print_warning "Database: Still running"
fi

echo ""

# Step 5: Display restart information
echo "🔄 RESTART INFORMATION:"
echo "======================"
echo "To start services again: ./start-full-stack.sh"
echo "To check status:         ./status-check.sh"
echo "To start individual services:"
echo "  Backend only:          cd backend && npm run dev"
echo "  Frontend only:         cd frontend && npm start"
echo "  Database only:         docker-compose up -d postgres"

echo ""
echo "=============================================="
print_status "CodeGuardian AI Full Stack stopped successfully!"
echo "=============================================="
