#!/bin/bash

echo "=== Testing Security Scan API (Simple Version) ==="

# Test 1: Simple hardcoded API key detection
echo "Test 1: API Key detection"
curl -X POST http://localhost:8000/api/security/scan \
  -H "Content-Type: application/json" \
  -d '{"code":"const API_KEY = \"sk-1234567890abcdef\"; console.log(API_KEY);","language":"typescript"}' \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 2: SQL injection detection  
echo "Test 2: SQL injection detection"
curl -X POST http://localhost:8000/api/security/scan \
  -H "Content-Type: application/json" \
  -d '{"code":"const query = `SELECT * FROM users WHERE id = ${userId}`;","language":"javascript"}' \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 3: Health check
echo "Test 3: Health check"
curl -X GET http://localhost:8000/health \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "=== All tests completed ==="
