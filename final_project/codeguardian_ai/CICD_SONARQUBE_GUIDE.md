# 🚀 CI/CD Pipeline & SonarQube Integration - Complete Setup Guide

## 📋 Table of Contents
1. [GitHub Actions CI/CD Setup](#-step-1-github-actions-cicd-setup)
2. [SonarQube Integration](#-step-2-sonarqube-integration)
3. [Local Testing Environment](#-step-3-local-testing-environment)
4. [Browser Testing](#-step-4-browser-testing)
5. [Production Deployment](#-step-5-production-deployment)

---

## 🎯 Overview

This guide sets up a complete DevOps pipeline for CodeGuardian AI with:
- ✅ **Automated CI/CD** with GitHub Actions
- ✅ **Code Quality Analysis** with SonarQube
- ✅ **Security Scanning** with Snyk and CodeQL
- ✅ **Local Development** environment
- ✅ **Browser Testing** for frontend and backend

---

## 🔧 Step 1: GitHub Actions CI/CD Setup

### 1.1 Repository Configuration

Your repository already has enhanced CI/CD workflows:
- `/.github/workflows/ci-cd.yml` - Basic pipeline
- `/.github/workflows/enhanced-ci-cd.yml` - Advanced pipeline with parallel jobs

### 1.2 Required GitHub Secrets

Navigate to: **Repository → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value | Description |
|-------------|--------|-------------|
| `SONAR_TOKEN` | `sqb_xxxxx...` | SonarQube authentication token |
| `SONAR_HOST_URL` | `https://sonarcloud.io` | SonarQube server URL |
| `SNYK_TOKEN` | `12345678-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | Snyk security token |
| `CODECOV_TOKEN` | `a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | Code coverage token |

### 1.3 Setting up SonarCloud

#### Create SonarCloud Account
1. Visit [SonarCloud.io](https://sonarcloud.io)
2. Sign in with GitHub
3. Import your repository
4. Generate authentication token

#### Configure Project
1. **Project Key**: `codeguardian-ai`
2. **Organization**: Your GitHub username
3. **Quality Gate**: Create custom gate for security projects

### 1.4 Pipeline Features

The enhanced pipeline includes:
- **Parallel Testing**: Backend and frontend tests run simultaneously
- **Security Scanning**: Snyk + CodeQL analysis
- **Code Quality**: SonarQube integration with quality gates
- **Performance Testing**: Lighthouse audits
- **Deployment**: Automated staging and production deployments

---

## 🔍 Step 2: SonarQube Integration

### 2.1 Quality Gate Configuration

The pipeline uses a custom quality gate optimized for security projects:

**Quality Gate Rules:**
- New Coverage: ≥ 80%
- Duplicated Lines: ≤ 3%
- Maintainability Rating: A
- Reliability Rating: A
- Security Rating: A
- Security Hotspots Reviewed: 100%

### 2.2 Analysis Configuration

The `sonar-project.properties` file configures:
- **Source Analysis**: `backend/src/`, `frontend/src/`
- **Test Coverage**: Backend and frontend coverage reports
- **Exclusions**: node_modules, build files, test files
- **Security Analysis**: Enhanced security rule set

### 2.3 Local SonarQube Analysis

Run SonarQube analysis locally:

```bash
# Install SonarQube Scanner
npm install -g sonarqube-scanner

# Run analysis
cd /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai
sonar-scanner \
  -Dsonar.projectKey=codeguardian-ai \
  -Dsonar.organization=alimurtadho \
  -Dsonar.sources=backend/src/,frontend/src/ \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=$SONAR_TOKEN
```

---

## 🖥️ Step 3: Local Testing Environment

### 3.1 Quick Setup

Use the automated setup script:

```bash
cd /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai
./setup-local-development.sh
```

### 3.2 Manual Setup Steps

1. **Install Prerequisites**
   ```bash
   # Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Docker
   sudo apt-get install docker.io docker-compose
   ```

2. **Environment Configuration**
   ```bash
   # Backend .env
   cp backend/.env.example backend/.env
   
   # Frontend .env
   echo "REACT_APP_API_BASE_URL=http://localhost:8000/api" > frontend/.env
   ```

3. **Start Services**
   ```bash
   # Start all services
   ./start-dev.sh
   
   # Or manually:
   docker-compose up -d postgres  # Database
   cd backend && npm run dev      # Backend API
   cd frontend && npm start       # Frontend
   ```

### 3.3 Development Commands

```bash
# Check service status
./status-dev.sh

# View logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Run tests
cd backend && npm test -- --testPathPattern="basic\.test\.js|services\.test\.js"
cd frontend && npm test

# Stop all services
./stop-dev.sh
```

---

## 🌐 Step 4: Browser Testing

### 4.1 Service URLs

After starting the development environment:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs
- **Database**: localhost:5432

### 4.2 Backend API Testing

#### Health Check
```bash
# Test API health
curl http://localhost:8000/health
# Expected: {"status":"ok","timestamp":"..."}
```

#### Authentication Testing
```javascript
// In browser console (F12)
// Test registration
fetch('http://localhost:8000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'securepassword123'
  })
}).then(r => r.json()).then(console.log);
```

#### Security Scanning Test
```javascript
// Test security analysis
const token = localStorage.getItem('authToken');
fetch('http://localhost:8000/api/security/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    code: 'const API_KEY = "sk-1234567890abcdef"; const query = "SELECT * FROM users WHERE id = " + userId;',
    language: 'javascript'
  })
}).then(r => r.json()).then(console.log);
```

### 4.3 Frontend Testing Checklist

Visit http://localhost:3000 and verify:

- [ ] ✅ **Page loads without console errors**
- [ ] ✅ **Registration form works**
- [ ] ✅ **Login redirects to dashboard**
- [ ] ✅ **File upload functionality**
- [ ] ✅ **Security scanning displays results**
- [ ] ✅ **Export reports function**
- [ ] ✅ **Responsive design on mobile**
- [ ] ✅ **Logout clears authentication**

### 4.4 Performance Testing

```javascript
// Lighthouse audit in Chrome DevTools
// F12 → Lighthouse → Analyze page load
// Target scores: Performance >80, Accessibility >90

// Measure page load time
window.addEventListener('load', () => {
  const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
  console.log('Page load time:', loadTime, 'ms');
});
```

---

## 🚀 Step 5: Production Deployment

### 5.1 Docker Configuration

The project includes Docker configurations:

```bash
# Build Docker images
docker build -t codeguardian-backend:latest -f backend/Dockerfile .
docker build -t codeguardian-frontend:latest -f frontend/Dockerfile .

# Run with Docker Compose
docker-compose up -d
```

### 5.2 Environment Variables for Production

```bash
# Backend production .env
DATABASE_URL="postgresql://user:pass@prod-db:5432/codeguardian"
JWT_SECRET="production-super-secret-jwt-key-64-chars-minimum-length"
NODE_ENV="production"
PORT=8000
CORS_ORIGIN="https://yourdomain.com"

# Frontend production .env
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

### 5.3 Deployment Platforms

#### Heroku Deployment
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login and create apps
heroku login
heroku create codeguardian-backend
heroku create codeguardian-frontend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev -a codeguardian-backend

# Deploy
git push heroku main
```

#### AWS Deployment
```bash
# Using AWS Copilot
curl -Lo copilot https://github.com/aws/copilot-cli/releases/latest/download/copilot-linux
chmod +x copilot && sudo mv copilot /usr/local/bin

# Initialize application
copilot app init codeguardian-ai
copilot env init --name production
copilot svc init --name backend
copilot svc init --name frontend
```

#### DigitalOcean Deployment
```bash
# Using DigitalOcean App Platform
# Create droplet and configure Docker
doctl apps create --spec .do/app.yaml
```

---

## 📊 Monitoring & Observability

### 6.1 Application Monitoring

```bash
# Health monitoring endpoint
curl http://localhost:8000/health
curl http://localhost:8000/api/health/db

# Logs monitoring
tail -f backend/logs/app.log | grep ERROR
tail -f backend/logs/access.log
```

### 6.2 Performance Monitoring

```javascript
// Frontend performance monitoring
window.addEventListener('load', () => {
  // Core Web Vitals
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log(`${entry.name}: ${entry.value}`);
    });
  }).observe({entryTypes: ['measure']});
});

// API response time monitoring
const monitorAPI = (url) => {
  const start = performance.now();
  return fetch(url).then(response => {
    const end = performance.now();
    console.log(`API ${url}: ${end - start}ms`);
    return response;
  });
};
```

### 6.3 Error Tracking

```bash
# Backend error tracking
cd backend
npm install --save-dev winston-daily-rotate-file

# Frontend error tracking  
cd frontend
npm install --save-dev @sentry/react
```

---

## 🔧 Development Workflow

### 7.1 Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/new-security-scanner

# 2. Develop locally
./start-dev.sh
# Make changes...

# 3. Run tests
cd backend && npm test
cd frontend && npm test

# 4. Check code quality
npm run lint
npm run format

# 5. Commit and push
git add .
git commit -m "feat: add new security scanner"
git push origin feature/new-security-scanner

# 6. Create Pull Request
# → GitHub Actions will run CI/CD pipeline
# → SonarQube will analyze code quality
# → Security scans will run
```

### 7.2 Code Review Process

1. **Automated Checks**:
   - ✅ All tests pass
   - ✅ Code coverage > 80%
   - ✅ No security vulnerabilities
   - ✅ Code quality gate passes

2. **Manual Review**:
   - Code follows project standards
   - Documentation updated
   - Breaking changes noted

3. **Merge Process**:
   - Squash and merge
   - Delete feature branch
   - Deploy to staging automatically

### 7.3 Release Process

```bash
# 1. Create release branch
git checkout -b release/v2.1.0

# 2. Update version numbers
npm version minor

# 3. Update CHANGELOG.md
# Add release notes...

# 4. Create release PR
# Merge to main triggers production deployment

# 5. Tag release
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0
```

---

## 🎯 Success Criteria

Your CI/CD pipeline is successful when:

### ✅ Automated Testing
- [ ] Backend tests: 24/24 passing
- [ ] Frontend tests: All passing
- [ ] Integration tests: API ↔ Frontend working
- [ ] Security tests: No high-severity vulnerabilities

### ✅ Code Quality
- [ ] SonarQube Quality Gate: PASSED
- [ ] Code coverage: ≥ 80%
- [ ] Duplicated code: ≤ 3%
- [ ] Maintainability: A rating

### ✅ Security
- [ ] Snyk scan: No high-severity issues
- [ ] CodeQL scan: No security alerts
- [ ] Dependency scan: All dependencies secure
- [ ] Security hotspots: 100% reviewed

### ✅ Performance
- [ ] Lighthouse score: ≥ 80
- [ ] API response time: < 500ms
- [ ] Page load time: < 3s
- [ ] Bundle size optimized

### ✅ Deployment
- [ ] Staging deployment: Automated
- [ ] Production deployment: Automated on main branch
- [ ] Rollback capability: Available
- [ ] Health checks: Passing

---

## 📚 Additional Resources

### Documentation
- **Setup Guide**: `LOCAL_DEVELOPMENT_GUIDE.md`
- **Testing Guide**: `backend/TESTING_GUIDE.md`
- **Browser Testing**: `BROWSER_TESTING_GUIDE.md`
- **API Documentation**: `backend/README.md`

### Monitoring Dashboards
- **SonarCloud**: https://sonarcloud.io/project/overview?id=codeguardian-ai
- **GitHub Actions**: Repository → Actions tab
- **Codecov**: https://codecov.io/gh/alimurtadho/assingment_project_AI

### Commands Quick Reference
```bash
# Local development
./setup-local-development.sh  # One-time setup
./start-dev.sh                # Start all services
./status-dev.sh               # Check service status
./stop-dev.sh                 # Stop all services

# Testing
npm test                      # Run all tests
npm run test:coverage         # Coverage report
npm run lint                  # Code linting
npm run format               # Code formatting

# Production
docker-compose up -d          # Production deployment
docker-compose logs -f        # View logs
docker-compose down           # Stop services
```

---

## 🏆 Conclusion

This comprehensive CI/CD and SonarQube integration provides:

- **🚀 Automated Pipeline**: From code commit to production deployment
- **🔍 Quality Assurance**: Code quality, security, and performance checks
- **🖥️ Local Development**: Smooth development experience
- **🌐 Browser Testing**: Comprehensive frontend and backend testing
- **📊 Monitoring**: Real-time observability and error tracking

Your CodeGuardian AI platform now has enterprise-grade DevOps practices with automated testing, quality analysis, and deployment! 🎉

**Next Steps**: Push your code to GitHub and watch the CI/CD pipeline automatically test, analyze, and deploy your application! 🚀
