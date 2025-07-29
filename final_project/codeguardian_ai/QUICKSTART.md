# 🚀 Quick Start Guide - CodeGuardian AI

## Option 1: Docker Setup (Recommended)

### Prerequisites
- Docker & Docker Compose installed
- At least 4GB RAM available

### Setup Steps

1. **Clone and navigate to project**
```bash
cd /Users/newuser/ali/project/binar/bootcamp_ai/assingment/final_project/codeguardian_ai
```

2. **Configure environment**
```bash
cp backend/.env.example backend/.env
# Edit .env file if needed (optional for local development)
```

3. **Start all services**
```bash
./setup.sh
```

4. **Verify installation**
```bash
# Check services are running
docker-compose ps

# Test API
curl http://localhost:8000/health
```

### What's Included
- PostgreSQL database on port 5432
- Redis cache on port 6379
- FastAPI backend on port 8000
- Automatic database migrations
- API documentation at http://localhost:8000/docs

---

## Option 2: Local Development Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis (optional)

### Setup Steps

1. **Setup PostgreSQL database**
```bash
./setup_local_db.sh
```

2. **Install Python dependencies**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure environment**
```bash
cp .env.example .env
# Update DATABASE_URL if needed
```

4. **Run database migrations**
```bash
alembic upgrade head
```

5. **Start the application**
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Testing the Setup

### 1. Health Check
```bash
curl http://localhost:8000/health
```
Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0",
  "environment": "development"
}
```

### 2. API Documentation
Visit: http://localhost:8000/docs

### 3. Create Test User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "testpass123"
  }'
```

### 4. Login and Get Token
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123"
```

### 5. Create Test Project
```bash
# Use the token from login response
curl -X POST "http://localhost:8000/api/projects/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "My first project",
    "language": "python",
    "framework": "fastapi"
  }'
```

---

## Common Issues & Solutions

### Docker Issues
```bash
# If ports are already in use
docker-compose down
sudo lsof -i :8000  # Check what's using port 8000
sudo lsof -i :5432  # Check what's using port 5432

# Reset everything
docker-compose down -v
docker system prune -f
./setup.sh
```

### Database Issues
```bash
# Reset database
docker-compose exec postgres psql -U codeguardian -d codeguardian_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker-compose exec backend alembic upgrade head
```

### Permission Issues
```bash
# Fix script permissions
chmod +x setup.sh
chmod +x setup_local_db.sh
chmod +x manage.py
```

---

## Next Steps

1. **Upload a project**: Create a ZIP file of your code and upload it via API
2. **Run security scan**: Test the security scanning features
3. **Analyze code quality**: Check the code analysis capabilities
4. **Explore API**: Browse the interactive API documentation

## Management Commands

```bash
# Check status
python manage.py status

# View logs
python manage.py logs

# Create database backup
python manage.py backup

# Run tests
python manage.py test
```

---

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f backend`
2. Verify database connection: `python manage.py status`
3. Reset the environment: `docker-compose down -v && ./setup.sh`

For development questions, refer to the main README.md file.
