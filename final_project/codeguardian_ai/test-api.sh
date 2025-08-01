#!/bin/bash

# Quick API Test Script for CodeGuardian AI

echo "🧪 Testing CodeGuardian AI API Endpoints..."

# Test health endpoint
echo -e "\n1. Testing Health Endpoint:"
curl -s http://localhost:3001/health | jq '.' 2>/dev/null || curl -s http://localhost:3001/health

# Test security scan endpoint with a simple approach
echo -e "\n\n2. Testing Security Scan Endpoint:"
echo "Creating temporary test file..."
echo "const API_KEY = 'sk-1234567890abcdef';" > temp_test.js

echo "Sending file to security scan endpoint..."
curl -s -X POST http://localhost:3001/api/security/scan \
  -F "file=@temp_test.js" \
  -w "\nHTTP Status: %{http_code}\n"

# Clean up
rm -f temp_test.js

echo -e "\n✅ API test completed!"
echo -e "\nIf you see a 200 status code, the API is working correctly."
echo -e "If you see errors, check that the backend server is running on port 3001."
