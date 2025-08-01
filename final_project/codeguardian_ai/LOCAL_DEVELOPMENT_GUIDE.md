# 🖥️ Local Development & Browser Testing Guide

## 🎯 Quick Start Commands

### 🚀 One-Command Setup
```bash
# Clone and setup everything
git clone https://github.com/alimurtadho/assingment_project_AI.git
cd assingment_project_AI/final_project/codeguardian_ai
./setup-local-development.sh
```

### 📱 Start Development Servers
```bash
# Terminal 1: Start Backend (Port 8000)
cd backend
npm run dev

# Terminal 2: Start Frontend (Port 3000)  
cd frontend
npm start

# Terminal 3: Start Database (Port 5432)
docker-compose up postgres
```

---

## 🔧 Step-by-Step Local Setup

### 1. Prerequisites Installation

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker & Docker Compose
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Install PostgreSQL client tools
sudo apt-get install postgresql-client

# Verify installations
node --version  # Should be 18+
npm --version   # Should be 8+
docker --version
psql --version
```

### 2. Environment Setup

```bash
# Navigate to project
cd /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai

# Setup backend environment
cd backend
cp .env.example .env

# Edit .env file with your settings
cat > .env << EOL
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codeguardian_dev"

# JWT Configuration  
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# OpenAI Configuration (Optional for AI features)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Server Configuration
PORT=8000
NODE_ENV="development"

# Logging
LOG_LEVEL="info"
LOG_FILE="logs/app.log"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"
EOL

# Setup frontend environment
cd ../frontend
cat > .env << EOL
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_API_TIMEOUT=10000

# Environment
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_ANALYTICS=false

# WebSocket Configuration (if needed)
REACT_APP_WS_URL=ws://localhost:8000
EOL
```

### 3. Database Setup

```bash
# Start PostgreSQL with Docker
cd ..  # Back to root directory
docker-compose up -d postgres

# Wait for database to be ready
sleep 10

# Create development database
docker exec -it codeguardian_postgres psql -U postgres -c "CREATE DATABASE codeguardian_dev;"

# Run migrations (if available)
cd backend
npm run migrate || echo "No migrations found - skipping"

# Seed database (optional)
npm run seed || echo "No seed data - skipping"
```

### 4. Dependencies Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install

# Install root dependencies (if any)
cd ..
npm install || echo "No root package.json - skipping"
```

---

## 🌐 Running the Application

### Development Mode (Recommended)

```bash
# Terminal 1: Database
docker-compose up postgres

# Terminal 2: Backend API Server
cd backend
npm run dev
# ✅ Backend running at: http://localhost:8000
# ✅ API endpoints: http://localhost:8000/api
# ✅ API docs: http://localhost:8000/api/docs

# Terminal 3: Frontend Development Server
cd frontend  
npm start
# ✅ Frontend running at: http://localhost:3000
# ✅ Auto-reload: Enabled
# ✅ Browser opens automatically
```

### Production Mode

```bash
# Build frontend for production
cd frontend
npm run build

# Start backend in production mode
cd ../backend
NODE_ENV=production npm start

# Serve frontend build (using serve package)
cd ../frontend
npx serve -s build -l 3000
```

---

## 🧪 Testing in Browser

### 1. Backend API Testing

#### Health Check Endpoints
```bash
# Basic health check
curl http://localhost:8000/health
# Expected: {"status":"ok","timestamp":"2025-07-31T..."}

# Database connection check
curl http://localhost:8000/api/health/db
# Expected: {"status":"ok","database":"connected"}

# API documentation
open http://localhost:8000/api/docs
```

#### Authentication Testing
```bash
# Register new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword123"
  }'

# Login user
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'

# Save the JWT token from response for next requests
export JWT_TOKEN="your-jwt-token-here"
```

#### Security Analysis Testing
```bash
# Test security scanning endpoint
curl -X POST http://localhost:8000/api/security/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "code": "const API_KEY = \"sk-1234567890abcdef\"; const query = \"SELECT * FROM users WHERE id = \" + userId;",
    "language": "javascript"
  }'

# Expected response with vulnerabilities detected
```

### 2. Frontend Testing

#### Open Browser Testing
```bash
# Open development server
open http://localhost:3000

# Or manually visit these URLs:
echo "🌐 Frontend URLs to test:"
echo "• Main App: http://localhost:3000"
echo "• Login: http://localhost:3000/login"
echo "• Dashboard: http://localhost:3000/dashboard"
echo "• Security Scan: http://localhost:3000/security"
echo "• Projects: http://localhost:3000/projects"
```

#### Browser Developer Tools Testing
1. **Open DevTools** (F12)
2. **Console Tab**: Check for JavaScript errors
3. **Network Tab**: Monitor API calls
4. **Application Tab**: Check localStorage/sessionStorage
5. **Security Tab**: Verify HTTPS in production

#### User Flow Testing Checklist
- [ ] ✅ **Registration**: Create new account
- [ ] ✅ **Login**: Sign in with credentials  
- [ ] ✅ **Dashboard**: View main interface
- [ ] ✅ **File Upload**: Upload code files
- [ ] ✅ **Security Scan**: Run vulnerability analysis
- [ ] ✅ **Results**: View scan results
- [ ] ✅ **Export**: Download reports
- [ ] ✅ **Logout**: Sign out properly

---

## 🔧 Development Scripts

### Backend Scripts
```bash
cd backend

# Development with hot reload
npm run dev

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Database operations
npm run migrate
npm run seed
npm run db:reset
```

### Frontend Scripts  
```bash
cd frontend

# Development server
npm start

# Production build
npm run build

# Run tests
npm test
npm run test:coverage

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Bundle analysis
npm run analyze
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Backend Issues

**Issue**: `Error: connect ECONNREFUSED 127.0.0.1:5432`
```bash
# Solution: Start PostgreSQL database
docker-compose up -d postgres
# Wait 10 seconds then retry
```

**Issue**: `JWT_SECRET is required`
```bash
# Solution: Set environment variable
export JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
# Or add to .env file
```

**Issue**: `Port 8000 already in use`
```bash
# Solution: Kill process using port
sudo lsof -t -i:8000 | xargs kill -9
# Or use different port
PORT=8001 npm run dev
```

#### Frontend Issues

**Issue**: `Module not found: Can't resolve 'axios'`
```bash
# Solution: Install missing dependencies
npm install
# Or specifically
npm install axios
```

**Issue**: `CORS policy error`
```bash
# Solution: Check backend CORS_ORIGIN setting
# Should be "http://localhost:3000" for development
```

**Issue**: `Failed to compile`
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Issues

**Slow API responses**:
```bash
# Check database connection
docker logs codeguardian_postgres

# Monitor backend logs
cd backend && npm run dev

# Enable debug logging
DEBUG=* npm run dev
```

**Frontend not updating**:
```bash
# Clear browser cache
# Restart development server
npm start

# Force reload with cache clear
# Ctrl+Shift+R (Chrome/Firefox)
```

---

## 📊 Monitoring & Logs

### Backend Logs
```bash
# View real-time logs
cd backend
tail -f logs/app.log

# View error logs only
tail -f logs/error.log

# Search logs
grep "ERROR" logs/app.log
```

### Frontend Console
```bash
# Enable React DevTools debugging
localStorage.setItem('debug', 'true')

# View network requests
# Open DevTools → Network tab
```

### Database Monitoring
```bash
# Connect to database
docker exec -it codeguardian_postgres psql -U postgres -d codeguardian_dev

# View active connections
SELECT * FROM pg_stat_activity;

# Check database size
SELECT pg_size_pretty(pg_database_size('codeguardian_dev'));
```

---

## 🎯 Next Steps

After successful local setup:

1. **✅ Verify all services running**
2. **✅ Test core functionality**  
3. **✅ Run automated tests**
4. **✅ Check code quality**
5. **🚀 Ready for CI/CD pipeline!**

Your local development environment is now ready for productive development! 🎉
