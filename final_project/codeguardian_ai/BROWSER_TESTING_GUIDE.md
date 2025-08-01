# 🌐 Browser Testing Guide for CodeGuardian AI

## 🎯 Overview

This guide provides comprehensive browser testing procedures for both backend APIs and frontend interface of CodeGuardian AI platform.

---

## 🔧 Step 1: Start Local Environment

### Quick Start
```bash
# Navigate to project root
cd /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai

# Start all services
./start-dev.sh

# Wait for services to start (30-60 seconds)
# Check status
./status-dev.sh
```

### Manual Start (Alternative)
```bash
# Terminal 1: Database
docker-compose up -d postgres

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend  
cd frontend
npm start
```

---

## 🔍 Step 2: Backend API Testing in Browser

### 2.1 Health Check Endpoints

Open these URLs in your browser:

#### Basic Health Check
```
http://localhost:8000/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-31T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

#### API Health Check
```
http://localhost:8000/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "version": "2.0.0",
  "database": "connected",
  "services": ["auth", "security", "analysis"]
}
```

### 2.2 API Documentation

#### Swagger/OpenAPI Documentation
```
http://localhost:8000/api/docs
```
**What to Check:**
- ✅ Interactive API documentation loads
- ✅ All endpoints are listed
- ✅ Authentication methods shown
- ✅ Request/response schemas displayed

### 2.3 Authentication Testing

#### Test Registration (using browser DevTools)

1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Run this JavaScript:**

```javascript
// Test user registration
fetch('http://localhost:8000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'securepassword123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Registration result:', data);
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    console.log('✅ Token saved to localStorage');
  }
})
.catch(error => console.error('❌ Registration error:', error));
```

#### Test Login
```javascript
// Test user login
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'securepassword123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Login result:', data);
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    console.log('✅ Login successful, token saved');
  }
})
.catch(error => console.error('❌ Login error:', error));
```

### 2.4 Security Analysis Testing

#### Test Security Scanning
```javascript
// Get token from localStorage
const token = localStorage.getItem('authToken');

// Test security scanning
fetch('http://localhost:8000/api/security/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    code: `
      const API_KEY = "sk-1234567890abcdef";
      const query = "SELECT * FROM users WHERE id = " + userId;
      document.innerHTML = userInput;
      const hash = crypto.createHash('md5').update(password).digest('hex');
    `,
    language: 'javascript'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Security scan result:', data);
  console.log('Vulnerabilities found:', data.vulnerabilities?.length || 0);
  console.log('Risk score:', data.riskScore);
})
.catch(error => console.error('❌ Security scan error:', error));
```

---

## 🎨 Step 3: Frontend Testing in Browser

### 3.1 Open Frontend Application

**URL:** http://localhost:3000

### 3.2 Visual Testing Checklist

#### Landing Page
- [ ] ✅ **Page loads without errors**
- [ ] ✅ **Logo and branding visible**
- [ ] ✅ **Navigation menu working**
- [ ] ✅ **Responsive design on different screen sizes**
- [ ] ✅ **No console errors in DevTools**

#### Authentication Flow
- [ ] ✅ **Login form accessible**
- [ ] ✅ **Registration form working**
- [ ] ✅ **Form validation working**
- [ ] ✅ **Error messages display properly**
- [ ] ✅ **Success messages show**
- [ ] ✅ **Redirect after login works**

#### Dashboard/Main Interface
- [ ] ✅ **Dashboard loads after login**
- [ ] ✅ **User information displayed**
- [ ] ✅ **Navigation between sections**
- [ ] ✅ **Logout functionality**

#### File Upload & Security Scanning
- [ ] ✅ **File upload component visible**
- [ ] ✅ **Drag & drop functionality**
- [ ] ✅ **File type validation**
- [ ] ✅ **Upload progress indicator**
- [ ] ✅ **Security scan results display**
- [ ] ✅ **Vulnerability details show**
- [ ] ✅ **Export/download reports**

### 3.3 Browser DevTools Testing

#### Console Tab (F12 → Console)
```javascript
// Check React app state
console.log('React version:', React.version);

// Check API connection
fetch('http://localhost:8000/api/health')
  .then(r => r.json())
  .then(data => console.log('API Health:', data));

// Check localStorage
console.log('Auth token:', localStorage.getItem('authToken'));

// Check app state (if Redux/Context is used)
// console.log('App state:', store.getState());
```

#### Network Tab
**Check for:**
- ✅ **All API calls successful (200 status)**
- ✅ **No failed requests (4xx, 5xx)**
- ✅ **Reasonable response times (< 2s)**
- ✅ **Proper authentication headers**
- ✅ **CORS headers present**

#### Application Tab
**Check:**
- ✅ **localStorage contains auth token**
- ✅ **sessionStorage if used**
- ✅ **Cookies if used**
- ✅ **Service workers if implemented**

### 3.4 Responsive Testing

Test on different screen sizes:
- **Desktop**: 1920x1080
- **Laptop**: 1366x768  
- **Tablet**: 768x1024
- **Mobile**: 375x667

**Chrome DevTools:**
1. Press F12
2. Click device toggle icon
3. Select different devices
4. Test all major functions

---

## 🧪 Step 4: End-to-End User Flow Testing

### Complete User Journey Test

#### 1. New User Registration
```
1. Visit: http://localhost:3000
2. Click "Sign Up" or "Register"
3. Fill form:
   - Username: testuser
   - Email: test@example.com  
   - Password: securepassword123
4. Submit form
5. ✅ Check: Registration success message
6. ✅ Check: Redirect to dashboard/login
```

#### 2. User Login
```
1. Click "Login" 
2. Enter credentials:
   - Email: test@example.com
   - Password: securepassword123
3. Submit form
4. ✅ Check: Login success
5. ✅ Check: Dashboard loads
6. ✅ Check: User menu shows username
```

#### 3. Security Analysis Workflow
```
1. Navigate to security analysis section
2. Upload a code file OR paste code
3. Select language (JavaScript/Python/etc.)
4. Click "Analyze" or "Scan"
5. ✅ Check: Analysis starts (loading indicator)
6. ✅ Check: Results display
7. ✅ Check: Vulnerabilities listed
8. ✅ Check: Risk score shown
9. ✅ Check: Detailed descriptions
10. ✅ Check: Export functionality
```

#### 4. Project Management (if available)
```
1. Navigate to projects section
2. Create new project
3. Upload multiple files
4. View project dashboard
5. ✅ Check: All functions work
```

#### 5. User Logout
```
1. Click user menu
2. Click "Logout"
3. ✅ Check: Redirected to home/login
4. ✅ Check: Authentication cleared
5. ✅ Check: Can't access protected routes
```

---

## 🔍 Step 5: Advanced Browser Testing

### 5.1 Performance Testing

#### Lighthouse Audit
1. **Open DevTools** (F12)
2. **Go to Lighthouse tab**
3. **Click "Analyze page load"**
4. **Check scores:**
   - Performance: > 80
   - Accessibility: > 90
   - Best Practices: > 80
   - SEO: > 80

#### Performance Metrics
```javascript
// Measure page load time
window.addEventListener('load', () => {
  const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
  console.log('Page load time:', loadTime, 'ms');
});

// Measure API response times
const start = performance.now();
fetch('http://localhost:8000/api/health')
  .then(() => {
    const end = performance.now();
    console.log('API response time:', end - start, 'ms');
  });
```

### 5.2 Security Testing

#### Content Security Policy
```javascript
// Check CSP headers
fetch('http://localhost:3000')
  .then(response => {
    console.log('CSP:', response.headers.get('Content-Security-Policy'));
  });
```

#### Authentication Testing
```javascript
// Test token expiration
const token = localStorage.getItem('authToken');
console.log('Token:', token);

// Try accessing protected endpoint
fetch('http://localhost:8000/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(response => {
  console.log('Auth status:', response.status);
  return response.json();
})
.then(data => console.log('Profile data:', data));
```

### 5.3 Error Handling Testing

#### Test Network Failures
```javascript
// Test offline behavior
navigator.serviceWorker?.ready.then(() => {
  console.log('Service worker ready');
});

// Simulate slow connection
// Chrome DevTools → Network → Throttling → Slow 3G
```

#### Test Invalid Inputs
- Submit forms with empty fields
- Enter invalid email formats
- Use weak passwords
- Upload invalid file types
- Enter malicious scripts in text fields

---

## 📊 Step 6: Browser Testing Checklist

### ✅ Backend API Tests
- [ ] Health endpoints return 200 OK
- [ ] API documentation accessible
- [ ] User registration works
- [ ] User login returns JWT token
- [ ] Protected endpoints require authentication
- [ ] Security scanning returns vulnerabilities
- [ ] Error handling returns proper HTTP codes
- [ ] CORS headers allow frontend requests

### ✅ Frontend Interface Tests
- [ ] Application loads without JavaScript errors
- [ ] All pages/routes accessible
- [ ] Forms validate input properly
- [ ] File upload functionality works
- [ ] Results display correctly
- [ ] Export/download features work
- [ ] Responsive design on mobile/tablet
- [ ] Performance scores > 80 in Lighthouse

### ✅ Integration Tests
- [ ] Frontend successfully calls backend APIs
- [ ] Authentication flow complete
- [ ] File upload → analysis → results pipeline
- [ ] Error messages display from API
- [ ] Loading states show during API calls
- [ ] Token refresh works (if implemented)

### ✅ Cross-Browser Tests
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on macOS)
- [ ] Edge (latest)

---

## 🐛 Troubleshooting Common Issues

### Issue: CORS Errors
```javascript
// Symptoms: "Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy"

// Solution: Check backend CORS configuration
// backend/.env should have:
// CORS_ORIGIN="http://localhost:3000"
```

### Issue: 404 API Errors
```javascript
// Check API endpoints are running
fetch('http://localhost:8000/api/health')
  .then(response => {
    if (!response.ok) {
      console.error('API not running or wrong port');
    }
  });
```

### Issue: Authentication Failures
```javascript
// Check token format and expiration
const token = localStorage.getItem('authToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token expires:', new Date(payload.exp * 1000));
  console.log('Token expired:', payload.exp * 1000 < Date.now());
}
```

### Issue: Frontend Build Errors
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 🎯 Success Criteria

Your browser testing is successful when:

- ✅ **All backend APIs return expected responses**
- ✅ **Frontend loads without console errors**
- ✅ **User can complete full registration → login → analysis workflow**
- ✅ **Security scanning returns vulnerability results**
- ✅ **Application is responsive on different screen sizes**
- ✅ **Performance scores are acceptable (>80)**
- ✅ **No major accessibility issues**

---

## 📝 Testing Report Template

Create a testing report with:

```markdown
# Browser Testing Report - CodeGuardian AI

**Date**: $(date)
**Tester**: Your Name
**Environment**: Local Development

## Backend API Results
- Health Check: ✅ Pass / ❌ Fail
- Authentication: ✅ Pass / ❌ Fail  
- Security Scanning: ✅ Pass / ❌ Fail

## Frontend Interface Results
- Page Load: ✅ Pass / ❌ Fail
- User Registration: ✅ Pass / ❌ Fail
- User Login: ✅ Pass / ❌ Fail
- Security Analysis: ✅ Pass / ❌ Fail
- File Upload: ✅ Pass / ❌ Fail

## Performance Results
- Lighthouse Score: __/100
- Page Load Time: __ ms
- API Response Time: __ ms

## Issues Found
1. Issue description...
2. Issue description...

## Recommendations
1. Recommendation...
2. Recommendation...
```

---

**🎉 Happy Testing!** Your CodeGuardian AI application is ready for comprehensive browser testing!
