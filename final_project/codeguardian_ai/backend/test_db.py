#!/usr/bin/env python3
"""
Simple database connection test
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.database import check_database_connection, engine
from src.config import settings

def test_db_connection():
    print("🔍 Testing database connection...")
    print(f"📍 Database URL: {settings.database_url}")
    
    try:
        success = check_database_connection()
        if success:
            print("✅ Database connection test passed!")
            return True
        else:
            print("❌ Database connection test failed!")
            return False
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

if __name__ == "__main__":
    test_db_connection()
