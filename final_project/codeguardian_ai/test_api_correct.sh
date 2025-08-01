#!/bin/bash

# Correct curl commands for CodeGuardian AI API testing
# Backend is running on port 8000 and expects JSON format

echo "=== Testing Security Scan API ==="
echo "Reading vulnerable-code.ts file..."

# Test with vulnerable-code.ts
VULNERABLE_CODE=$(cat /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai/demo/vulnerable-code.ts)

curl -X POST http://localhost:8000/api/security/scan \
  -H "Content-Type: application/json" \
  -d "{\"code\":$(echo "$VULNERABLE_CODE" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g' | sed 's/\r/\\r/g' | jq -R -s .), \"language\": \"typescript\"}" \
  -w "\n\nHTTP Status: %{http_code}\n"

echo -e "\n\n=== Testing with Simple Example ==="

# Simple test
curl -X POST http://localhost:8000/api/security/scan \
  -H "Content-Type: application/json" \
  -d '{"code":"const API_KEY = \"sk-1234567890abcdef\"; console.log(API_KEY);","language":"typescript"}' \
  -w "\n\nHTTP Status: %{http_code}\n"
