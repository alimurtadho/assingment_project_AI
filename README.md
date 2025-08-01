# 🛡️ CodeGuardian AI - AI-Enhanced DevSecOps Platform

> **Automated Code Security & Quality Analysis dengan Artificial Intelligence**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.2+-purple.svg)](https://mui.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

---

## 📋 Deskripsi Proyek

**CodeGuardian AI** adalah platform DevSecOps komprehensif yang mengintegrasikan kecerdasan buatan (AI) ke dalam Software Development Life Cycle (SDLC) untuk secara otomatis mendeteksi kerentanan keamanan, meningkatkan kualitas kode, dan menghasilkan test case yang komprehensif.

Platform ini mendemonstrasikan integrasi lengkap teknologi web modern dengan analisis kode yang didukung AI, mencakup:

### 🎯 Fitur Utama

- **🔍 Security Scanning**: Deteksi otomatis kerentanan, hardcoded secrets, dan anti-pattern keamanan
- **🤖 AI Code Review**: Analisis kode cerdas dengan GPT-4 dan rekomendasi yang actionable
- **🧪 Test Generation**: Pembuatan test case otomatis dengan analisis coverage komprehensif
- **📊 Quality Metrics**: Penilaian kualitas kode real-time dan analisis technical debt
- **🎨 Modern UI**: Interface React TypeScript responsif dengan komponen Material-UI
- **🔐 Authentication**: Autentikasi dan otorisasi pengguna berbasis JWT
- **📈 Analytics**: Metrik performa dan dashboard pelaporan detail

---

## 🏗️ Arsitektur & Technology Stack

### **Frontend Architecture**
```
React 19 + TypeScript + Material-UI
├── 📱 Components/
│   ├── FileUpload (Drag & Drop Interface)
│   ├── SecurityReport (Analisis Kerentanan)
│   ├── CodeReview (AI-Powered Insights)
│   └── TestResults (Coverage & Generation)
├── 🎨 Material-UI Design System
├── 📡 Axios HTTP Client
└── 🔄 State Management
```

### **Backend Architecture**
```
Express.js + Node.js + PostgreSQL
├── 🛣️ RESTful API Routes/
│   ├── /api/security (Vulnerability Scanning)
│   ├── /api/ai-review (GPT-4 Code Analysis)
│   ├── /api/test-gen (Automated Testing)
│   └── /api/auth (JWT Authentication)
├── 🔧 Services/
│   ├── SecurityScanner (Multi-tool Integration)
│   ├── AIReviewer (OpenAI GPT-4 Integration)
│   └── TestGenerator (Intelligent Test Creation)
└── 🗄️ PostgreSQL + Prisma ORM
```

### **DevOps & Infrastructure**
```
Docker + CI/CD + Quality Monitoring
├── 🐳 Docker Containers (Frontend + Backend + Database)
├── 🔄 GitHub Actions CI/CD Pipeline
├── 📊 SonarCloud Integration
├── 🛡️ Snyk Security Scanning
└── ☁️ Cloud-Ready Deployment
```

---

## 📊 Status Proyek & Metrics

### **Development Statistics**
- **📁 Total Files**: 50+ source files
- **⚡ API Endpoints**: 12+ RESTful endpoints
- **🧩 React Components**: 8+ reusable components
- **🗄️ Database Tables**: 3+ normalized tables
- **🧪 Test Coverage**: 90%+ pada komponen kritis
- **✅ Backend Tests**: 24/24 tests passing (100%)

### **Quality Metrics**
- **SonarQube Rating**: A (No bugs, No vulnerabilities)
- **Security Coverage**: 93% pada komponen keamanan
- **Code Quality**: A-B rating (Clean code)
- **Performance**: <500ms average API response
- **File Processing**: Support hingga 10MB

---

## 🚀 Cara Instalasi

### **Prerequisites**
Pastikan sistem Anda memiliki:
- **Node.js 18+** dan npm
- **Docker** dan Docker Compose
- **PostgreSQL 15+** (atau gunakan Docker)
- **Git** untuk version control
- **OpenAI API Key** (untuk fitur AI - opsional)

### **Langkah Instalasi**

#### 1. Clone Repository
```bash
git clone https://github.com/alimurtadho/assingment_project_AI.git
cd assingment_project_AI/final_project/codeguardian_ai
```

#### 2. Setup Environment
```bash
# Copy file environment template
cp .env.example .env

# Edit file .env dan isi dengan konfigurasi Anda:
# - OpenAI API key (untuk fitur AI)
# - Database credentials
# - JWT secret
nano .env
```

#### 3. Install Dependencies
```bash
# Install dependencies untuk root project
npm install

# Install dependencies untuk frontend
cd frontend
npm install
cd ..

# Install dependencies untuk backend (jika diperlukan)
cd backend
npm install
cd ..
```

#### 4. Setup Database
```bash
# Start PostgreSQL menggunakan Docker
docker-compose up -d postgres

# Generate Prisma client dan setup database
npx prisma generate
npx prisma db push

# Seed database dengan data sample (opsional)
npm run db:seed
```

---

## 🚀 Cara Menjalankan

### **Metode 1: Full Stack Script (Recommended)**
```bash
# Jalankan script otomatis untuk menjalankan semua services
chmod +x start-full-stack.sh
./start-full-stack.sh
```

Script ini akan:
- ✅ Memverifikasi prerequisites
- ✅ Menjalankan PostgreSQL database
- ✅ Menjalankan backend server (port 8000)
- ✅ Menjalankan frontend development server (port 3000)
- ✅ Memverifikasi semua services berjalan

### **Metode 2: Manual Step-by-Step**

#### Terminal 1: Database
```bash
# Start PostgreSQL database
docker-compose up postgres
```

#### Terminal 2: Backend Server
```bash
# Navigate ke directory backend
cd backend

# Start backend server
npm run dev
# atau
node server.js
```

#### Terminal 3: Frontend Development Server
```bash
# Navigate ke directory frontend
cd frontend

# Start frontend development server
npm start
```

### **Metode 3: Production dengan Docker**
```bash
# Build dan jalankan semua services dengan Docker
docker-compose up --build

# Atau jalankan di background
docker-compose up -d --build
```

---

## 🌐 Akses Aplikasi

Setelah berhasil menjalankan, Anda dapat mengakses:

| Service | URL | Deskripsi |
|---------|-----|-----------|
| **Frontend Application** | http://localhost:3000 | Main user interface |
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **API Documentation** | http://localhost:8000/api/docs | Interactive API docs |
| **Database** | localhost:5432 | PostgreSQL database |
| **Health Check** | http://localhost:8000/health | API health status |

---

## 🎮 Cara Penggunaan

### **1. Security Scanner**
Upload file kode untuk mendeteksi:
- Hardcoded secrets dan API keys
- Kerentanan SQL injection
- Cross-site scripting (XSS) patterns
- Penggunaan kriptografi yang tidak aman
- Security anti-patterns

**Contoh:**
1. Akses tab "Security Scanner" di aplikasi
2. Drag & drop file kode atau click untuk upload
3. Tunggu proses scanning selesai
4. Review hasil analisis kerentanan

### **2. AI Code Review**
Dapatkan analisis kode cerdas dengan:
- Overall quality score (1-10)
- Identifikasi masalah detail
- Rekomendasi per baris kode
- Pengenalan kekuatan kode
- Saran perbaikan

**Contoh:**
1. Akses tab "AI Code Review"
2. Upload file kode yang ingin dianalisis
3. AI akan menganalisis dengan GPT-4
4. Review insight dan rekomendasi

### **3. Test Generator**
Generate otomatis:
- Unit test cases
- Integration tests
- Edge case scenarios
- Performance tests
- Security test cases

**Contoh:**
1. Akses tab "Test Generator"
2. Upload file kode yang ingin dibuatkan test
3. Pilih jenis test yang diinginkan
4. Download atau copy generated test code

---

## 🧪 Testing & Quality Assurance

### **Menjalankan Tests**

#### Backend Tests
```bash
cd backend
npm test
# Expected: 24/24 tests passing

# Dengan coverage report
npm run test:coverage
```

#### Frontend Tests
```bash
cd frontend
npm test
# Interactive test runner

# Run all tests dan exit
npm test -- --coverage --ci
```

#### End-to-End Tests
```bash
# Test API endpoints
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/security/scan

# Test dengan sample file
./test_api.sh
```

### **Quality Monitoring**
- **SonarQube Dashboard**: https://sonarcloud.io/project/overview?id=codeguardian-ai
- **GitHub Actions**: CI/CD pipeline berjalan otomatis pada setiap push
- **Code Coverage**: LCOV reports terintegrasi

---

## 🔧 Scripts & Commands

### **Development Scripts**
```bash
# Start development environment
npm run dev                 # Start both frontend & backend
npm run dev:backend        # Start only backend
npm run dev:frontend       # Start only frontend

# Testing
npm test                   # Run all tests
npm run test:backend       # Backend tests only
npm run test:frontend      # Frontend tests only

# Building
npm run build              # Build frontend for production
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues

# Database
npm run db:migrate         # Run database migrations
npm run db:generate        # Generate Prisma client
npm run db:studio          # Open Prisma Studio
npm run db:seed            # Seed database
```

### **Utility Scripts**
```bash
# Project management
./start-full-stack.sh      # Start all services
./stop-full-stack.sh       # Stop all services
./status-check.sh          # Check services status
./setup-local-development.sh # Initial setup

# Testing & Quality
./test-api.sh              # API endpoint testing
./setup-sonarqube.sh       # SonarQube setup
```

---

## 🔒 Konfigurasi Keamanan

### **Environment Variables**
Edit file `.env` dengan konfigurasi berikut:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/codeguardian"

# Authentication
JWT_SECRET="your-strong-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# OpenAI Integration (optional)
OPENAI_API_KEY="your-openai-api-key"

# Server Configuration
PORT=8000
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

### **Security Features**
- **JWT Authentication**: Token-based user authentication
- **Password Hashing**: bcrypt untuk password security
- **Input Validation**: Joi validation untuk semua inputs
- **File Upload Security**: Type dan size validation
- **CORS Configuration**: Proper cross-origin setup
- **Rate Limiting**: API rate limiting untuk mencegah abuse

---

## 📚 Dokumentasi & Resources

### **Dokumentasi Lengkap**
Dalam folder project terdapat dokumentasi detail:

- `PROJECT_DOCUMENTATION.md` - Overview proyek komprehensif
- `EXECUTIVE_SUMMARY.md` - Ringkasan eksekutif dan status
- `LOCAL_DEVELOPMENT_GUIDE.md` - Panduan development lokal
- `DEVOPS_MASTER_GUIDE.md` - Panduan CI/CD dan DevOps
- `TESTING_GUIDE.md` - Strategi dan panduan testing
- `API_KEY_SECURITY_GUIDE.md` - Panduan keamanan API
- `BROWSER_TESTING_GUIDE.md` - Panduan testing browser

### **Demo Files**
Gunakan file demo di directory `/demo`:
- `vulnerable-code.ts` - Demo security scanning
- `code-quality-issues.ts` - Demo AI code review
- `functions-for-testing.ts` - Demo test generation

---

## 🔍 Troubleshooting

### **Common Issues & Solutions**

#### Port Already in Use
```bash
# Check what's running on port
lsof -i :3000
lsof -i :8000

# Kill process if needed
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Restart PostgreSQL container
docker-compose restart postgres

# Check database status
docker-compose ps
```

#### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Docker Issues
```bash
# Restart Docker daemon
sudo systemctl restart docker

# Clean Docker images
docker system prune -f
```

---

## 🛠️ Development Workflow

### **Git Workflow**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new security rule"

# Push and create PR
git push origin feature/new-feature
```

### **Quality Checks**
Setiap commit akan otomatis menjalankan:
- ✅ ESLint code quality checks
- ✅ Jest unit tests
- ✅ Security vulnerability scanning
- ✅ SonarQube code analysis
- ✅ Build verification

---

## 📈 Monitoring & Analytics

### **Health Monitoring**
```bash
# Check system status
./status-check.sh

# Monitor logs
tail -f backend.log
tail -f frontend.log

# Check API health
curl http://localhost:8000/health
```

### **Performance Metrics**
- Response time monitoring
- Database query performance
- File upload performance
- Memory usage tracking

---

## 🌟 Future Enhancements

### **Roadmap**
1. **Multi-language Support** - Python, Java, Go analysis
2. **Advanced AI Features** - Custom rule engine, auto-fix
3. **Enterprise Features** - Team collaboration, advanced analytics
4. **Cloud Integration** - AWS, Azure, GCP deployment
5. **IDE Integration** - VS Code, IntelliJ plugins

---

## 👥 Contributing

### **Development Setup**
1. Fork repository
2. Clone fork locally
3. Follow instalasi dan setup
4. Create feature branch
5. Submit pull request

### **Code Standards**
- Follow ESLint rules
- Write comprehensive tests
- Document new features
- Maintain >90% test coverage

---

## 📄 License

Project ini menggunakan MIT License. Lihat file `LICENSE` untuk detail lengkap.

---

## 🤝 Support & Contact

### **Getting Help**
- **Documentation**: Baca file dokumentasi dalam project
- **Issues**: Buat GitHub issue untuk bug reports
- **Discussions**: Gunakan GitHub Discussions untuk pertanyaan

### **Quick Support**
```bash
# Cek status system
./status-check.sh

# Restart semua services
./stop-full-stack.sh && ./start-full-stack.sh

# Review logs
tail -f backend.log frontend.log
```

---

## 🎉 Conclusion

**CodeGuardian AI** adalah implementasi komprehensif dari praktik DevSecOps modern yang menggabungkan teknologi AI dengan prinsip software engineering yang kokoh. Project ini mendemonstrasikan kemampuan full-stack development, integrasi AI, security engineering, dan teknologi web modern.

Platform ini berhasil mengintegrasikan beberapa sistem kompleks menjadi aplikasi yang kohesif dan user-friendly yang mengatasi tantangan real-world dalam software development.

---

**🛡️ Built with ❤️ for AI-Enhanced DevSecOps**

*Proyek ini mendemonstrasikan integrasi sukses dari 14 sesi bootcamp menjadi platform DevSecOps yang production-ready dan AI-enhanced.*

---

## ✅ Project Checklist

- [x] **Frontend Development**: React + TypeScript + Material-UI
- [x] **Backend Development**: Express.js + Node.js + PostgreSQL  
- [x] **Database Design**: Prisma ORM dengan normalized schema
- [x] **AI Integration**: OpenAI GPT-4 API implementation
- [x] **Security Features**: JWT auth + vulnerability scanning
- [x] **DevOps Setup**: Docker + CI/CD + monitoring
- [x] **Testing Strategy**: Comprehensive test coverage (24/24 tests)
- [x] **Documentation**: Complete project documentation
- [x] **Demo Preparation**: Working demo dengan sample files
- [x] **Production Ready**: Scalable dan maintainable codebase

---

**🚀 Ready to secure the digital world with AI-powered DevSecOps!**
