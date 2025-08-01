#!/bin/bash

# CodeGuardian AI - Quick Local Setup (No Docker Required)
# For WSL 2 environments where Docker integration is not available

set -e

echo "🚀 CodeGuardian AI - Quick Local Setup"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

cd /home/aldho/poc_aldho/assingment_project_AI/final_project/codeguardian_ai

# Install dependencies
print_status "Installing dependencies..."

if [ ! -d "node_modules" ]; then
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    cd frontend && npm install && cd ..
fi

# Create SQLite database setup (no PostgreSQL required)
print_status "Setting up local database..."

# Create local environment for SQLite
cat > .env.local << EOF
# Local SQLite Database (No PostgreSQL required)
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="local-development-secret-key"

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL="http://localhost:3000"
EOF

# Update Prisma schema for SQLite temporarily
cp prisma/schema.prisma prisma/schema.prisma.backup

cat > prisma/schema.prisma << EOF
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  projects Project[]
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
  scans Scan[]
}

model Scan {
  id        String   @id @default(cuid())
  fileName  String
  fileSize  Int
  results   String   // JSON string
  projectId String
  createdAt DateTime @default(now())
  
  project Project @relation(fields: [projectId], references: [id])
}
EOF

# Generate Prisma client with SQLite
print_status "Generating Prisma client for local development..."
DATABASE_URL="file:./dev.db" npx prisma generate

# Create database
print_status "Creating local database..."
DATABASE_URL="file:./dev.db" npx prisma db push

print_success "Local database setup completed!"

# Start services
print_status "Starting CodeGuardian AI services..."

echo ""
echo "🚀 Starting Backend Server..."
cd backend
DATABASE_URL="file:../dev.db" node server.js &
BACKEND_PID=$!
cd ..

echo ""
echo "🚀 Starting Frontend Server..."
cd frontend
BROWSER=none npm start &
FRONTEND_PID=$!
cd ..

# Wait for services to start
print_status "Waiting for services to start..."
sleep 10

# Health checks
print_status "Performing health checks..."

# Check backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Backend is healthy"
    echo "   API accessible at http://localhost:3001"
else
    print_warning "Backend may still be starting..."
fi

# Check frontend  
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is healthy"
    echo "   UI accessible at http://localhost:3000"
else
    print_warning "Frontend may still be starting..."
fi

echo ""
print_success "CodeGuardian AI Local Setup Complete! 🎉"
echo ""
echo "🌐 Access Points:"
echo "   Frontend Application: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   API Health Check: http://localhost:3001/health"
echo ""
echo "📊 Demo Features Available:"
echo "   • File upload and security scanning"
echo "   • AI-powered code review"
echo "   • Test case generation"
echo "   • Quality metrics analysis"
echo ""
echo "🛑 To Stop Services:"
echo "   kill \$BACKEND_PID \$FRONTEND_PID"
echo "   Or use Ctrl+C in the respective terminals"
echo ""
echo "📝 Note: Using SQLite for local development"
echo "   Database file: dev.db"
echo "   Original schema backed up as prisma/schema.prisma.backup"
echo ""

# Save PIDs for cleanup
echo "BACKEND_PID=$BACKEND_PID" > .pids
echo "FRONTEND_PID=$FRONTEND_PID" >> .pids

print_success "Setup completed! Open http://localhost:3000 to get started! 🚀"
