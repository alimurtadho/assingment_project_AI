# 🛡️ CodeGuardian AI - AI-Enhanced DevSecOps Platform

[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10+-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

# CodeGuardian AI - AI-Enhanced DevSecOps Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-4.9.5-blue.svg)](https://www.typescriptlang.org/)

CodeGuardian AI adalah platform DevSecOps yang ditingkatkan dengan AI untuk analisis keamanan kode, review otomatis, generasi test, dan analisis performa secara real-time.

## 🚀 Fitur Utama

### 🔒 Security Analysis
- **Vulnerability Scanning**: Deteksi OWASP Top 10 vulnerabilities
- **Secret Detection**: Identifikasi API keys, passwords, dan credentials
- **Code Injection Analysis**: Deteksi SQL injection, XSS, dan serangan lainnya
- **Real-time Security Score**: Penilaian keamanan berdasarkan tingkat risiko

### 🤖 AI Code Review
- **Quality Assessment**: Analisis kualitas kode dengan AI
- **Best Practices**: Rekomendasi sesuai standar industri
- **Maintainability Score**: Penilaian kemudahan maintenance
- **Performance Optimization**: Saran optimasi performa

### 🧪 Test Generation
- **Automated Test Cases**: Generasi unit test dan integration test
- **Edge Case Coverage**: Deteksi dan test untuk edge cases
- **Test Coverage Analysis**: Laporan coverage yang komprehensif
- **Performance Testing**: Benchmark dan load testing

### ⚡ Performance Analysis
- **Complexity Metrics**: Analisis cyclomatic complexity
- **Memory Usage**: Monitoring penggunaan memori
- **Execution Time**: Profiling waktu eksekusi
- **Bottleneck Detection**: Identifikasi performance bottlenecks

### 📊 Dashboard & Reporting
- **Real-time Metrics**: Dashboard dengan data real-time
- **Historical Trends**: Analisis trend performa dari waktu ke waktu
- **Export Reports**: Export hasil analisis dalam berbagai format
- **Team Collaboration**: Sharing dan kolaborasi tim

## 🏗️ Arsitektur Teknologi

### Backend (Node.js + Express)
```
backend/
├── server.js              # Express server utama
├── routes/                # API routes
├── middleware/            # Custom middleware
├── controllers/           # Business logic
├── services/              # External services integration
├── utils/                 # Utility functions
└── tests/                 # Backend tests
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx      # Dashboard utama
│   │   ├── FileUpload.tsx     # Upload dan scan files
│   │   ├── SecurityReport.tsx # Laporan keamanan
│   │   ├── CodeReview.tsx     # AI code review
│   │   ├── TestResults.tsx    # Hasil test generation
│   │   └── PerformanceAnalysis.tsx # Analisis performa
│   ├── services/          # API integration
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Frontend utilities
│   └── App.tsx            # Main application
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/alimurtadho/assingment_project_AI.git
cd assingment_project_AI/final_project/codeguardian_ai
```

2. **Install Dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install --legacy-peer-deps
cd ..
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

4. **Start Development Server**
```bash
# Start both backend and frontend
npm run dev

# Or start separately:
npm run dev:backend    # Backend only (port 5000)
npm run dev:frontend   # Frontend only (port 3000)
```

5. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## 🔧 Configuration

### Environment Variables (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# AI Integration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Security Settings
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# File Upload Settings
MAX_FILE_SIZE=10485760  # 10MB
MAX_FILES=20
UPLOAD_DIR=./uploads

# Database (if using)
DATABASE_URL=your_database_url_here

# External Services
GITHUB_TOKEN=your_github_token_here
GITLAB_TOKEN=your_gitlab_token_here
```

## 📱 Usage Guide

### 1. Upload Code Files
- Drag & drop files ke upload area
- Pilih jenis analisis: Security, AI Review, Test Generation, atau Performance
- Konfigurasi opsi analisis sesuai kebutuhan
- Klik "Start Analysis"

### 2. View Security Report
- Lihat vulnerability yang terdeteksi
- Review security score dan rekomendasi
- Export laporan dalam format JSON/PDF
- Apply fix otomatis untuk vulnerability tertentu

### 3. AI Code Review
- Analisis kualitas kode dengan AI
- Review suggestions dan best practices
- Implement recommended improvements
- Track progress over time

### 4. Test Generation
- Generate automated test cases
- Review dan edit generated tests
- Run tests dan lihat coverage
- Export test suites

### 5. Performance Analysis
- Analisis bottlenecks dan optimizations
- Review complexity metrics
- Implement performance improvements
- Monitor performance trends

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run tests with coverage
npm run test:coverage
```

## 📊 API Documentation

### Security Endpoints
```
POST /api/scan/security      # Security vulnerability scan
GET  /api/scan/:id          # Get scan results
DELETE /api/scan/:id        # Delete scan results
```

### AI Review Endpoints
```
POST /api/review/ai         # AI code review
GET  /api/review/:id        # Get review results
POST /api/review/feedback   # Submit feedback
```

### Test Generation Endpoints
```
POST /api/test/generate     # Generate test cases
GET  /api/test/:id         # Get test results
POST /api/test/run         # Run generated tests
```

### Performance Endpoints
```
POST /api/performance/analyze  # Performance analysis
GET  /api/performance/:id     # Get analysis results
POST /api/performance/benchmark # Run benchmarks
```

### Dashboard Endpoints
```
GET /api/dashboard/metrics    # Get dashboard metrics
GET /api/dashboard/trends     # Get historical trends
GET /api/dashboard/summary   # Get summary statistics
```

## 🔨 Development

### Code Style
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Build for Production
```bash
# Build frontend
npm run build

# Build complete application
npm run build:all
```

### Docker Deployment
```bash
# Build Docker images
npm run docker:build

# Start with Docker Compose
npm run docker:up

# Stop Docker containers
npm run docker:down
```

## 🔒 Security Features

### Input Validation
- File type validation
- Size limits enforcement
- Content sanitization
- Path traversal protection

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- API rate limiting
- CORS configuration

### Data Protection
- File encryption at rest
- Secure API communications
- Input sanitization
- XSS protection

## 🚀 Deployment

### Production Environment
1. Set production environment variables
2. Build frontend: `npm run build`
3. Start production server: `npm start`
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificates
6. Configure monitoring and logging

### Cloud Deployment Options
- **Heroku**: Ready-to-deploy with Procfile
- **AWS**: EC2, ECS, or Lambda deployment
- **Google Cloud**: App Engine or Compute Engine
- **Azure**: App Service or Container Instances

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow commit message conventions
- Ensure code passes all linting rules

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI untuk AI capabilities
- Material-UI untuk UI components
- Chart.js untuk data visualization
- React community untuk ecosystem yang luar biasa
- Security research community untuk vulnerability databases

## 📞 Support

- **Documentation**: [Wiki](https://github.com/alimurtadho/assingment_project_AI/wiki)
- **Issues**: [GitHub Issues](https://github.com/alimurtadho/assingment_project_AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/alimurtadho/assingment_project_AI/discussions)

---

**CodeGuardian AI** - Securing code with artificial intelligence 🛡️🤖

## 🎯 **Project Status**

- ✅ **Database Setup**: PostgreSQL with comprehensive schema
- ✅ **Authentication**: JWT-based user authentication
- ✅ **Security Scanning**: Bandit and Safety integration
- ✅ **Code Analysis**: Quality metrics and performance analysis
- ✅ **API Architecture**: RESTful API with FastAPI
- 🚧 **AI Integration**: LangChain and OpenAI integration (in progress)
- 🚧 **Frontend**: React TypeScript dashboard (planned)

## 🏗️ Architecture

### Backend Services
- **FastAPI**: Modern Python web framework with automatic API documentation
- **PostgreSQL**: Robust relational database with JSON support
- **Redis**: Caching and session management
- **Celery**: Background task processing
- **Docker**: Containerized deployment

### AI/ML Integration
- **LangChain**: AI workflow management
- **OpenAI GPT-4**: Code analysis and recommendations
- **Vector Database**: Code similarity and pattern matching

### Security Tools
- **Bandit**: Python security linting
- **Safety**: Dependency vulnerability scanning
- **SemGrep**: Multi-language static analysis (optional)

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)
- PostgreSQL 15+ (if not using Docker)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd codeguardian_ai
```

2. **Set up environment**
```bash
# Copy environment configuration
cp backend/.env.example backend/.env

# Edit .env file with your settings
nano backend/.env
```

3. **Start services with Docker**
```bash
# Make setup script executable
chmod +x setup.sh

# Run setup script
./setup.sh
```

**OR start manually:**
```bash
# Start all services
docker-compose up -d --build

# Run database migrations
docker-compose exec backend alembic upgrade head
```

### Access the Application

- **API Documentation**: http://localhost:8000/docs
- **API Base URL**: http://localhost:8000
- **Health Check**: http://localhost:8000/health

## 📚 API Documentation

### Authentication Endpoints

```bash
# Register new user
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "testpass123"
  }'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123"
```

### Project Management

```bash
# Create project
curl -X POST "http://localhost:8000/api/projects/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Test project",
    "language": "python",
    "framework": "fastapi"
  }'

# Upload project files (ZIP)
curl -X POST "http://localhost:8000/api/projects/1/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@project.zip"
```

### Security Scanning

```bash
# Start security scan
curl -X POST "http://localhost:8000/api/security/1/scan" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scan_types": ["secrets", "vulnerabilities", "dependencies"],
    "tools": ["bandit", "safety"]
  }'

# Get scan results
curl -X GET "http://localhost:8000/api/security/1/scans" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Code Analysis

```bash
# Start code analysis
curl -X POST "http://localhost:8000/api/analysis/1/analyze" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "analysis_types": ["quality", "testing", "performance"]
  }'

# Get quality report
curl -X GET "http://localhost:8000/api/analysis/1/quality-report" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Configuration

### Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://codeguardian:password123@localhost:5432/codeguardian_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=codeguardian_db
DATABASE_USER=codeguardian
DATABASE_PASSWORD=password123

# Application Settings
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI/ML Configuration
OPENAI_API_KEY=your-openai-api-key-here
LANGCHAIN_API_KEY=your-langchain-api-key-here

# Security Scanner Settings
ENABLE_BANDIT=true
ENABLE_SAFETY=true
ENABLE_SEMGREP=false
```

### Database Schema

The platform uses PostgreSQL with the following main tables:

- **users**: User authentication and profile information
- **projects**: Project metadata and configuration
- **security_scans**: Security scan results and findings
- **analyses**: Code analysis results
- **code_quality_reports**: Quality metrics and scores
- **ai_recommendations**: AI-generated suggestions and fixes

## 🛠️ Development

### Local Development Setup

1. **Install Python dependencies**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Set up PostgreSQL locally**
```bash
# Create database
createdb codeguardian_db

# Run migrations
alembic upgrade head
```

3. **Start development server**
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Management Commands

Use the management script for common tasks:

```bash
# Check service status
python manage.py status

# View logs
python manage.py logs backend

# Create database migration
python manage.py migrate "Add new feature"

# Run migrations
python manage.py upgrade

# Backup database
python manage.py backup

# Run tests
python manage.py test

# Code linting
python manage.py lint
```

## 🧪 Testing

### Run Tests

```bash
# Using Docker
docker-compose exec backend python -m pytest tests/ -v

# Local development
pytest tests/ -v --cov=src
```

### Test Coverage

The project aims for >90% test coverage. Current coverage includes:

- Authentication and authorization
- Project management APIs
- Security scanning workflows
- Database models and relationships

## 🔒 Security Features

### Current Implementation

1. **Vulnerability Detection**
   - Hardcoded secrets and API keys
   - SQL injection patterns
   - Insecure cryptographic usage
   - Common security anti-patterns

2. **Dependency Scanning**
   - Known CVE detection
   - Outdated package identification
   - License compliance checking

3. **Code Quality Analysis**
   - Complexity metrics
   - Maintainability index
   - Technical debt assessment
   - Code smell detection

### Security Best Practices

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Rate limiting (planned)

## 📊 Performance & Monitoring

### Metrics Tracked

- **Processing Time**: Analysis completion time
- **Accuracy**: Vulnerability detection accuracy
- **Resource Usage**: Memory and CPU utilization
- **API Performance**: Response times and throughput

### Monitoring Tools

- **Health Checks**: Built-in health monitoring
- **Logging**: Structured logging with context
- **Metrics**: Performance and usage metrics
- **Alerts**: Error and performance alerts (planned)

## 🗺️ Roadmap

### Phase 1: MVP (Completed)
- ✅ Basic security scanning
- ✅ Project management
- ✅ Database setup
- ✅ Authentication system

### Phase 2: Enhanced Analysis (In Progress)
- 🚧 AI-powered code review
- 🚧 Advanced vulnerability detection
- 🚧 Performance optimization suggestions
- 🚧 Test case generation

### Phase 3: Advanced Features (Planned)
- 📋 CI/CD integration
- 📋 Real-time collaboration
- 📋 Custom rule creation
- 📋 Team analytics dashboard

### Phase 4: Production Ready (Planned)
- 📋 Frontend React application
- 📋 Kubernetes deployment
- 📋 Advanced monitoring
- 📋 Enterprise features

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

### Code Standards

- Follow PEP 8 for Python code
- Use type hints for function signatures
- Write comprehensive docstrings
- Maintain test coverage >90%
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI**: For the excellent web framework
- **SQLAlchemy**: For robust ORM capabilities
- **Bandit & Safety**: For security scanning tools
- **OpenAI**: For AI/ML capabilities
- **Docker**: For containerization

## 📞 Support

- **Documentation**: See `/docs` directory
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@codeguardian.ai (placeholder)

---

**Built with ❤️ for the AI-Enhanced SDLC Bootcamp Final Project**

This project demonstrates the integration of all 14 bootcamp sessions into a comprehensive, production-ready DevSecOps platform.
