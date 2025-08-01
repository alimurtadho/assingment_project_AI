# 🚀 GitHub Actions CI/CD Workflows for CodeGuardian AI

This document describes the GitHub Actions workflows created for the CodeGuardian AI project.

## 📋 Workflows Overview

### 1. **codeguardian-simple.yml** (Recommended)
A streamlined workflow with exactly two jobs as requested:
- **Job 1: Lint** - Code quality and style checking
- **Job 2: Test** - Automated testing (runs after lint succeeds)

### 2. **codeguardian-ai.yml** (Comprehensive)
A complete CI/CD pipeline with multiple jobs:
- Linting
- Testing
- Security scanning
- Build verification

## 🔧 Workflow Configuration

### **Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Only when files in `final_project/codeguardian_ai/` are changed

### **Environment:**
- Node.js 18
- PostgreSQL 15 (for testing)
- Ubuntu latest

## 📝 Job Details

### Job 1: Lint 🔍
```yaml
- Checkout code
- Setup Node.js
- Install dependencies (root, backend, frontend)
- Run ESLint on backend code
- Run ESLint on frontend code
- Report linting results
```

### Job 2: Test 🧪 (depends on lint)
```yaml
- Checkout code
- Setup Node.js
- Install dependencies
- Setup PostgreSQL test database
- Run backend tests
- Run frontend tests
- API health check
- Report test results
```

## 🎯 Workflow Features

### ✅ **Sequential Execution**
- Test job runs **only after** lint job succeeds
- Uses `needs: lint` dependency

### ✅ **Smart Detection**
- Automatically detects if package.json exists
- Runs appropriate commands based on project structure
- Graceful handling of missing scripts

### ✅ **Comprehensive Testing**
- Backend: Jest/Node.js tests
- Frontend: React Testing Library
- Database: PostgreSQL integration tests
- API: Health check verification

### ✅ **Error Handling**
- Proper exit codes
- Meaningful error messages
- Workflow status reporting

## 🚀 Usage

The workflows will automatically run when you:
1. Push code to `main` branch
2. Create/update pull request to `main`
3. Modify files in `final_project/codeguardian_ai/`

## 📊 Status Monitoring

Check workflow status at:
- GitHub repository → Actions tab
- https://github.com/alimurtadho/assingment_project_AI/actions

## 🛠️ Local Testing

To test the same steps locally:

```bash
# Navigate to project directory
cd final_project/codeguardian_ai

# Install dependencies
npm ci
cd backend && npm ci && cd ..
cd frontend && npm ci && cd ..

# Run linting
cd backend && npm run lint && cd ..
cd frontend && npm run lint && cd ..

# Run tests
cd backend && npm test && cd ..
cd frontend && npm test && cd ..
```

## 📈 Workflow Status

Current status: ✅ **Active and Running**

- **Lint Job**: Validates code quality and style
- **Test Job**: Ensures all tests pass before deployment
- **Sequential Flow**: Test runs only after successful linting

The workflows are now ready to maintain code quality and catch issues early in the development process!

---

*Created on: August 1, 2025*
*Workflows: codeguardian-simple.yml (main), codeguardian-ai.yml (comprehensive)*
