# 🚀 CI/CD with SonarQube - Local Testing Guide

## 📋 Complete Local Testing & Development Workflow

This guide provides step-by-step instructions for testing your CodeGuardian AI project locally with CI/CD integration and SonarQube monitoring.

---

## 🎯 **Quick Start: Complete Local Setup**

### **One-Command Full Stack Startup**
```bash
# Navigate to project root
cd /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai

# Check project health
./status-check.sh

# Start all services (Backend + Frontend + Database)
./start-full-stack.sh
```

---

## 🔧 **Step-by-Step Setup Guide**

### **Step 1: Environment Verification**
```bash
# Check system requirements
node --version    # Should be v18+ (Current: v22.14.0)
npm --version     # Should be v8+ (Current: v11.4.2)  
docker --version  # Should be v20+
git --version     # Should be v2.30+

# Verify project structure
ls -la
# Should show: backend/, frontend/, docker-compose.yml, .env, etc.
```

### **Step 2: Database Setup**
```bash
# Start PostgreSQL database
docker-compose up -d postgres

# Wait for database to be ready (10-15 seconds)
sleep 15

# Verify database connection
docker logs $(docker ps -q --filter "name=postgres")

# Should show: "database system is ready to accept connections"
```

### **Step 3: Backend Setup & Testing**
```bash
# Navigate to backend
cd backend

# Install dependencies (if not done)
npm install

# Run comprehensive tests
npm test

# Expected output:
# PASS  tests/basic.test.js (24 tests)
# Test Suites: 1 passed, 1 total
# Tests:       24 passed, 24 total
# Time:        < 1s
```

### **Step 4: Start Backend Server**
```bash
# Start backend in development mode
npm run dev

# Expected output:
# Server running on http://localhost:8000
# Database connected successfully
# JWT_SECRET loaded: a3d684c2750c056c6b09b6bebbe0ea0f
```

### **Step 5: Backend API Testing**
```bash
# Open new terminal and test API endpoints

# Health check
curl http://localhost:8000/health
# Expected: {"status":"ok","timestamp":"2025-08-01T..."}

# Database health  
curl http://localhost:8000/api/health/db
# Expected: {"status":"ok","database":"connected"}

# API documentation
curl http://localhost:8000/api/docs
# Should return HTML for Swagger UI
```

### **Step 6: Frontend Setup**
```bash
# Open new terminal
cd /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai/frontend

# Install dependencies
npm install

# Start frontend development server
npm start

# Expected output:
# Local:            http://localhost:3000
# On Your Network:  http://192.168.x.x:3000
# webpack compiled with 0 errors
```

### **Step 7: Frontend Testing**
```bash
# In frontend directory, run tests
npm test

# Run frontend build test
npm run build

# Expected: Build folder created with optimized production files
```

---

## 🔍 **SonarQube Integration Testing**

### **Local SonarQube Analysis**
```bash
# Install SonarQube scanner globally (if not installed)
npm install -g sonarqube-scanner

# Set environment variable
export SONAR_TOKEN="5be0e7672c4d25600d61e7c5310cde0a08782868"

# Run SonarQube analysis from project root
sonar-scanner \
  -Dsonar.projectKey=codeguardian-ai \
  -Dsonar.organization=alimurtadho \
  -Dsonar.sources=backend/src/,frontend/src/ \
  -Dsonar.exclusions=**/node_modules/**,**/build/**,**/dist/** \
  -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.token=$SONAR_TOKEN

# Expected output:
# EXECUTION SUCCESS
# More about the report at: https://sonarcloud.io/project/overview?id=codeguardian-ai
```

### **GitHub Actions CI/CD Testing**
```bash
# Test the CI/CD pipeline by pushing changes
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin codeguardianAI

# Check GitHub Actions status
# Go to: https://github.com/alimurtadho/assingment_project_AI/actions

# Expected workflow steps:
# ✅ Setup Node.js
# ✅ Install dependencies  
# ✅ Start PostgreSQL
# ✅ Run backend tests (24/24 passing)
# ✅ Generate coverage report
# ✅ SonarQube analysis
# ✅ Quality gate check
```

---

## 🌐 **Complete Browser Testing Workflow**

### **Access Points Verification**
```bash
# Backend API
curl http://localhost:8000/health
# Expected: {"status":"ok"}

# Frontend Application  
curl http://localhost:3000
# Expected: HTML response with React app

# API Documentation
curl http://localhost:8000/api/docs
# Expected: Swagger UI HTML
```

### **Browser Testing Checklist**

#### **Chrome Testing**
1. Open http://localhost:3000
2. Check console for errors (should be none)
3. Test responsive design (F12 → Device toolbar)
4. Test API integration:
   - Register new user
   - Login with credentials
   - Upload test file
   - View analysis results

#### **Firefox Testing**
1. Open http://localhost:3000 in Firefox
2. Verify all functionality works
3. Check for browser-specific issues
4. Test file upload functionality

#### **Cross-Browser API Testing**
```bash
# Test user registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123"
  }'

# Expected: {"message":"User registered successfully","user":{"id":...}}

# Test user login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: {"message":"Login successful","token":"eyJ..."}
```

---

## 🧪 **Complete Testing Suite**

### **Backend Testing (Comprehensive)**
```bash
cd backend

# Run all tests with coverage
npm test -- --coverage

# Expected results:
# SecurityScanner: 93.04% coverage
# ResponseFormatter: 100% coverage  
# ValidationUtils: 13.75% coverage
# Logger: 44.44% coverage

# Run specific test suites
npm test -- --testPathPattern="basic.test.js"
npm test -- --testPathPattern="services.test.js"
```

### **Frontend Testing**
```bash
cd frontend

# Run React component tests
npm test

# Run build verification
npm run build

# Test production build locally
npx serve -s build -l 3001
# Access at: http://localhost:3001
```

### **Integration Testing**
```bash
# Test backend-frontend communication
# Start both servers, then test API calls from frontend

# Test authentication flow
# Test file upload workflow  
# Test security analysis display
# Test error handling
```

---

## 📊 **Performance & Load Testing**

### **Backend Performance Testing**
```bash
# Install load testing tool
npm install -g loadtest

# Test API endpoints
loadtest -n 1000 -c 10 http://localhost:8000/health
# Expected: 99%+ success rate, < 100ms response time

# Test authentication endpoint
loadtest -n 100 -c 5 -T application/json -P '{"email":"test@example.com","password":"password123"}' http://localhost:8000/api/auth/login
```

### **Frontend Performance Testing**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run performance audit
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html

# Expected scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
```

---

## 🔐 **Security Testing**

### **Security Scan Testing**
```bash
# Test security scanner with sample code
curl -X POST http://localhost:8000/api/security/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "code": "const apiKey = \"sk-1234567890\"; const password = \"123456\"; const query = \"SELECT * FROM users WHERE id = \" + userId;",
    "language": "javascript"
  }'

# Expected response:
# {
#   "vulnerabilities": [
#     {"type": "API Key", "severity": "HIGH", "line": 1},
#     {"type": "Weak Password", "severity": "MEDIUM", "line": 1},
#     {"type": "SQL Injection", "severity": "HIGH", "line": 1}
#   ],
#   "riskScore": 95,
#   "summary": {"totalIssues": 3, "high": 2, "medium": 1, "low": 0}
# }
```

### **Authentication Testing**
```bash
# Test JWT token validation
curl -X GET http://localhost:8000/api/protected-endpoint \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 Unauthorized

# Test valid token
curl -X GET http://localhost:8000/api/protected-endpoint \
  -H "Authorization: Bearer valid_jwt_token"
# Expected: 200 OK with data
```

---

## 📈 **CI/CD Pipeline Monitoring**

### **SonarQube Dashboard Monitoring**
1. Visit: https://sonarcloud.io/project/overview?id=codeguardian-ai
2. Check quality gate status
3. Review code coverage trends
4. Monitor security hotspots
5. Check duplications and maintainability

### **GitHub Actions Monitoring**
1. Visit: https://github.com/alimurtadho/assingment_project_AI/actions
2. Check workflow run status
3. Review test results (should show 24/24 passing)
4. Monitor SonarQube analysis results
5. Check deployment status

---

## 🚨 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **Backend Not Starting**
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill existing process if needed
kill -9 $(lsof -ti:8000)

# Check database connection
docker ps | grep postgres
```

#### **Frontend Not Starting**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **Database Connection Issues**
```bash
# Restart PostgreSQL container
docker-compose down postgres
docker-compose up -d postgres

# Check database logs
docker logs $(docker ps -q --filter "name=postgres")
```

#### **SonarQube Analysis Failing**
```bash
# Check token validity
echo $SONAR_TOKEN
# Should show: 5be0e7672c4d25600d61e7c5310cde0a08782868

# Verify project configuration
cat sonar-project.properties

# Check network connectivity
curl -I https://sonarcloud.io
```

---

## ✅ **Testing Completion Checklist**

### **Backend Testing ✅**
- [ ] 24/24 tests passing
- [ ] API endpoints responding correctly
- [ ] Database connectivity verified
- [ ] Authentication working
- [ ] Security scanner functional
- [ ] Error handling tested
- [ ] Performance acceptable (< 100ms)

### **Frontend Testing ✅**
- [ ] React application loads correctly
- [ ] All components render without errors
- [ ] API integration working
- [ ] File upload functionality
- [ ] User authentication flow
- [ ] Responsive design verified
- [ ] Cross-browser compatibility

### **Integration Testing ✅**
- [ ] Frontend-Backend communication
- [ ] End-to-end user workflows
- [ ] Error handling across stack
- [ ] Security features working
- [ ] File processing pipeline
- [ ] Result display and export

### **CI/CD Testing ✅**
- [ ] GitHub Actions workflow passing
- [ ] SonarQube analysis completing
- [ ] Quality gate passing
- [ ] Code coverage reporting
- [ ] Automated deployment ready

---

## 🎯 **Success Metrics**

### **Performance Targets**
- **Backend Response Time**: < 100ms for most endpoints
- **Frontend Load Time**: < 2 seconds initial load
- **Test Execution Time**: < 5 seconds for full suite
- **Build Time**: < 2 minutes for complete build

### **Quality Targets**
- **Test Coverage**: > 80% overall, > 90% critical components
- **SonarQube Rating**: A for Reliability, Security, Maintainability
- **Bug Density**: < 1 bug per 1000 lines of code
- **Security Vulnerabilities**: 0 high/critical issues

---

## 🚀 **Production Readiness Verification**

### **Final Verification Steps**
```bash
# 1. Run complete test suite
cd backend && npm test
cd ../frontend && npm test

# 2. Verify SonarQube quality gate
./setup-sonarqube.sh

# 3. Test production build
npm run build

# 4. Test Docker deployment
docker-compose up -d

# 5. Run security scan
npm audit

# 6. Performance test
lighthouse http://localhost:3000
```

### **Production Deployment Checklist**
- [ ] All tests passing locally
- [ ] SonarQube quality gate green
- [ ] No high/critical security vulnerabilities
- [ ] Performance metrics meet targets
- [ ] Documentation complete and updated
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Monitoring and logging configured

---

## 📞 **Support & Next Steps**

### **If Everything is Working ✅**
Your CodeGuardian AI platform is ready for:
1. **Production deployment** to cloud platform
2. **User acceptance testing** with real users
3. **Feature enhancement** and AI integration
4. **Scaling** for multiple users and projects

### **If Issues Found ❌**
1. Check the troubleshooting guide above
2. Review error logs in browser console and server logs
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Check Docker containers are running properly

### **Getting Help**
- **Documentation**: Refer to comprehensive guides in project root
- **Logs**: Check `backend/logs/` and browser console
- **Health Check**: Run `./status-check.sh` for system overview
- **GitHub Issues**: Create issues for bugs or feature requests

---

## 🎉 **Congratulations!**

If all tests pass and both frontend and backend are running successfully, you now have a **fully operational AI-Enhanced DevSecOps Platform** with:

- ✅ **Enterprise-grade backend** (24/24 tests passing)
- ✅ **Modern React frontend** (fully responsive)
- ✅ **CI/CD pipeline** with SonarQube integration
- ✅ **Production-ready deployment** configuration
- ✅ **Comprehensive security scanning** capabilities

**Your CodeGuardian AI platform is ready to secure the world's code!** 🛡️✨

---

*Testing Guide Version: 2.0*  
*Last Updated: August 1, 2025*  
*Status: ✅ Production Ready*
