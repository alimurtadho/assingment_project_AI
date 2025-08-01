# End-to-End Testing Guide

## Current Status ✅
- **Backend**: Running on http://localhost:8000
- **Frontend**: Running on http://localhost:3000
- **Database**: PostgreSQL connected
- **SonarQube**: Token configured (5be0e7672c4d25600d61e7c5310cde0a08782868)

## Testing the Security Scanner Feature

### 1. Backend API Test ✅
```bash
curl -X POST http://localhost:8000/api/security/scan \
  -H "Content-Type: application/json" \
  -d '{"code":"const API_KEY = \"sk-123\";","language":"typescript"}'
```

**Expected Response:**
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
  "timestamp": "2025-08-01T07:47:30.534Z"
}
```

### 2. Frontend Test Steps
1. Open http://localhost:3000 in your browser
2. Navigate to the Security Scanner section
3. Upload the file: `/home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai/demo/vulnerable-code.ts`
4. The frontend should now correctly connect to http://localhost:8000/api/security/scan

### 3. Configuration Updates Made ✅
- **Frontend API Config**: Updated to point to port 8000
- **Environment Variables**: Frontend .env updated to `REACT_APP_API_BASE_URL=http://localhost:8000`
- **CORS**: Backend configured to accept requests from http://localhost:3000

### 4. Available Endpoints
- `GET /health` - Health check
- `GET /api/health` - API health check
- `POST /api/security/scan` - Security vulnerability scanning
- `POST /api/auth/login` - Authentication (mock)
- `POST /api/auth/register` - Registration (mock)

### 5. Vulnerable Code Test File
File: `/home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai/demo/vulnerable-code.ts`

Contains intentional vulnerabilities:
- Hardcoded API keys
- SQL injection risks
- XSS vulnerabilities
- Weak cryptography (MD5)
- Insecure random generation

## Next Steps
1. Test file upload in the browser
2. Verify vulnerability detection results
3. Test additional security features
4. Run full CI/CD pipeline with SonarQube integration

## Troubleshooting
If you encounter any issues:
1. Check backend logs in terminal
2. Verify both servers are running on correct ports
3. Check browser console for frontend errors
4. Verify CORS configuration if needed
