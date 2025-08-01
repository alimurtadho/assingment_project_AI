#!/bin/bash

# Test script for security scan API
VULNERABLE_CODE=$(cat /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai/demo/vulnerable-code.ts)

curl -X POST http://localhost:8000/api/security/scan \
  -H "Content-Type: application/json" \
  -d "{\"code\":$(echo "$VULNERABLE_CODE" | jq -R -s .), \"language\": \"typescript\"}"
