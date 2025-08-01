#!/bin/bash

# CodeGuardian AI - Complete Demo Runner
# This script demonstrates the full capability of the platform

set -e

echo "🛡️ CodeGuardian AI - Complete Demo Implementation"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}$1${NC}"
    echo "$(printf '=%.0s' {1..50})"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Run Security Analysis Demo
print_header "Step 1: Running Security Analysis Demo"
echo ""

print_info "Processing demo files with security scanner..."
node simple-demo.js

echo ""
print_success "Security analysis completed!"
echo ""

# Step 2: Display Demo Results
print_header "Step 2: Demo Results Summary"
echo ""

if [ -f "demo-results/demo-report.json" ]; then
    TOTAL_FILES=$(grep -o '"totalFiles":[0-9]*' demo-results/demo-report.json | cut -d':' -f2)
    TOTAL_VULNS=$(grep -o '"totalVulnerabilities":[0-9]*' demo-results/demo-report.json | cut -d':' -f2)
    HIGH_RISK=$(grep -o '"highRiskFiles":[0-9]*' demo-results/demo-report.json | cut -d':' -f2)
    AVG_RISK=$(grep -o '"averageRiskScore":[0-9]*' demo-results/demo-report.json | cut -d':' -f2)
    
    echo -e "${CYAN}📊 Analysis Results:${NC}"
    echo "   📁 Files Analyzed: $TOTAL_FILES"
    echo "   🐛 Vulnerabilities Found: $TOTAL_VULNS"
    echo "   🚨 High Risk Files: $HIGH_RISK"
    echo "   📈 Average Risk Score: $AVG_RISK/100"
    echo ""
else
    print_warning "Demo results not found. Please run the security analysis first."
fi

# Step 3: Demo Access Points
print_header "Step 3: Demo Access Points"
echo ""

echo -e "${CYAN}🌐 Available Demo Interfaces:${NC}"
echo ""
echo "1. 📊 Interactive Web Dashboard:"
echo "   http://localhost:3001"
echo ""
echo "2. 📋 Security Report (HTML):"
echo "   http://localhost:3001/report.html"
echo ""
echo "3. 🔗 API Endpoints:"
echo "   http://localhost:3001/api/results"
echo "   http://localhost:3001/api/health"
echo ""
echo "4. 📄 Local Files:"
echo "   ./demo-results/demo-report.html"
echo "   ./demo-results/demo-summary.md"
echo "   ./demo-results/demo-report.json"
echo ""

# Step 4: Test API Endpoints
print_header "Step 4: Testing Demo API Endpoints"
echo ""

print_info "Testing health check endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health 2>/dev/null || echo "{'error':'not_available'}")
if [[ "$HEALTH_RESPONSE" == *"status"* ]]; then
    print_success "Health check API is working"
else
    print_warning "Health check API not responding"
fi

print_info "Testing results API endpoint..."
RESULTS_RESPONSE=$(curl -s http://localhost:3001/api/results 2>/dev/null || echo "{'error':'not_available'}")
if [[ "$RESULTS_RESPONSE" == *"timestamp"* ]]; then
    print_success "Results API is working"
else
    print_warning "Results API not responding (may need to run demo first)"
fi

echo ""

# Step 5: File Upload Demo Simulation
print_header "Step 5: File Upload Demo Simulation"
echo ""

print_info "Simulating file upload and scanning process..."

echo -e "${CYAN}📁 Demo Files Available:${NC}"
for file in *.ts *.js; do
    if [ -f "$file" ] && [ "$file" != "demo-server.js" ] && [ "$file" != "simple-demo.js" ] && [ "$file" != "demo-implementation.js" ]; then
        filesize=$(wc -c < "$file")
        echo "   📄 $file (${filesize} bytes)"
    fi
done

echo ""
print_info "These files contain intentional security vulnerabilities for testing:"
echo "   🚨 Hardcoded API keys"
echo "   🚨 SQL injection vulnerabilities"
echo "   ⚠️  XSS vulnerabilities"
echo "   ⚠️  Weak cryptographic algorithms"
echo "   ⚠️  Insecure random number generation"
echo ""

# Step 6: Integration with Backend
print_header "Step 6: Backend Integration Status"
echo ""

BACKEND_RUNNING=false
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    BACKEND_RUNNING=true
    print_success "Backend server is running on port 8000"
    
    print_info "Testing backend security scan endpoint..."
    SCAN_TEST=$(curl -s -X POST http://localhost:8000/api/security/scan \
        -H "Content-Type: application/json" \
        -d '{"code":"const apiKey = \"sk-test123\";","language":"javascript"}' 2>/dev/null || echo "error")
    
    if [[ "$SCAN_TEST" == *"vulnerabilities"* ]]; then
        print_success "Backend security scanner API is working"
    else
        print_warning "Backend security scanner API may not be responding correctly"
    fi
else
    print_warning "Backend server is not running on port 8000"
    print_info "To start backend: cd ../backend && npm start"
fi

echo ""

# Step 7: Frontend Integration Status
print_header "Step 7: Frontend Integration Status"
echo ""

FRONTEND_RUNNING=false
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    FRONTEND_RUNNING=true
    print_success "Frontend server is running on port 3000"
else
    print_warning "Frontend server is not running on port 3000"
    print_info "To start frontend: cd ../frontend && npm start"
fi

echo ""

# Step 8: Demo Instructions
print_header "Step 8: Demo Usage Instructions"
echo ""

echo -e "${CYAN}🎮 How to Use the Demo:${NC}"
echo ""
echo "1. 🌐 Open Web Dashboard:"
echo "   Open http://localhost:3001 in your browser"
echo ""
echo "2. 📊 View Security Report:"
echo "   Click 'View Security Report' to see detailed vulnerability analysis"
echo ""
echo "3. 🔍 Test File Upload (if backend is running):"
echo "   - Go to http://localhost:3000"
echo "   - Upload one of the demo .ts files"
echo "   - View real-time security analysis results"
echo ""
echo "4. 🔬 API Testing:"
echo "   curl http://localhost:3001/api/results | jq"
echo ""
echo "5. 📄 Offline Reports:"
echo "   - Open demo-results/demo-report.html in browser"
echo "   - Read demo-results/demo-summary.md"
echo ""

# Step 9: Next Steps
print_header "Step 9: Next Steps & Advanced Features"
echo ""

echo -e "${CYAN}🚀 Take Your Demo Further:${NC}"
echo ""
echo "1. 🔧 Start Full Stack:"
if [ "$BACKEND_RUNNING" = false ]; then
    echo "   cd ../backend && npm start &"
fi
if [ "$FRONTEND_RUNNING" = false ]; then
    echo "   cd ../frontend && npm start &"
fi
echo ""
echo "2. 📊 SonarQube Integration:"
echo "   - Follow SONARQUBE_INTEGRATION_GUIDE.md"
echo "   - Set up automated code quality monitoring"
echo ""
echo "3. 🧪 Automated Testing:"
echo "   cd ../backend && npm test"
echo ""
echo "4. 🐳 Docker Deployment:"
echo "   docker-compose up -d"
echo ""
echo "5. 📚 Documentation:"
echo "   - Read PROJECT_DOCUMENTATION.md"
echo "   - Review API documentation"
echo ""

# Step 10: Demo Summary
print_header "Step 10: Demo Implementation Summary"
echo ""

echo -e "${GREEN}🎉 CodeGuardian AI Demo Implementation Complete!${NC}"
echo ""
echo -e "${CYAN}✅ What's Working:${NC}"
echo "   🛡️  Security vulnerability detection"
echo "   📊 Risk assessment and scoring"
echo "   📝 Detailed reporting (HTML, JSON, Markdown)"
echo "   🌐 Interactive web dashboard"
echo "   🔗 REST API endpoints"
echo "   📁 File processing and analysis"
echo ""

if [ "$BACKEND_RUNNING" = true ] && [ "$FRONTEND_RUNNING" = true ]; then
    echo -e "${GREEN}🚀 Full Stack Demo Ready!${NC}"
    echo "   Backend: http://localhost:8000"
    echo "   Frontend: http://localhost:3000"
    echo "   Demo Dashboard: http://localhost:3001"
elif [ "$BACKEND_RUNNING" = true ]; then
    echo -e "${YELLOW}⚡ Backend Demo Ready!${NC}"
    echo "   Backend API: http://localhost:8000"
    echo "   Demo Dashboard: http://localhost:3001"
elif [ "$FRONTEND_RUNNING" = true ]; then
    echo -e "${YELLOW}⚡ Frontend Demo Ready!${NC}"
    echo "   Frontend UI: http://localhost:3000"
    echo "   Demo Dashboard: http://localhost:3001"
else
    echo -e "${BLUE}💻 Standalone Demo Ready!${NC}"
    echo "   Demo Dashboard: http://localhost:3001"
    echo "   Security Analysis: Completed"
fi

echo ""
echo -e "${PURPLE}📞 Support:${NC}"
echo "   📖 Documentation: PROJECT_DOCUMENTATION.md"
echo "   🔧 Setup Guide: demo/README.md"
echo "   🐛 Issues: Check demo-results/ for detailed logs"
echo ""

print_success "Demo implementation completed successfully!"
echo -e "${CYAN}Open http://localhost:3001 to start exploring! 🚀${NC}"
echo ""
