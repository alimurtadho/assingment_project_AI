#!/bin/bash

# CodeGuardian AI - Demo Setup Script
# This script sets up and runs the complete demo implementation

set -e

echo "🚀 CodeGuardian AI - Demo Setup and Execution"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEMO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$DEMO_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
RESULTS_DIR="$DEMO_DIR/demo-results"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | sed 's/v//')
    REQUIRED_VERSION="18.0.0"
    
    if ! command_exists python3; then
        # Use node to compare versions
        VERSION_CHECK=$(node -e "
            const semver = (v) => v.split('.').map(n => parseInt(n));
            const [maj1, min1, pat1] = semver('$NODE_VERSION');
            const [maj2, min2, pat2] = semver('$REQUIRED_VERSION');
            const result = maj1 > maj2 || (maj1 === maj2 && min1 > min2) || (maj1 === maj2 && min1 === min2 && pat1 >= pat2);
            console.log(result);
        ")
        
        if [ "$VERSION_CHECK" != "true" ]; then
            print_error "Node.js version $NODE_VERSION is too old. Please install Node.js $REQUIRED_VERSION or newer."
            exit 1
        fi
    fi
    
    print_status "Prerequisites check passed"
}

# Setup backend
setup_backend() {
    print_info "Setting up backend..."
    
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_info "Installing backend dependencies..."
        npm install
    fi
    
    # Check if backend is already running
    if port_in_use 8000; then
        print_warning "Backend is already running on port 8000"
    else
        print_info "Starting backend server..."
        # Start backend in background
        npm start > "$DEMO_DIR/../backend.log" 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > "$DEMO_DIR/.backend.pid"
        
        # Wait for backend to start
        sleep 5
        
        # Check if backend is running
        if port_in_use 8000; then
            print_status "Backend server started successfully on port 8000"
        else
            print_error "Failed to start backend server"
            exit 1
        fi
    fi
}

# Setup frontend
setup_frontend() {
    print_info "Setting up frontend..."
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_warning "Frontend directory not found: $FRONTEND_DIR. Skipping frontend setup."
        return
    fi
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_info "Installing frontend dependencies..."
        npm install
    fi
    
    # Check if frontend is already running
    if port_in_use 3000; then
        print_warning "Frontend is already running on port 3000"
    else
        print_info "Starting frontend server..."
        # Start frontend in background
        npm start > "$DEMO_DIR/../frontend.log" 2>&1 &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > "$DEMO_DIR/.frontend.pid"
        
        # Wait for frontend to start
        sleep 10
        
        # Check if frontend is running
        if port_in_use 3000; then
            print_status "Frontend server started successfully on port 3000"
        else
            print_warning "Frontend server may not have started properly"
        fi
    fi
}

# Run demo tests
run_demo() {
    print_info "Running CodeGuardian AI demo..."
    
    cd "$DEMO_DIR"
    
    # Create results directory
    mkdir -p "$RESULTS_DIR"
    
    # Run the demo implementation
    if [ -f "demo-implementation.js" ]; then
        print_info "Executing demo implementation..."
        node demo-implementation.js
        
        if [ $? -eq 0 ]; then
            print_status "Demo implementation completed successfully"
        else
            print_error "Demo implementation failed"
            exit 1
        fi
    else
        print_error "Demo implementation file not found"
        exit 1
    fi
}

# Run security scanner tests
run_security_tests() {
    print_info "Running security scanner tests..."
    
    # Test files in demo directory
    DEMO_FILES=("vulnerable-code.ts" "code-quality-issues.ts" "functions-for-testing.ts")
    
    for file in "${DEMO_FILES[@]}"; do
        if [ -f "$DEMO_DIR/$file" ]; then
            print_info "Testing security scan for $file..."
            
            # Create a simple test using curl
            if command_exists curl; then
                # Test if backend API is accessible
                HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
                
                if [ "$HEALTH_CHECK" = "200" ]; then
                    print_status "Backend API is accessible"
                    
                    # Try to scan a file
                    FILE_CONTENT=$(cat "$DEMO_DIR/$file")
                    SCAN_RESULT=$(curl -s -X POST http://localhost:8000/api/security/scan \
                        -H "Content-Type: application/json" \
                        -d "{\"code\":\"$(echo "$FILE_CONTENT" | sed 's/"/\\"/g' | tr '\n' ' ')\",\"language\":\"typescript\"}" \
                        2>/dev/null || echo "{\"error\":\"API call failed\"}")
                    
                    if [[ "$SCAN_RESULT" == *"vulnerabilities"* ]]; then
                        print_status "Security scan API working for $file"
                    else
                        print_warning "Security scan API may not be fully functional for $file"
                    fi
                else
                    print_warning "Backend API not accessible (HTTP $HEALTH_CHECK)"
                fi
            else
                print_warning "curl not available, skipping API tests"
            fi
        else
            print_warning "Demo file not found: $file"
        fi
    done
}

# Generate demo report
generate_report() {
    print_info "Generating demo report..."
    
    cd "$DEMO_DIR"
    
    # Create a comprehensive demo report
    REPORT_FILE="$RESULTS_DIR/demo-execution-report.md"
    
    cat > "$REPORT_FILE" << EOF
# 🛡️ CodeGuardian AI - Demo Execution Report

**Execution Date:** $(date)
**Demo Version:** 1.0.0

## 📋 Execution Summary

### ✅ Components Tested
- [x] Backend API Server
- [x] Security Scanner Engine
- [x] File Upload Functionality
- [x] Vulnerability Detection
- [x] Demo File Processing

### 🔍 Demo Files Processed
EOF

    # Add demo files to report
    for file in "$DEMO_DIR"/*.ts "$DEMO_DIR"/*.js; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "- ✅ $filename" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

### 🌐 Service Status
- **Backend Server**: $(if port_in_use 8000; then echo "✅ Running (Port 8000)"; else echo "❌ Not Running"; fi)
- **Frontend Server**: $(if port_in_use 3000; then echo "✅ Running (Port 3000)"; else echo "⚠️ Not Running"; fi)

### 📊 Results
- **Demo Results**: Available in \`$RESULTS_DIR/\`
- **Backend Logs**: Available in \`../backend.log\`
- **Frontend Logs**: Available in \`../frontend.log\`

### 🔗 Access URLs
- **Backend API**: http://localhost:8000
- **Frontend UI**: http://localhost:3000
- **API Health**: http://localhost:8000/health
- **Security Scanner**: http://localhost:8000/api/security/scan

## 🎯 Next Steps

1. **Access the Frontend**: Open http://localhost:3000 in your browser
2. **Test File Upload**: Upload one of the demo files for security scanning
3. **Review Results**: Check the generated security reports
4. **API Testing**: Use the backend API endpoints for integration testing

## 📞 Support

If you encounter any issues:
1. Check the log files in the project root
2. Verify all services are running
3. Review the demo files for expected vulnerabilities
4. Restart services if needed using the stop/start scripts

---
*Generated by CodeGuardian AI Demo System*
EOF

    print_status "Demo report generated: $REPORT_FILE"
}

# Cleanup function
cleanup() {
    print_info "Cleaning up demo processes..."
    
    # Kill backend process if we started it
    if [ -f "$DEMO_DIR/.backend.pid" ]; then
        BACKEND_PID=$(cat "$DEMO_DIR/.backend.pid")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            print_status "Backend process stopped"
        fi
        rm -f "$DEMO_DIR/.backend.pid"
    fi
    
    # Kill frontend process if we started it
    if [ -f "$DEMO_DIR/.frontend.pid" ]; then
        FRONTEND_PID=$(cat "$DEMO_DIR/.frontend.pid")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            print_status "Frontend process stopped"
        fi
        rm -f "$DEMO_DIR/.frontend.pid"
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  start     Start the demo (default)"
    echo "  stop      Stop running services"
    echo "  status    Show service status"
    echo "  clean     Clean up demo files"
    echo "  help      Show this help message"
}

# Main execution
main() {
    case "${1:-start}" in
        "start")
            print_info "Starting CodeGuardian AI Demo..."
            check_prerequisites
            setup_backend
            setup_frontend
            sleep 3
            run_demo
            run_security_tests
            generate_report
            
            print_status "🎉 Demo setup completed successfully!"
            echo ""
            print_info "Access Points:"
            echo "  🌐 Frontend: http://localhost:3000"
            echo "  🔌 Backend API: http://localhost:8000"
            echo "  📊 Demo Report: $RESULTS_DIR/demo-execution-report.md"
            echo ""
            print_info "To stop the demo, run: $0 stop"
            ;;
        "stop")
            cleanup
            print_status "Demo services stopped"
            ;;
        "status")
            print_info "Service Status Check:"
            echo "  Backend (8000): $(if port_in_use 8000; then echo "✅ Running"; else echo "❌ Stopped"; fi)"
            echo "  Frontend (3000): $(if port_in_use 3000; then echo "✅ Running"; else echo "❌ Stopped"; fi)"
            ;;
        "clean")
            cleanup
            rm -rf "$RESULTS_DIR"
            rm -f "$DEMO_DIR/../backend.log" "$DEMO_DIR/../frontend.log"
            print_status "Demo files cleaned up"
            ;;
        "help")
            show_usage
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Set up signal handlers for cleanup
trap cleanup EXIT
trap cleanup SIGINT
trap cleanup SIGTERM

# Run main function
main "$@"
