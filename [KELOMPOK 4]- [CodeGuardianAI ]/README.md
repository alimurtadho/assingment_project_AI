# 🛡️ CodeGuardian AI - AI-Enhanced DevSecOps Platform

[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10+-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

CodeGuardian AI is a comprehensive AI-enhanced DevSecOps platform that integrates artificial intelligence throughout the Software Development Life Cycle (SDLC) to automatically detect security vulnerabilities, improve code quality, generate comprehensive tests, and provide actionable insights for development teams.

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
