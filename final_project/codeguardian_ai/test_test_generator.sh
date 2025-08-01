#!/bin/bash

# Test Generator API Testing Script
# Tests the /api/test-gen/generate endpoint with various code samples

echo "🚀 CodeGuardian AI - Test Generator Testing"
echo "=============================================="

BACKEND_URL="http://localhost:8000"

# Check if backend is running
echo "🔍 Checking backend status..."
if curl -s "$BACKEND_URL/health" > /dev/null; then
    echo "✅ Backend is running"
    curl -s "$BACKEND_URL/health" | jq '.status, .timestamp'
else
    echo "❌ Backend is not running!"
    echo "Please start the backend with: node backend/server.simple.js"
    exit 1
fi

echo ""
echo "🧪 Running Test Generator Tests..."
echo "=================================="

# Test 1: Simple Function
echo ""
echo "Test 1: Simple Function"
echo "----------------------"
curl -X POST "$BACKEND_URL/api/test-gen/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function calculateSum(a, b) {\n    return a + b;\n}\n\nfunction calculateProduct(x, y) {\n    return x * y;\n}",
    "language": "javascript"
  }' | jq '.success, .tests.testCases | length, .tests.coverage.estimatedPercentage'

# Test 2: Class with Methods
echo ""
echo "Test 2: Class with Methods"
echo "-------------------------"
curl -X POST "$BACKEND_URL/api/test-gen/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "class Calculator {\n    constructor() {\n        this.result = 0;\n    }\n    \n    add(a, b) {\n        this.result = a + b;\n        return this.result;\n    }\n}",
    "language": "javascript"
  }' | jq '.success, .tests.testCases | length, .tests.coverage.estimatedPercentage'

# Test 3: Async Function
echo ""
echo "Test 3: Async Function with API Call"
echo "------------------------------------"
curl -X POST "$BACKEND_URL/api/test-gen/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "async function fetchUserData(userId) {\n    try {\n        const response = await fetch(`/api/users/${userId}`);\n        return await response.json();\n    } catch (error) {\n        throw error;\n    }\n}",
    "language": "javascript"
  }' | jq '.success, .tests.testCases | length, .tests.coverage.estimatedPercentage'

# Test 4: Empty Code
echo ""
echo "Test 4: Empty Code"
echo "-----------------"
curl -X POST "$BACKEND_URL/api/test-gen/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "",
    "language": "javascript"
  }' | jq '.success, .tests.testCases | length'

# Test 5: No Code Parameter (Error Case)
echo ""
echo "Test 5: Missing Code Parameter"
echo "-----------------------------"
curl -X POST "$BACKEND_URL/api/test-gen/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript"
  }' | jq '.success, .error.message'

echo ""
echo "🎉 All tests completed!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Go to 'Test Generator' tab"
echo "3. Upload a JavaScript file"
echo "4. Verify that test generation works without errors"
echo ""
echo "✅ The TestResults component error should now be fixed!"
