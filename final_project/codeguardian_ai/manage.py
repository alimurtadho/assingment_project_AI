#!/usr/bin/env python3
"""
CodeGuardian AI Management Script
Provides commands for managing the application
"""

import subprocess
import sys
import os
import json
from pathlib import Path

def run_command(command, shell=True):
    """Run a shell command"""
    try:
        result = subprocess.run(command, shell=shell, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return False
        print(result.stdout)
        return True
    except Exception as e:
        print(f"Error running command: {e}")
        return False

def check_services():
    """Check if services are running"""
    print("🔍 Checking service status...")
    return run_command("docker-compose ps")

def start_services():
    """Start all services"""
    print("🚀 Starting services...")
    return run_command("docker-compose up -d")

def stop_services():
    """Stop all services"""
    print("🛑 Stopping services...")
    return run_command("docker-compose down")

def restart_services():
    """Restart all services"""
    print("🔄 Restarting services...")
    stop_services()
    return start_services()

def view_logs(service=None):
    """View logs for services"""
    if service:
        print(f"📋 Viewing logs for {service}...")
        return run_command(f"docker-compose logs -f {service}")
    else:
        print("📋 Viewing logs for all services...")
        return run_command("docker-compose logs -f")

def create_migration(message):
    """Create a new database migration"""
    print(f"📝 Creating migration: {message}")
    return run_command(f'docker-compose exec backend alembic revision --autogenerate -m "{message}"')

def run_migrations():
    """Run database migrations"""
    print("🗄️ Running database migrations...")
    return run_command("docker-compose exec backend alembic upgrade head")

def create_user():
    """Create a new user interactively"""
    print("👤 Creating new user...")
    username = input("Username: ")
    email = input("Email: ")
    full_name = input("Full name: ")
    password = input("Password: ")
    
    # You would typically call an API endpoint or run a script in the container
    print(f"User {username} would be created (implement API call)")

def backup_database():
    """Backup the database"""
    print("💾 Creating database backup...")
    timestamp = subprocess.check_output("date +%Y%m%d_%H%M%S", shell=True).decode().strip()
    backup_file = f"backup_codeguardian_{timestamp}.sql"
    
    cmd = f"docker-compose exec -T postgres pg_dump -U codeguardian codeguardian_db > {backup_file}"
    if run_command(cmd):
        print(f"Database backed up to {backup_file}")

def restore_database(backup_file):
    """Restore database from backup"""
    if not os.path.exists(backup_file):
        print(f"Backup file {backup_file} not found")
        return False
    
    print(f"🔄 Restoring database from {backup_file}...")
    cmd = f"docker-compose exec -T postgres psql -U codeguardian -d codeguardian_db < {backup_file}"
    return run_command(cmd)

def run_tests():
    """Run tests"""
    print("🧪 Running tests...")
    return run_command("docker-compose exec backend python -m pytest tests/ -v")

def lint_code():
    """Run code linting"""
    print("🔍 Running code linting...")
    if not run_command("docker-compose exec backend black src/ --check"):
        print("Running black formatter...")
        run_command("docker-compose exec backend black src/")
    
    print("Running isort...")
    run_command("docker-compose exec backend isort src/ --check-only")

def show_help():
    """Show available commands"""
    print("""
🛡️  CodeGuardian AI Management Commands

Service Management:
  status          - Check service status
  start           - Start all services
  stop            - Stop all services
  restart         - Restart all services
  logs [service]  - View logs (optional: specify service)

Database:
  migrate [msg]   - Create new migration
  upgrade         - Run migrations
  backup          - Backup database
  restore [file]  - Restore database from backup

Development:
  test            - Run tests
  lint            - Run code linting
  user            - Create new user

Examples:
  python manage.py start
  python manage.py logs backend
  python manage.py migrate "Add new table"
  python manage.py backup
""")

def main():
    """Main function"""
    if len(sys.argv) < 2:
        show_help()
        return
    
    command = sys.argv[1]
    
    if command == "status":
        check_services()
    elif command == "start":
        start_services()
    elif command == "stop":
        stop_services()
    elif command == "restart":
        restart_services()
    elif command == "logs":
        service = sys.argv[2] if len(sys.argv) > 2 else None
        view_logs(service)
    elif command == "migrate":
        message = sys.argv[2] if len(sys.argv) > 2 else "Auto migration"
        create_migration(message)
    elif command == "upgrade":
        run_migrations()
    elif command == "backup":
        backup_database()
    elif command == "restore":
        if len(sys.argv) < 3:
            print("Please specify backup file")
            return
        restore_database(sys.argv[2])
    elif command == "test":
        run_tests()
    elif command == "lint":
        lint_code()
    elif command == "user":
        create_user()
    elif command == "help":
        show_help()
    else:
        print(f"Unknown command: {command}")
        show_help()

if __name__ == "__main__":
    main()
