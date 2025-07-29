#!/bin/bash

# Local PostgreSQL Setup for CodeGuardian AI
echo "🐘 Setting up local PostgreSQL database for CodeGuardian AI..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed."
    echo "Please install PostgreSQL first:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "  CentOS: sudo yum install postgresql postgresql-server"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    print_warning "PostgreSQL service is not running."
    echo "Please start PostgreSQL:"
    echo "  macOS: brew services start postgresql"
    echo "  Ubuntu: sudo systemctl start postgresql"
    echo "  CentOS: sudo systemctl start postgresql"
    exit 1
fi

# Database configuration
DB_NAME="codeguardian_db"
DB_USER="codeguardian"
DB_PASSWORD="password123"

# Check if database user exists
if psql -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    print_status "Database user '$DB_USER' already exists."
else
    print_status "Creating database user '$DB_USER'..."
    psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    psql -U postgres -c "ALTER USER $DB_USER CREATEDB;"
fi

# Check if database exists
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    print_warning "Database '$DB_NAME' already exists."
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Dropping existing database..."
        psql -U postgres -c "DROP DATABASE $DB_NAME;"
        print_status "Creating database '$DB_NAME'..."
        psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    fi
else
    print_status "Creating database '$DB_NAME'..."
    psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
fi

# Grant privileges
print_status "Granting privileges..."
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Test connection
print_status "Testing database connection..."
if PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    print_status "Database connection successful! ✅"
else
    print_error "Database connection failed! ❌"
    exit 1
fi

print_status "Database setup complete!"
echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Connection URL:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo "Next steps:"
echo "1. Copy backend/.env.example to backend/.env"
echo "2. Update DATABASE_URL in backend/.env"
echo "3. Install Python dependencies: pip install -r backend/requirements.txt"
echo "4. Run migrations: cd backend && alembic upgrade head"
echo "5. Start the application: uvicorn src.main:app --reload"
