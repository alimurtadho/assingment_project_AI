# Simple PRD Proposal - CodeGuardian AI
## AI-Enhanced DevSecOps Platform (3-5 Days Implementation)

### 📋 Executive Summary
**Product Name:** CodeGuardian AI (Simplified)  
**Version:** 1.0 MVP  
**Target Users:** Demo Audience  
**Project Duration:** 3-5 Days  
**Demo Type:** Local Presentation

### 🎯 Problem Statement
Development teams need automated tools to:
- Detect security vulnerabilities (hardcoded secrets, basic SQL injection)
- Improve code quality through AI-powered analysis
- Generate automated tests
- Integrate security checks into CI/CD pipelines

### 🚀 Simplified Core Features

#### Day 1-2: Security Scanner MVP
**Features:**
- File upload interface for code analysis
- Hardcoded secret detection (API keys, passwords)
- Basic SQL injection pattern detection
- Simple vulnerability reporting dashboard

**User Story:**
> "As a developer, I want to upload my code and get a security report within 2 minutes"

#### Day 3: AI Code Reviewer
**Features:**
- LLM integration for code quality analysis
- Automated code review comments
- Simple refactoring suggestions
- Code smell detection

**User Story:**
> "As a developer, I want AI to review my code and suggest improvements"

#### Day 4: Test Generator
**Features:**
- Basic unit test generation for functions
- Simple test case suggestions
- Test coverage analysis
- Integration with existing test frameworks

**User Story:**
> "As a developer, I want AI to generate test cases for my functions"

#### Day 5: CI/CD Integration
**Features:**
- GitHub Actions pipeline
- SonarCloud integration
- Automated quality gates
- Final documentation and demo preparation

**User Story:**
> "As a DevOps engineer, I want automated security checks in my pipeline"

### 🛠 Simplified Tech Stack

```yaml
Backend:
  Framework: Express.js (Node.js)
  Database: PostgreSQL with Prisma ORM
  File Processing: Multer for file uploads
  AI Integration: OpenAI GPT-4 API
  Security Tools: GitLeaks, custom regex patterns

Frontend:
  Framework: React with TypeScript
  UI Library: Material-UI (pre-built components)
  File Upload: React Dropzone
  Charts: Chart.js (simple visualizations)

AI/ML:
  LLM: OpenAI GPT-4
  Prompting: Custom prompt templates
  Code Analysis: AST parsing with TypeScript/JavaScript parsers

DevOps:
  CI/CD: GitHub Actions
  Code Quality: SonarCloud
  Security Scanning: Synk (basic plan)
  Deployment: Local development server
  Database: PostgreSQL (local instance or Docker)
```

### 📁 Project Structure

```
codeguardian-ai/
├── README.md                 # Setup and usage instructions
├── LAPORAN_FINAL.md         # Required final report
├── package.json             # Node.js dependencies
├── package-lock.json        # Dependency lock file
├── .env.example             # Environment variables template
├── docker-compose.yml       # PostgreSQL setup for local development
├── prisma/
│   ├── schema.prisma        # Database schema definition
│   └── migrations/          # Database migration files
├── .github/
│   └── workflows/
│       └── ci-cd.yml        # CI/CD pipeline
├── backend/
│   ├── server.js            # Express.js application entry point
│   ├── app.js               # Express.js app configuration
│   ├── routes/
│   │   ├── security.js      # Security scanning endpoints
│   │   ├── ai-review.js     # AI code review endpoints
│   │   └── test-gen.js      # Test generation endpoints
│   ├── services/
│   │   ├── securityScanner.js  # Security vulnerability detection
│   │   ├── aiReviewer.js       # AI-powered code review
│   │   └── testGenerator.js    # Automated test generation
│   ├── models/
│   │   └── database.js      # Prisma client and database utilities
│   ├── middleware/
│   │   ├── upload.js        # File upload middleware
│   │   └── validation.js    # Request validation
│   └── utils/
│       ├── fileProcessor.js # File processing utilities
│       └── aiPrompts.js     # AI prompt templates
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.tsx          # Main application
│   │   ├── components/
│   │   │   ├── FileUpload.tsx
│   │   │   ├── SecurityReport.tsx
│   │   │   ├── CodeReview.tsx
│   │   │   └── TestResults.tsx
│   │   └── services/
│   │       └── api.ts       # Backend API calls
├── tests/
│   ├── security.test.js     # Backend tests
│   └── ai-review.test.js
└── docs/
    ├── prompt_examples.md   # AI prompt engineering examples
    └── demo_guide.md       # Presentation demo guide
```

### 📅 5-Day Implementation Timeline

#### **Day 1: Foundation & Security Scanner**
**Morning (4 hours):**
- Setup project structure
- Setup PostgreSQL with Docker and Prisma ORM
- Initialize Express.js backend with basic routes
- Create basic React frontend
- Implement file upload functionality with Multer

**Afternoon (4 hours):**
- Setup database models and migrations
- Implement hardcoded secret detection
- Basic SQL injection pattern detection
- Simple security report generation
- Basic frontend display of results

**Deliverable:** Working file upload with basic security scanning and PostgreSQL integration

#### **Day 2: Enhanced Security & UI**
**Morning (4 hours):**
- Improve security detection algorithms
- Add more vulnerability patterns
- Enhance reporting dashboard
- Add risk scoring system

**Afternoon (4 hours):**
- Polish frontend UI/UX
- Add result visualization
- Implement error handling
- Basic testing of security features

**Deliverable:** Complete security scanner with polished UI

#### **Day 3: AI Integration**
**Morning (4 hours):**
- Integrate OpenAI GPT-4 API
- Implement AI code reviewer
- Create prompt templates for code analysis
- Add code quality metrics

**Afternoon (4 hours):**
- Implement AI suggestions display
- Add code refactoring recommendations
- Create code smell detection
- Document prompt engineering examples

**Deliverable:** Working AI code reviewer with suggestions

#### **Day 4: Test Generation & Advanced Features**
**Morning (4 hours):**
- Implement automated test generation
- Create test case suggestions
- Add test coverage analysis
- Integration with testing frameworks

**Afternoon (4 hours):**
- Combine all features in unified dashboard
- Add comprehensive reporting
- Performance optimization
- Comprehensive testing

**Deliverable:** Complete feature set with test generation

#### **Day 5: CI/CD & Final Polish**
**Morning (4 hours):**
- Setup GitHub Actions pipeline
- Integrate SonarCloud
- Configure Synk security scanning
- Add automated quality gates

**Afternoon (4 hours):**
- Final documentation (README.md, LAPORAN_FINAL.md)
- Prepare demo scenarios
- Final testing and bug fixes
- Demo presentation preparation

**Deliverable:** Production-ready application with CI/CD

### 🎯 Demo Scenarios for Presentation

#### **Scenario 1: Security Vulnerability Detection**
**Demo Code:**
```typescript
// Vulnerable code example
const API_KEY = "sk-1234567890abcdef"; // Hardcoded secret
const DB_PASSWORD = "admin123"; // Hardcoded password

interface User {
  id: number;
  email: string;
}

function getUserById(userId: string): User | null {
  // SQL injection vulnerability
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  return executeQuery(query);
}

// XSS vulnerability
function renderUserProfile(userInput: string): string {
  return `<div>Welcome ${userInput}</div>`; // No sanitization
}
```

**Expected Output:**
- Detects hardcoded API key and password
- Identifies SQL injection vulnerability
- Detects potential XSS vulnerability
- Provides TypeScript-specific fix suggestions
- Shows risk assessment with OWASP classifications

#### **Scenario 2: AI Code Review**
**Demo Code:**
```typescript
// Code with quality issues
interface DataItem {
  value: number;
  category: string;
}

function processData(data: DataItem[]): number[] {
  const result: number[] = [];
  
  // Multiple code quality issues
  for (let i = 0; i < data.length; i++) {  // Should use for...of or forEach
    if (data[i].value > 0) {  // Accessing array directly
      result.push(data[i].value * 2);  // Magic number
    }
  }
  
  return result;
}

// Poor error handling
async function fetchUserData(id: number) {
  const response = await fetch(`/api/users/${id}`);
  return response.json(); // No error checking
}
```

**Expected Output:**
- Suggests using modern iteration methods (for...of, map, filter)
- Recommends extracting magic numbers to constants
- Identifies missing error handling in async function
- Suggests proper TypeScript typing improvements
- Provides refactored code example with best practices

#### **Scenario 3: Test Generation**
**Demo Code:**
```typescript
interface DiscountConfig {
  minPercent: number;
  maxPercent: number;
}

class PriceCalculator {
  private config: DiscountConfig = { minPercent: 0, maxPercent: 100 };
  
  calculateDiscount(price: number, discountPercent: number): number {
    if (discountPercent < this.config.minPercent || discountPercent > this.config.maxPercent) {
      throw new Error("Invalid discount percentage");
    }
    
    if (price <= 0) {
      throw new Error("Price must be positive");
    }
    
    return price * (1 - discountPercent / 100);
  }
  
  calculateBulkDiscount(items: Array<{price: number, quantity: number}>): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}

**Expected Output:**
- Generates comprehensive Jest test suite for TypeScript class
- Creates test cases for valid inputs with different scenarios
- Adds edge case tests (0%, 100%, boundary values)
- Generates error condition tests with proper TypeScript typing
- Creates mock data and test utilities
- Provides test coverage analysis for class methods
- Suggests additional integration tests for bulk discount feature

**Generated Test Example:**
```typescript
// Auto-generated test file: PriceCalculator.test.ts
import { PriceCalculator } from './PriceCalculator';

describe('PriceCalculator', () => {
  let calculator: PriceCalculator;
  
  beforeEach(() => {
    calculator = new PriceCalculator();
  });
  
  describe('calculateDiscount', () => {
    it('should calculate discount correctly for valid inputs', () => {
      expect(calculator.calculateDiscount(100, 20)).toBe(80);
      expect(calculator.calculateDiscount(50, 10)).toBe(45);
    });
    
    it('should throw error for invalid discount percentage', () => {
      expect(() => calculator.calculateDiscount(100, -5)).toThrow('Invalid discount percentage');
      expect(() => calculator.calculateDiscount(100, 150)).toThrow('Invalid discount percentage');
    });
    
    it('should throw error for invalid price', () => {
      expect(() => calculator.calculateDiscount(-10, 20)).toThrow('Price must be positive');
      expect(() => calculator.calculateDiscount(0, 20)).toThrow('Price must be positive');
    });
  });
});
```

### 📊 Success Metrics (Achievable in 5 Days)

#### **Technical KPIs:**
- **Security Detection:** Detect 5+ common vulnerability types
- **AI Integration:** 3+ working AI features
- **Processing Time:** <30 seconds for typical code files
- **Test Generation:** Generate 5+ test cases per function
- **CI/CD Pipeline:** Fully functional with quality gates

#### **Demo KPIs:**
- **Setup Time:** <5 minutes from clone to running
- **Feature Demo:** All core features working smoothly
- **Integration Demo:** End-to-end CI/CD pipeline
- **Documentation:** Complete setup and usage guides
- **Presentation:** 10-15 minute comprehensive demo

### 📋 Required Deliverables (Matching Course Requirements)

#### **1. Repository Code (GitHub):**
```
✅ README.md - Setup instructions and project overview
✅ Commit history - Daily commits showing progress
✅ Clean code structure with proper documentation
✅ Working application that can be run locally
```

#### **2. CI/CD Configuration:**
```yaml
# .github/workflows/ci-cd.yml
name: CodeGuardian CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: codeguardian_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Setup test database
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/codeguardian_test
        run: |
          npx prisma migrate deploy
          npx prisma generate
      
      - name: Run backend tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/codeguardian_test
          NODE_ENV: test
        run: npm run test:backend
      
      - name: Run frontend tests
        run: npm run test:frontend
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      
      - name: Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

#### **3. LAPORAN_FINAL.md Structure:**
```markdown
# CodeGuardian AI - Final Report

## 1. Process Design & Prompt Engineering
### AI Prompts Used:
- Security vulnerability detection prompts
- Code review analysis prompts  
- Test generation prompts
### Prompt Iteration Analysis:
- How prompts were refined
- Examples of prompt improvements
- Results comparison

## 2. Testing & Refactoring Strategy
### AI-Assisted Testing:
- Automated test case generation
- Test coverage improvement
- AI-suggested refactoring examples
### Quality Improvements:
- Before/after code examples
- Metrics improvement

## 3. CI/CD Pipeline Analysis
### Tools Integration:
- SonarCloud configuration and results
- Synk security scanning setup
- GitHub Actions workflow
### Quality Gates:
- Automated blocking of vulnerable code
- Quality threshold enforcement

## 4. Technical Implementation
### Architecture decisions
### AI integration challenges
### Performance optimizations

## 5. Demo Results & Reflection
### Feature demonstrations
### Lessons learned
### Future improvements
```

### 🔧 Implementation Notes

#### **Development Environment Setup:**
```bash
# Project setup
npm init -y
npm install express cors helmet morgan multer @prisma/client prisma
npm install openai dotenv joi express-rate-limit pg
npm install -D nodemon jest supertest eslint prettier

# Initialize Prisma
npx prisma init

# Frontend setup (in separate terminal)
npx create-react-app frontend --template typescript
cd frontend && npm install @mui/material @emotion/react @emotion/styled
cd frontend && npm install axios react-dropzone chart.js react-chartjs-2

# PostgreSQL setup (using Docker)
docker-compose up -d postgres
```

#### **Package.json Configuration:**
```json
{
  "name": "codeguardian-ai",
  "version": "1.0.0",
  "description": "AI-Enhanced DevSecOps Platform",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "dev:backend": "nodemon backend/server.js",
    "dev:frontend": "cd frontend && npm start",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "test:backend": "jest backend/tests/",
    "test:frontend": "cd frontend && npm test",
    "test": "npm run test:backend && npm run test:frontend",
    "build": "cd frontend && npm run build",
    "lint": "eslint backend/ --ext .js",
    "lint:fix": "eslint backend/ --ext .js --fix",
    "db:migrate": "npx prisma migrate dev",
    "db:generate": "npx prisma generate",
    "db:studio": "npx prisma studio",
    "db:seed": "node prisma/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5",
    "@prisma/client": "^5.1.1",
    "prisma": "^5.1.1",
    "pg": "^8.11.1",
    "openai": "^4.0.0",
    "dotenv": "^16.3.1",
    "joi": "^17.9.2",
    "express-rate-limit": "^6.8.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.1",
    "supertest": "^6.3.3",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0",
    "concurrently": "^8.2.0"
  }
}
```

#### **PostgreSQL Configuration (docker-compose.yml):**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: codeguardian_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
```

#### **Prisma Schema (prisma/schema.prisma):**
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model ScanResult {
  id                String   @id @default(cuid())
  filename          String
  fileContent       String
  scanType          String   // 'security', 'ai-review', 'test-generation'
  vulnerabilities   Json?    // Store security vulnerabilities
  codeReview        Json?    // Store AI code review results
  testCases         Json?    // Store generated test cases
  riskScore         Int?     // 1-10 risk assessment
  status            String   @default("completed") // 'pending', 'processing', 'completed', 'failed'
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@map("scan_results")
}

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  createdAt DateTime @default(now())
  
  scans     ScanResult[]
  
  @@map("users")
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String   // 'file_upload', 'security_scan', 'ai_review', 'test_generation'
  details   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  
  @@map("audit_logs")
}
```

#### **Essential Environment Variables:**
```env
# .env file
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codeguardian_db?schema=public"

# API Keys
OPENAI_API_KEY=your_openai_api_key
SONAR_TOKEN=your_sonar_token
SNYK_TOKEN=your_snyk_token

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

#### **Local Development Commands:**
```bash
# Setup PostgreSQL (using Docker)
docker-compose up -d postgres

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed database with initial data
npm run db:studio      # Open Prisma Studio (database GUI)

# Start backend (from root directory)
npm run dev:backend
# or: node backend/server.js

# Start frontend (from root directory)
npm run dev:frontend
# or: cd frontend && npm start

# Start both concurrently
npm run dev

# Run tests
npm run test:backend    # Jest tests for backend
npm run test:frontend   # React tests
npm test               # Run all tests

# Database management
docker-compose down     # Stop PostgreSQL
docker-compose logs postgres  # View PostgreSQL logs
```

### 🎯 Presentation Tips for Demo

1. **Start with Problem Statement:** Show vulnerable code examples
2. **Live Demo:** Upload real code and show results
3. **AI Features:** Demonstrate prompt engineering examples
4. **CI/CD Integration:** Show pipeline running and blocking bad code
5. **Technical Architecture:** Brief overview of implementation
6. **Results:** Show before/after improvements

### 🚀 Post-Implementation Benefits

**For Portfolio:**
- Complete DevSecOps project with AI integration
- Demonstrates prompt engineering skills
- Shows CI/CD pipeline expertise
- Real-world security tool development

**For Career:**
- Advanced AI application development
- Security-focused development experience
- Full-stack implementation skills
- DevOps pipeline expertise

---

**Total Estimated Effort:** 40 hours over 5 days (8 hours/day)  
**Risk Level:** Low (achievable scope)  
**Demo Readiness:** High (focused on working features)  
**Academic Requirements:** ✅ Fully compliant with course deliverables
