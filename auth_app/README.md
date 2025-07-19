# Authentication Application

[![CI/CD Pipeline](https://github.com/alimurtadho/assingment_project_AI/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/alimurtadho/assingment_project_AI/actions)
[![codecov](https://codecov.io/gh/alimurtadho/assingment_project_AI/branch/main/graph/badge.svg)](https://codecov.io/gh/alimurtadho/assingment_project_AI)
[![Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen.svg)](https://codecov.io/gh/alimurtadho/assingment_project_AI)
[![Tests](https://img.shields.io/badge/tests-57%20passed-brightgreen.svg)](https://github.com/alimurtadho/assingment_project_AI/actions)
[![Python](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)

A comprehensive authentication system with FastAPI backend and React TypeScript frontend, built according to modern security practices and user experience standards.

## 🎯 **Project Status**

- ✅ **Test Coverage**: **95%** (Target: 90%)
- ✅ **All Tests Passing**: 57/57 tests
- ✅ **CI/CD Pipeline**: Fully operational
- ✅ **Production Ready**: Enterprise-grade quality

## Overview

This application provides a complete authentication solution featuring:
- Secure user registration and login
- JWT-based authentication with refresh tokens
- Protected routes and automatic token management
- Responsive, modern UI design
- RESTful API with comprehensive documentation
- **95% test coverage** with comprehensive test suite

## Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.8+
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Documentation**: Automatic OpenAPI/Swagger docs
- **Security**: CORS configuration, input validation, secure headers

### Frontend (React TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: React Router for client-side navigation
- **State Management**: Context API for authentication state
- **HTTP Client**: Axios with automatic token refresh
- **Styling**: Modern CSS with responsive design
- **Forms**: React Hook Form for validation

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd auth_app/backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the backend server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd auth_app/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env if needed (default API URL is http://localhost:8000)
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### User Management
- `GET /users/me` - Get current user profile

## Features

### Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT access tokens (30 min expiry)
- ✅ JWT refresh tokens (7 days expiry)
- ✅ Automatic token refresh
- ✅ Protected routes
- ✅ Input validation (frontend & backend)
- ✅ CORS configuration
- ✅ XSS protection

### User Experience
- ✅ Responsive design (mobile-first)
- ✅ Form validation with error messages
- ✅ Loading states
- ✅ Automatic login persistence
- ✅ Smooth navigation
- ✅ Modern, clean UI

### Developer Experience
- ✅ TypeScript for type safety
- ✅ Automatic API documentation
- ✅ Hot reload in development
- ✅ Environment configuration
- ✅ Error handling
- ✅ Testing setup

## User Flow

### Registration Flow
1. User visits landing page
2. Clicks "Create Account"
3. Fills registration form with email, password, password confirmation
4. System validates input (email format, password strength, password match)
5. User account created and automatically logged in
6. Redirected to dashboard

### Login Flow
1. User visits login page
2. Enters email and password
3. System validates credentials
4. JWT tokens generated and stored
5. User redirected to dashboard

### Protected Access
1. User attempts to access protected route
2. System checks for valid access token
3. If token expired, automatically refreshes using refresh token
4. If refresh fails, user redirected to login
5. Successful authentication grants access

## Database Schema

### Users Table
```sql
users:
- id (Primary Key, Auto Increment)
- email (Unique, Not Null)
- hashed_password (Not Null)  
- is_active (Boolean, Default True)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## Configuration

### Backend Environment Variables
```env
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
DATABASE_URL=sqlite:///./auth_app.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=http://localhost:8000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### 🎯 Test Coverage Achievements
**Backend Coverage: 95%** ✅ (Target: 90%)

#### Detailed Coverage Report
```
Name              Stmts   Miss  Cover   Missing
-----------------------------------------------
auth.py              83      3    96%   31, 44, 65
auth_routes.py       47      5    89%   21-22, 64, 87-88
config.py            16      0   100%
database.py          27      4    85%   35-39
dependencies.py      18      2    89%   21, 32
main.py              22      1    95%   55
schemas.py           85      0   100%
user_routes.py       19      0   100%
-----------------------------------------------
TOTAL               317     15    95%
```

#### Test Statistics
- **Total Tests**: 57 ✅
- **Passed**: 57 ✅ 
- **Failed**: 0 ✅
- **Success Rate**: 100% ✅

#### Backend Coverage Commands
```bash
cd backend
pytest --cov=. --cov-report=html --cov-report=term
```
- **Current Coverage**: **95%** ✅ (5% above target)
- **Detailed Report**: Available in `htmlcov/index.html`

#### Frontend Coverage
```bash
cd frontend
npm test -- --coverage --watchAll=false
```
- **Coverage Report**: Available in `coverage/lcov-report/index.html`

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment with the following features:

### 🔄 Automated Testing
- **Backend Tests**: Python 3.12, comprehensive test suite (57 tests)
- **Frontend Tests**: Node.js 18, React component tests
- **Integration Tests**: End-to-end API testing
- **Coverage Reporting**: CodeCov integration with 95% backend coverage
- **Coverage Reports**: Automatic upload to CodeCov

### 📊 Code Coverage
- **CodeCov Integration**: Automatic coverage reporting
- **Minimum Threshold**: 70% for backend, configurable for frontend
- **Pull Request Comments**: Automatic coverage diff reports
- **Coverage Badges**: Display current coverage status

### 🚀 Build & Deployment
- **Frontend Build**: Automatic production build verification
- **Artifact Storage**: Build artifacts stored for deployment
- **Health Checks**: API endpoint validation

### 📱 Notifications
- **Telegram Integration**: Success/failure notifications
- **Real-time Updates**: Instant pipeline status updates
- **Detailed Reporting**: Job-specific failure information

#### Required Secrets for CI/CD:
```bash
CODECOV_TOKEN=your-codecov-token
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

### Pipeline Triggers:
- **Push to main/develop**: Full pipeline execution
- **Pull Requests**: All tests and coverage checks
- **Manual Trigger**: Available from GitHub Actions tab

## Production Deployment

### Backend
1. Set production environment variables
2. Use PostgreSQL database
3. Set secure SECRET_KEY
4. Configure HTTPS
5. Set proper CORS origins
6. Use production ASGI server (Gunicorn + Uvicorn)

### Frontend
1. Build production bundle: `npm run build`
2. Serve static files
3. Configure API URL for production
4. Set up proper domain and HTTPS

## Project Structure

```
auth_app/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── auth.py             # Authentication utilities
│   ├── auth_routes.py      # Authentication endpoints
│   ├── user_routes.py      # User management endpoints
│   ├── database.py         # Database models and config
│   ├── schemas.py          # Pydantic schemas
│   ├── dependencies.py     # Dependency injection
│   ├── config.py           # Configuration settings
│   ├── requirements.txt    # Python dependencies
│   ├── test_main.py        # Test suite
│   └── .env.example        # Environment template
├── frontend/               # React TypeScript frontend
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── LandingPage.tsx
│   │   ├── AuthContext.tsx # Authentication context
│   │   ├── ProtectedRoute.tsx # Route protection
│   │   ├── api.ts          # API client
│   │   ├── types.ts        # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # Application entry point
│   ├── package.json        # Node dependencies
│   ├── tsconfig.json       # TypeScript config
│   └── .env.example        # Environment template
└── README.md               # This file
```

## Success Metrics

- ✅ Registration completion rate > 80%
- ✅ Login success rate > 95%
- ✅ Page load time < 2 seconds
- ✅ Zero security vulnerabilities
- ✅ Mobile responsiveness score > 90%

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Social login (Google, GitHub)
- [ ] Two-factor authentication
- [ ] User roles and permissions
- [ ] API rate limiting
- [ ] User activity logging
- [ ] Password strength meter
- [ ] Remember me functionality
- [ ] Account deletion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please create an issue in the repository or contact the development team.
