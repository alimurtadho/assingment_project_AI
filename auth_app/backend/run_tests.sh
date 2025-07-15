#!/bin/bash

# Test Automation Script for Authentication API
# This script provides comprehensive testing functionality with coverage reporting

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_DB="test_auth.db"
COVERAGE_THRESHOLD=90
COVERAGE_DIR="coverage"

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

cleanup() {
    print_header "Cleaning up test artifacts"
    if [ -f "$TEST_DB" ]; then
        rm "$TEST_DB"
        print_success "Removed test database"
    fi
    if [ -d ".pytest_cache" ]; then
        rm -rf ".pytest_cache"
        print_success "Removed pytest cache"
    fi
    if [ -f ".coverage" ]; then
        rm ".coverage"
        print_success "Removed coverage data"
    fi
}

setup_environment() {
    print_header "Setting up test environment"
    
    # Check if virtual environment is activated
    if [[ "$VIRTUAL_ENV" == "" ]]; then
        print_warning "No virtual environment detected. It's recommended to use a virtual environment."
    fi
    
    # Install test dependencies
    if [ -f "test_requirements.txt" ]; then
        print_success "Installing test dependencies..."
        pip install -r test_requirements.txt
    else
        print_warning "test_requirements.txt not found. Installing from requirements.txt"
        pip install -r requirements.txt
        pip install pytest pytest-cov coverage
    fi
}

run_unit_tests() {
    print_header "Running Unit Tests"
    pytest tests/test_auth.py -v --tb=short -m "not integration"
    print_success "Unit tests completed"
}

run_integration_tests() {
    print_header "Running Integration Tests"
    pytest tests/test_integration.py -v --tb=short
    print_success "Integration tests completed"
}

run_user_tests() {
    print_header "Running User Management Tests"
    pytest tests/test_users.py -v --tb=short
    print_success "User management tests completed"
}

run_all_tests() {
    print_header "Running All Tests with Coverage"
    pytest tests/ -v --cov=. --cov-report=html:$COVERAGE_DIR --cov-report=term-missing --cov-fail-under=$COVERAGE_THRESHOLD
    print_success "All tests completed with coverage report"
}

run_specific_test() {
    if [ -z "$1" ]; then
        print_error "Please specify a test file or test function"
        echo "Usage: $0 specific <test_file_or_function>"
        exit 1
    fi
    
    print_header "Running Specific Test: $1"
    pytest "$1" -v --tb=short
    print_success "Specific test completed"
}

generate_coverage_report() {
    print_header "Generating Detailed Coverage Report"
    
    if [ ! -f ".coverage" ]; then
        print_error "No coverage data found. Run tests with coverage first."
        exit 1
    fi
    
    # Generate HTML report
    coverage html -d $COVERAGE_DIR
    print_success "HTML coverage report generated in $COVERAGE_DIR/"
    
    # Generate XML report for CI/CD
    coverage xml
    print_success "XML coverage report generated"
    
    # Show coverage summary
    echo -e "\n${YELLOW}Coverage Summary:${NC}"
    coverage report --show-missing
    
    # Check if coverage meets threshold
    coverage report --fail-under=$COVERAGE_THRESHOLD
    if [ $? -eq 0 ]; then
        print_success "Coverage threshold of $COVERAGE_THRESHOLD% met!"
    else
        print_error "Coverage below threshold of $COVERAGE_THRESHOLD%"
        exit 1
    fi
}

show_coverage() {
    if [ -f "$COVERAGE_DIR/index.html" ]; then
        print_success "Opening coverage report in browser..."
        # Try to open in browser (works on most systems)
        if command -v xdg-open > /dev/null; then
            xdg-open "$COVERAGE_DIR/index.html"
        elif command -v open > /dev/null; then
            open "$COVERAGE_DIR/index.html"
        else
            print_warning "Cannot open browser automatically. Coverage report is at: $COVERAGE_DIR/index.html"
        fi
    else
        print_error "Coverage report not found. Run tests with coverage first."
    fi
}

performance_test() {
    print_header "Running Performance Tests"
    
    # Run tests and measure time
    start_time=$(date +%s)
    pytest tests/ -x --tb=short --durations=10
    end_time=$(date +%s)
    
    duration=$((end_time - start_time))
    print_success "Performance test completed in $duration seconds"
    
    if [ $duration -gt 60 ]; then
        print_warning "Tests took longer than 60 seconds. Consider optimization."
    fi
}

security_test() {
    print_header "Running Security Tests"
    pytest tests/test_integration.py::TestSecurityScenarios -v --tb=short
    print_success "Security tests completed"
}

generate_test_report() {
    print_header "Generating Comprehensive Test Report"
    
    REPORT_FILE="test_report_$(date +%Y%m%d_%H%M%S).html"
    
    pytest tests/ --html=$REPORT_FILE --self-contained-html --cov=. --cov-report=html:$COVERAGE_DIR
    
    print_success "Test report generated: $REPORT_FILE"
    print_success "Coverage report generated: $COVERAGE_DIR/index.html"
}

# Main script logic
case "$1" in
    "setup")
        setup_environment
        ;;
    "clean")
        cleanup
        ;;
    "unit")
        run_unit_tests
        ;;
    "integration")
        run_integration_tests
        ;;
    "user")
        run_user_tests
        ;;
    "all")
        cleanup
        setup_environment
        run_all_tests
        ;;
    "coverage")
        generate_coverage_report
        ;;
    "show-coverage")
        show_coverage
        ;;
    "performance")
        performance_test
        ;;
    "security")
        security_test
        ;;
    "specific")
        run_specific_test "$2"
        ;;
    "report")
        generate_test_report
        ;;
    "full")
        print_header "Running Full Test Suite"
        cleanup
        setup_environment
        run_all_tests
        generate_coverage_report
        show_coverage
        ;;
    *)
        echo -e "${YELLOW}Authentication API Test Automation Script${NC}"
        echo ""
        echo "Usage: $0 {setup|clean|unit|integration|user|all|coverage|show-coverage|performance|security|specific|report|full}"
        echo ""
        echo "Commands:"
        echo "  setup           - Install test dependencies"
        echo "  clean           - Clean up test artifacts"
        echo "  unit            - Run unit tests only"
        echo "  integration     - Run integration tests only"
        echo "  user            - Run user management tests only"
        echo "  all             - Run all tests with coverage"
        echo "  coverage        - Generate coverage report"
        echo "  show-coverage   - Open coverage report in browser"
        echo "  performance     - Run performance tests"
        echo "  security        - Run security tests"
        echo "  specific <test> - Run specific test file or function"
        echo "  report          - Generate comprehensive test report"
        echo "  full            - Run complete test suite with coverage and reporting"
        echo ""
        echo "Examples:"
        echo "  $0 setup                                    # Setup environment"
        echo "  $0 all                                      # Run all tests"
        echo "  $0 specific tests/test_auth.py             # Run specific test file"
        echo "  $0 specific tests/test_auth.py::test_login # Run specific test function"
        echo "  $0 full                                     # Complete test run with reports"
        exit 1
        ;;
esac
