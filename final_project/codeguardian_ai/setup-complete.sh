#!/bin/bash

# 🛡️ CodeGuardian AI - Complete Setup Script
# This script sets up and starts the entire CodeGuardian AI platform

echo "🚀 Starting CodeGuardian AI Setup..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the codeguardian_ai directory"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 CodeGuardian AI - AI-Enhanced DevSecOps Platform${NC}"
echo -e "${BLUE}================================================${NC}"

# Step 1: Check prerequisites
echo -e "\n${YELLOW}🔍 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version is too old. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"

# Step 2: Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"

echo -e "${BLUE}Installing backend dependencies...${NC}"
npm install

echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd frontend && npm install && cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Set up environment
echo -e "\n${YELLOW}⚙️ Setting up environment...${NC}"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Environment file created${NC}"
    echo -e "${YELLOW}⚠️ Remember to add your OpenAI API key to .env file${NC}"
else
    echo -e "${GREEN}✅ Environment file already exists${NC}"
fi

# Step 4: Start PostgreSQL
echo -e "\n${YELLOW}🗄️ Starting PostgreSQL database...${NC}"

docker compose up -d postgres
sleep 5

if docker ps | grep -q "codeguardian_postgres"; then
    echo -e "${GREEN}✅ PostgreSQL started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start PostgreSQL${NC}"
    exit 1
fi

# Step 5: Set up database schema
echo -e "\n${YELLOW}🏗️ Setting up database schema...${NC}"

npx prisma generate
npx prisma db push

echo -e "${GREEN}✅ Database schema created${NC}"

# Step 6: Create startup scripts
echo -e "\n${YELLOW}📝 Creating startup scripts...${NC}"

# Create backend startup script
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting CodeGuardian AI Backend..."
cd "$(dirname "$0")"
node backend/server.js
EOF

# Create frontend startup script  
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🎨 Starting CodeGuardian AI Frontend..."
cd "$(dirname "$0")/frontend"
npm start
EOF

# Create complete startup script
cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting CodeGuardian AI - Complete Platform"

# Start backend in background
echo "Starting backend server..."
./start-backend.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend application..."
./start-frontend.sh

# Clean up background processes
kill $BACKEND_PID 2>/dev/null
EOF

chmod +x start-backend.sh start-frontend.sh start-all.sh

echo -e "${GREEN}✅ Startup scripts created${NC}"

# Final instructions
echo -e "\n${GREEN}🎉 Setup Complete!${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo -e "\n1. ${BLUE}Add your OpenAI API key to .env file:${NC}"
echo -e "   ${YELLOW}OPENAI_API_KEY=your_actual_api_key_here${NC}"
echo -e "\n2. ${BLUE}Start the application:${NC}"
echo -e "   ${YELLOW}Terminal 1: ./start-backend.sh${NC}"
echo -e "   ${YELLOW}Terminal 2: ./start-frontend.sh${NC}"
echo -e "   ${YELLOW}Or use: ./start-all.sh (starts both)${NC}"
echo -e "\n3. ${BLUE}Access the application:${NC}"
echo -e "   ${YELLOW}Frontend: http://localhost:3000${NC}"
echo -e "   ${YELLOW}Backend API: http://localhost:3001${NC}"
echo -e "   ${YELLOW}Health Check: http://localhost:3001/health${NC}"
echo -e "\n4. ${BLUE}Demo files available in ./demo/ directory${NC}"
echo -e "\n${GREEN}🛡️ CodeGuardian AI is ready to secure your code!${NC}"
