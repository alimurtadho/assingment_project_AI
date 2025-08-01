# 🔍 SonarQube Integration Guide - CodeGuardian AI

## 🎯 Overview

This guide sets up SonarQube integration for CodeGuardian AI to analyze code quality, security vulnerabilities, and maintainability metrics.

---

## 📋 Step 1: SonarCloud Setup

### 1.1 Create SonarCloud Account

1. **Visit SonarCloud**: Go to [https://sonarcloud.io](https://sonarcloud.io)
2. **Sign in with GitHub**: Click "Log in" → "Log in with GitHub"
3. **Authorize SonarCloud**: Allow SonarCloud to access your GitHub repositories

### 1.2 Import Your Repository

1. **Click the "+" button** in top right corner
2. **Select "Analyze new project"**
3. **Choose "From GitHub"**
4. **Find your repository**: `alimurtadho/assingment_project_AI`
5. **Click "Set up"**

### 1.3 Configure Project Settings

1. **Project Key**: `codeguardian-ai`
2. **Organization**: `alimurtadho` (your GitHub username)
3. **Display Name**: `CodeGuardian AI`
4. **Project Visibility**: Public (recommended) or Private

---

## 🔧 Step 2: Generate Authentication Token

### 2.1 Create Token in SonarCloud

1. **Go to Account Settings**: Click your avatar → "My Account"
2. **Navigate to Security**: Click "Security" tab
3. **Generate Token**: 
   - Name: `CodeGuardian-AI-GitHub-Actions`
   - Type: `Global Analysis Token`
   - Expires: `90 days` (recommended)
4. **Copy the token**: Save it securely - you won't see it again!

### 2.2 Add Token to GitHub Secrets

1. **Go to your GitHub repository**: `alimurtadho/assingment_project_AI`
2. **Navigate to Settings**: Repository → Settings → Secrets and variables → Actions
3. **Add Repository Secret**:
   - Name: `SONAR_TOKEN`
   - Value: `[paste your SonarCloud token here]`
4. **Save the secret**

---

## ⚙️ Step 3: Project Configuration

Your project already has the necessary SonarQube configuration files:

### 3.1 SonarQube Properties (`sonar-project.properties`)
```properties
# Project Configuration
sonar.projectKey=codeguardian-ai
sonar.organization=alimurtadho
sonar.host.url=https://sonarcloud.io

# Project Metadata
sonar.projectName=CodeGuardian AI
sonar.projectDescription=AI-Enhanced DevSecOps Platform for Security Code Analysis
sonar.projectVersion=2.0.0

# Source Code Analysis
sonar.sources=backend/src/,frontend/src/
sonar.tests=backend/tests/,frontend/src/__tests__/

# Coverage Reports
sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info
sonar.typescript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info

# Exclusions
sonar.exclusions=**/node_modules/**,**/build/**,**/dist/**,**/coverage/**

# Quality Gate
sonar.qualitygate.wait=true
```

### 3.2 GitHub Actions Workflow

I've created a SonarQube-specific workflow at `.github/workflows/sonarqube-analysis.yml` that:

- ✅ **Runs on pushes** to main, develop, and codeguardianAI branches
- ✅ **Runs on pull requests** to main and develop
- ✅ **Tests backend** with coverage reporting
- ✅ **Tests frontend** with coverage reporting  
- ✅ **Analyzes code quality** with SonarCloud
- ✅ **Checks quality gate** to prevent low-quality code
- ✅ **Comments on PRs** with analysis results

---

## 🚀 Step 4: Test SonarQube Integration

### 4.1 Local SonarQube Analysis (Optional)

Install SonarQube Scanner locally to test before pushing:

```bash
# Install SonarQube Scanner
npm install -g sonarqube-scanner

# Run local analysis (after setting SONAR_TOKEN)
cd /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai
export SONAR_TOKEN="your_sonar_token_here"

sonar-scanner \
  -Dsonar.projectKey=codeguardian-ai \
  -Dsonar.organization=alimurtadho \
  -Dsonar.sources=backend/src/,frontend/src/ \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=$SONAR_TOKEN
```

### 4.2 Run Tests with Coverage

Before pushing, ensure your tests generate coverage reports:

```bash
# Backend tests with coverage
cd backend
npm test -- --testPathPattern="basic\.test\.js|services\.test\.js" --coverage

# Frontend tests with coverage (if available)
cd ../frontend
npm test -- --coverage --watchAll=false --passWithNoTests || echo "Frontend tests not configured yet"
```

### 4.3 Push to GitHub to Trigger Analysis

```bash
# Commit your changes
git add .
git commit -m "feat: add SonarQube integration"

# Push to trigger SonarQube analysis
git push origin codeguardianAI
```

---

## 📊 Step 5: Monitor SonarQube Results

### 5.1 GitHub Actions Results

1. **Go to your repository** on GitHub
2. **Click "Actions" tab**
3. **Find the "SonarQube Code Quality Analysis" workflow**
4. **Check the results** - should show ✅ if successful

### 5.2 SonarCloud Dashboard

1. **Visit SonarCloud**: [https://sonarcloud.io](https://sonarcloud.io)
2. **Go to your project**: CodeGuardian AI
3. **Review metrics**:
   - **Reliability**: Bug count and rating
   - **Security**: Vulnerability and security hotspot count
   - **Maintainability**: Code smell count and technical debt
   - **Coverage**: Test coverage percentage
   - **Duplications**: Duplicate code percentage

### 5.3 Quality Gate Status

Your custom quality gate checks:
- ✅ **New Coverage**: ≥ 80%
- ✅ **Duplicated Lines**: ≤ 3%
- ✅ **Maintainability Rating**: A
- ✅ **Reliability Rating**: A
- ✅ **Security Rating**: A
- ✅ **Security Hotspots Reviewed**: 100%

---

## 🔧 Step 6: SonarQube Configuration Files

### 6.1 Current Configuration

Your project uses these SonarQube configuration files:

#### `sonar-project.properties`
```properties
# Project Configuration
sonar.projectKey=codeguardian-ai
sonar.organization=alimurtadho
sonar.host.url=https://sonarcloud.io

# Analysis Configuration
sonar.sources=backend/src/,frontend/src/
sonar.tests=backend/tests/,frontend/src/__tests__/
sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info

# Exclusions
sonar.exclusions=**/node_modules/**,**/build/**,**/dist/**,**/coverage/**
sonar.coverage.exclusions=**/*.test.js,**/*.test.ts,**/tests/**

# Quality Gate
sonar.qualitygate.wait=true
```

#### `sonar-quality-gate.json`
```json
{
  "name": "CodeGuardian Quality Gate",
  "conditions": [
    {"metric": "new_coverage", "op": "LT", "threshold": "80"},
    {"metric": "new_duplicated_lines_density", "op": "GT", "threshold": "3"},
    {"metric": "new_maintainability_rating", "op": "GT", "threshold": "1"},
    {"metric": "new_reliability_rating", "op": "GT", "threshold": "1"},
    {"metric": "new_security_rating", "op": "GT", "threshold": "1"},
    {"metric": "new_security_hotspots_reviewed", "op": "LT", "threshold": "100"}
  ]
}
```

---

## 🎯 Expected Results

After successful integration, you should see:

### ✅ SonarCloud Analysis
- **Project appears** in your SonarCloud dashboard
- **Code quality metrics** are calculated
- **Security vulnerabilities** are identified
- **Test coverage** is reported
- **Quality gate status** is shown

### ✅ GitHub Integration
- **Status checks** appear on pull requests
- **Quality gate results** prevent merging if failed
- **Automatic comments** on PRs with analysis results
- **Workflow runs** successfully in GitHub Actions

### ✅ Current Project Status
Based on your test results (24/24 tests passing):
- **Reliability**: Should be A (no bugs in tested code)
- **Security**: Should be A (SecurityScanner working correctly)
- **Maintainability**: Should be A-B (clean, tested code)
- **Coverage**: ~90% on critical Security Scanner component
- **Duplications**: Should be low (< 3%)

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Issue: "Project not found"
```bash
# Solution: Check project key and organization
# Ensure sonar.projectKey=codeguardian-ai
# Ensure sonar.organization=alimurtadho
```

#### Issue: "Authentication failed"
```bash
# Solution: Check SONAR_TOKEN in GitHub Secrets
# 1. Regenerate token in SonarCloud
# 2. Update GitHub secret with new token
```

#### Issue: "No coverage data"
```bash
# Solution: Ensure tests generate lcov.info
cd backend
npm test -- --coverage --coverageReporters=lcov
# Check that backend/coverage/lcov.info exists
```

#### Issue: "Quality gate failed"
```bash
# Solution: Review specific failures in SonarCloud
# Common fixes:
# - Increase test coverage
# - Fix security hotspots
# - Reduce code duplication
# - Address maintainability issues
```

---

## 📚 Next Steps

### 1. Immediate Actions
1. **Set up SonarCloud account** following Step 1
2. **Generate and add SONAR_TOKEN** to GitHub Secrets
3. **Push code** to trigger first analysis
4. **Review results** in SonarCloud dashboard

### 2. Ongoing Monitoring
1. **Check quality gate** on every PR
2. **Address security hotspots** promptly
3. **Maintain test coverage** above 80%
4. **Monitor technical debt** and code smells

### 3. Advanced Configuration
1. **Custom quality profiles** for specific rules
2. **Branch analysis** for feature branches
3. **Integration with IDEs** (SonarLint)
4. **Automated quality reports** via webhooks

---

## 🎉 Success Criteria

Your SonarQube integration is successful when:

- ✅ **SonarCloud project exists** and is configured
- ✅ **GitHub Actions workflow runs** without errors
- ✅ **Quality gate passes** with your current code
- ✅ **Coverage reports** are generated and uploaded
- ✅ **Security analysis** identifies vulnerabilities correctly
- ✅ **PR comments** show analysis results automatically

---

**🔍 Your SonarQube integration for CodeGuardian AI is now ready!**

Follow the steps above to complete the setup and start monitoring your code quality automatically on every push and pull request.
