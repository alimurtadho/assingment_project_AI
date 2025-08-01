# CodeGuardian AI - Complete Testing Guide

## Current Status ✅
- **Backend**: Running on http://localhost:8000
- **Frontend**: Running on http://localhost:3003  
- **Database**: PostgreSQL connected
- **API Format**: JSON (not multipart/form-data)

## Fixed Issues ✅
1. **Port Configuration**: Frontend now connects to backend on port 8000
2. **JSON Format**: FileUpload component now sends JSON instead of FormData
3. **File Reading**: Frontend reads file content and sends it as text
4. **Language Detection**: Automatic language detection from file extension

## Testing Methods

### 1. Frontend Web Interface (Recommended)
1. Open http://localhost:3003 in your browser
2. Go to "Security Vulnerability Scanner" tab
3. Upload file: `/home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai/demo/vulnerable-code.ts`
4. View results with detected vulnerabilities

### 2. Direct API Testing with curl

#### Simple Test:
```bash
curl -X POST http://localhost:8000/api/security/scan \
  -H "Content-Type: application/json" \
  -d '{"code":"const API_KEY = \"sk-1234567890abcdef\";","language":"typescript"}'
```

#### File Upload Test:
```bash
cd /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai

# Create JSON payload from file
python3 -c "
import json
with open('demo/vulnerable-code.ts', 'r') as f:
    code = f.read()
payload = {'code': code, 'language': 'typescript'}
with open('payload.json', 'w') as f:
    json.dump(payload, f)
"

# Send to API
curl -X POST http://localhost:8000/api/security/scan \
  -H "Content-Type: application/json" \
  -d @payload.json
```

## Expected Results

### For vulnerable-code.ts:
The API should detect multiple vulnerabilities:
- **API Key Exposure** (HIGH severity)
- **Hardcoded Passwords** (HIGH severity) 
- **SQL Injection** patterns (MEDIUM/HIGH severity)
- **Weak Cryptography** (MD5 usage)
- **XSS vulnerabilities**

### Sample Response:
```json
{
  "success": true,
  "vulnerabilities": [
    {
      "type": "API Key Exposure",
      "severity": "HIGH",
      "line": 1,
      "description": "Hardcoded API key detected",
      "cwe": "CWE-798"
    }
  ],
  "riskScore": 30,
  "summary": {
    "totalIssues": 1,
    "high": 1,
    "medium": 0,
    "low": 0
  },
  "language": "typescript",
  "timestamp": "2025-08-01T07:58:54.966Z"
}
```

## Common Issues & Solutions

### ❌ "Failed to open/read local data"
- **Cause**: Wrong file path or using multipart/form-data
- **Solution**: Use JSON format and correct file paths

### ❌ "SyntaxError: Unexpected token"
- **Cause**: Malformed JSON payload
- **Solution**: Ensure proper JSON escaping of code content

### ❌ "404 Not Found"
- **Cause**: Wrong port or endpoint
- **Solution**: Use port 8000 and endpoint `/api/security/scan`

### ❌ "CORS errors"
- **Cause**: Frontend/backend port mismatch
- **Solution**: Verified - frontend (3003) → backend (8000) works correctly

## Quick Test Commands

### Health Check:
```bash
curl http://localhost:8000/health
```

### API Health:
```bash
curl http://localhost:8000/api/health
```

### Frontend Status:
Open http://localhost:3003 - should show CodeGuardian AI interface

## Next Steps
1. ✅ Upload vulnerable-code.ts via web interface
2. ✅ Verify vulnerability detection
3. Test additional file types (.js, .py, .java)
4. Test AI code review feature
5. Run SonarQube integration tests
