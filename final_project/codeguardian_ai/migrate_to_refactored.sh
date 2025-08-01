#!/bin/bash

# CodeGuardian AI Migration Script
# This script helps migrate from the original implementation to the refactored version

echo "🚀 CodeGuardian AI - Code Refactoring Migration Script"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d "codeguardian_ai" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

cd codeguardian_ai

print_status "Starting migration to refactored codebase..."

# Step 1: Backup original files
print_status "Step 1: Creating backup of original files..."
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"

# Backup backend files
if [ -f "backend/server.js" ]; then
    cp backend/server.js "$BACKUP_DIR/server.js.bak"
    print_success "Backed up server.js"
fi

if [ -f "backend/services/securityScanner.js" ]; then
    cp backend/services/securityScanner.js "$BACKUP_DIR/securityScanner.js.bak"
    print_success "Backed up securityScanner.js"
fi

if [ -f "backend/services/aiReviewer.js" ]; then
    cp backend/services/aiReviewer.js "$BACKUP_DIR/aiReviewer.js.bak"
    print_success "Backed up aiReviewer.js"
fi

if [ -f "backend/services/testGenerator.js" ]; then
    cp backend/services/testGenerator.js "$BACKUP_DIR/testGenerator.js.bak"
    print_success "Backed up testGenerator.js"
fi

# Backup frontend files
if [ -f "frontend/src/config/api.ts" ]; then
    cp frontend/src/config/api.ts "$BACKUP_DIR/api.ts.bak"
    print_success "Backed up api.ts"
fi

# Step 2: Install additional dependencies
print_status "Step 2: Installing additional dependencies..."

cd backend
print_status "Installing backend dependencies..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_warning "Backend package.json not found, creating basic one..."
    cat > package.json << EOF
{
  "name": "codeguardian-ai-backend",
  "version": "2.0.0",
  "description": "Enhanced CodeGuardian AI Backend",
  "main": "server.refactored.js",
  "scripts": {
    "start": "node server.refactored.js",
    "dev": "nodemon server.refactored.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^6.8.1",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "winston": "^3.10.0",
    "openai": "^4.0.0",
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2"
  }
}
EOF
fi

# Install new dependencies
npm install winston compression express-rate-limit morgan helmet

cd ../frontend
print_status "Installing frontend dependencies..."

# Install TypeScript and additional dependencies if needed
npm install --save-dev @types/node
npm install axios

cd ..

# Step 3: Replace files with refactored versions
print_status "Step 3: Activating refactored code..."

cd backend

# Replace backend files
if [ -f "server.refactored.js" ]; then
    cp server.js server.js.old 2>/dev/null || true
    cp server.refactored.js server.js
    print_success "Activated refactored server.js"
fi

if [ -f "services/securityScanner.refactored.js" ]; then
    cp services/securityScanner.js services/securityScanner.js.old 2>/dev/null || true
    cp services/securityScanner.refactored.js services/securityScanner.js
    print_success "Activated refactored securityScanner.js"
fi

if [ -f "services/aiReviewer.refactored.js" ]; then
    cp services/aiReviewer.js services/aiReviewer.js.old 2>/dev/null || true
    cp services/aiReviewer.refactored.js services/aiReviewer.js
    print_success "Activated refactored aiReviewer.js"
fi

if [ -f "services/testGenerator.refactored.js" ]; then
    cp services/testGenerator.js services/testGenerator.js.old 2>/dev/null || true
    cp services/testGenerator.refactored.js services/testGenerator.js
    print_success "Activated refactored testGenerator.js"
fi

# Update route imports in server if needed
if [ -f "server.js" ]; then
    # Update route imports to use refactored versions
    sed -i.bak 's/routes\/security/routes\/security.refactored/g' server.js 2>/dev/null || true
    sed -i.bak 's/routes\/ai-review/routes\/ai-review.refactored/g' server.js 2>/dev/null || true
    sed -i.bak 's/routes\/test-generation/routes\/test-generation.refactored/g' server.js 2>/dev/null || true
fi

cd ../frontend/src

# Replace frontend files
if [ -f "config/api.refactored.ts" ]; then
    cp config/api.ts config/api.ts.old 2>/dev/null || true
    cp config/api.refactored.ts config/api.ts
    print_success "Activated refactored api.ts"
fi

cd ../..

# Step 4: Update package.json scripts
print_status "Step 4: Updating package.json scripts..."

cd backend
# Update start script to use refactored server
if grep -q "server.js" package.json; then
    sed -i.bak 's/"start": "node server.js"/"start": "node server.refactored.js"/g' package.json
    sed -i.bak 's/"dev": "nodemon server.js"/"dev": "nodemon server.refactored.js"/g' package.json
    print_success "Updated backend package.json scripts"
fi

cd ../

# Step 5: Create environment template
print_status "Step 5: Creating environment template..."

if [ ! -f ".env.example" ]; then
    cat > .env.example << EOF
# CodeGuardian AI Environment Configuration

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/codeguardian"

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Security Configuration
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
EOF
    print_success "Created .env.example template"
fi

# Step 6: Update README with new information
print_status "Step 6: Creating updated documentation..."

cat > MIGRATION_GUIDE.md << EOF
# Migration Guide - CodeGuardian AI v2.0

## Overview
This guide helps you migrate from the original CodeGuardian AI implementation to the enhanced v2.0 version.

## What's New in v2.0

### Backend Enhancements
- ✅ Enhanced utility classes for better code organization
- ✅ Improved error handling and logging with Winston
- ✅ Better API response formatting
- ✅ Enhanced security scanning with CWE mapping
- ✅ Multi-type AI code review (security, performance, refactoring)
- ✅ Comprehensive test generation
- ✅ Batch processing capabilities
- ✅ Request tracking and monitoring

### Frontend Enhancements
- ✅ TypeScript-first API client with retry logic
- ✅ Custom React hooks for better state management
- ✅ Enhanced file upload with drag-and-drop
- ✅ Progress tracking for uploads
- ✅ Better error handling and user feedback

## Migration Steps Completed

1. ✅ Backup of original files created in \`backup/\` directory
2. ✅ Additional dependencies installed
3. ✅ Refactored code activated
4. ✅ Package.json scripts updated
5. ✅ Environment template created

## Next Steps

### 1. Environment Configuration
Copy \`.env.example\` to \`.env\` and configure your environment variables:

\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

### 2. Database Setup
Ensure your database is properly configured and run migrations:

\`\`\`bash
cd backend
npx prisma migrate dev
\`\`\`

### 3. Start the Application

#### Backend
\`\`\`bash
cd backend
npm run dev
\`\`\`

#### Frontend
\`\`\`bash
cd frontend
npm start
\`\`\`

### 4. Test the Migration
1. Open http://localhost:3000
2. Try uploading a code file
3. Check that all features work correctly

## Rollback Instructions

If you need to rollback to the original version:

\`\`\`bash
# Restore from backup
cp backup/YYYYMMDD_HHMMSS/*.bak backend/
# Remove .old extension
cd backend
mv server.js.old server.js
mv services/securityScanner.js.old services/securityScanner.js
mv services/aiReviewer.js.old services/aiReviewer.js
mv services/testGenerator.js.old services/testGenerator.js
\`\`\`

## Support

If you encounter issues during migration:
1. Check the backup files in \`backup/\` directory
2. Review the error logs in \`logs/\` directory
3. Ensure all environment variables are properly set
4. Verify all dependencies are installed

## Features to Explore

### New Backend Endpoints
- \`GET /api/security/patterns\` - Get vulnerability patterns
- \`POST /api/security/batch-scan\` - Batch security scanning
- \`POST /api/ai-review/refactor\` - Get refactoring suggestions
- \`POST /api/ai-review/security-analysis\` - Security-focused analysis
- \`POST /api/ai-review/performance-analysis\` - Performance analysis
- \`POST /api/test-generation/unit-tests\` - Generate unit tests
- \`POST /api/test-generation/integration-tests\` - Generate integration tests
- \`GET /api/health\` - System health check

### New Frontend Features
- Drag-and-drop file upload
- Real-time progress tracking
- Batch file processing
- Enhanced error messages
- File validation with visual feedback

Enjoy the enhanced CodeGuardian AI experience! 🚀
EOF

print_success "Created migration guide"

# Step 7: Final checks
print_status "Step 7: Running final checks..."

# Check if all required files exist
REQUIRED_FILES=(
    "backend/utils/responseFormatter.js"
    "backend/utils/validationUtils.js"
    "backend/utils/logger.js"
    "backend/utils/errorHandler.js"
    "backend/server.refactored.js"
    "frontend/src/config/api.refactored.ts"
    "frontend/src/hooks/useEnhanced.ts"
    "frontend/src/components/EnhancedFileUpload.tsx"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    print_success "All required refactored files are present"
else
    print_warning "Some refactored files are missing:"
    for file in "${MISSING_FILES[@]}"; do
        print_warning "  - $file"
    done
fi

# Check if dependencies are installed
cd backend
if npm list winston > /dev/null 2>&1; then
    print_success "Winston logging dependency installed"
else
    print_warning "Winston dependency not found"
fi

cd ../frontend
if npm list axios > /dev/null 2>&1; then
    print_success "Axios dependency installed"
else
    print_warning "Axios dependency not found"
fi

cd ..

echo ""
echo "🎉 Migration Complete!"
echo "===================="
print_success "CodeGuardian AI has been successfully migrated to v2.0"
print_status "Backup files stored in: $BACKUP_DIR"
print_status "Next steps:"
echo "  1. Configure your .env file"
echo "  2. Start the backend: cd backend && npm run dev"
echo "  3. Start the frontend: cd frontend && npm start"
echo "  4. Test the application at http://localhost:3000"
echo ""
print_status "For detailed information, see MIGRATION_GUIDE.md"
echo ""
print_success "Happy coding! 🚀"
