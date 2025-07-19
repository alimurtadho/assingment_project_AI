# Assignment 10 - AI-Assisted Unit Testing & TDD

## 🎯 Objectives
Menerapkan AI-assisted unit testing dengan fokus pada:
- Test coverage minimal 90%
- Test Driven Development (TDD) practices
- QA-driven development workflow
- Implementasi fitur change password dengan testing yang komprehensif

## 🚀 Features Tested

### 1. Login Feature (Primary Focus)
- ✅ Email validation
- ✅ Password validation
- ✅ Authentication flow
- ✅ Error handling
- ✅ Token management
- ✅ Session persistence

### 2. Change Password Feature (Bonus Implementation)
- ✅ Current password verification
- ✅ New password validation
- ✅ Password confirmation
- ✅ Security checks
- ✅ API integration
- ✅ Frontend form validation

## 📊 Test Coverage Target
- **Minimum**: 90%
- **Target**: 95%+
- **Focus Areas**: Authentication logic, password management, validation

## 🛠 Tech Stack
- **Backend**: FastAPI + SQLAlchemy
- **Frontend**: React TypeScript
- **Testing**: Jest, React Testing Library, Pytest
- **Coverage**: Coverage.py (backend), Istanbul (frontend)

## 📁 Project Structure
```
assingment_10/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── user/
│   │   └── utils/
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_user.py
│   │   └── test_password.py
│   └── coverage/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── tests/
│   └── coverage/
└── docs/
```

## 🧪 Testing Strategy

### TDD Approach
1. **Red**: Write failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code quality
4. **Repeat**: Continue cycle

### Test Categories
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Component Tests**: React component testing
- **E2E Tests**: Full user flow testing

## 📋 Assignment Checklist

### Required (Fitur Login)
- [ ] Test coverage ≥ 90%
- [ ] Unit tests untuk email validation
- [ ] Unit tests untuk password validation
- [ ] Integration tests untuk login API
- [ ] Component tests untuk login form
- [ ] Error handling tests
- [ ] Security tests

### Optional (Fitur Change Password)
- [ ] Backend API implementation
- [ ] Frontend form implementation
- [ ] Comprehensive test suite
- [ ] Security validation tests
- [ ] UI/UX tests

## 🔧 Setup & Running

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pytest --cov=src --cov-report=html
```

### Frontend
```bash
cd frontend
npm install
npm test -- --coverage --watchAll=false
```

## 📈 Coverage Reports
- Backend: `backend/htmlcov/index.html`
- Frontend: `frontend/coverage/lcov-report/index.html`

## 🎓 Learning Outcomes
- Practical TDD implementation
- High-quality test writing
- AI-assisted testing strategies
- Coverage analysis and improvement
- Real-world testing scenarios
