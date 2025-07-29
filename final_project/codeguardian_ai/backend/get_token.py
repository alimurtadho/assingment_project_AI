#!/usr/bin/env python3
"""
Quick Auth Token Generator for FastAPI Docs
Use this to quickly get a token for testing in FastAPI docs
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def get_auth_token():
    """Get auth token for FastAPI docs testing"""
    
    print("🔐 CodeGuardian AI - Auth Token Generator")
    print("=" * 50)
    
    # Get user input
    username = input("Enter username (or email): ").strip()
    password = input("Enter password: ").strip()
    
    if not username or not password:
        print("❌ Username and password are required!")
        return
    
    # Login request
    login_data = {
        "username": username,
        "password": password
    }
    
    try:
        print("\n🔄 Logging in...")
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data["access_token"]
            
            print("✅ Login successful!")
            print("\n🔑 Your Bearer Token:")
            print("=" * 50)
            print(access_token)
            print("=" * 50)
            
            print("\n📋 How to use in FastAPI Docs:")
            print("1. Go to: http://localhost:8000/docs")
            print("2. Click the 'Authorize' button (🔒)")
            print("3. Paste the token above (without 'Bearer ' prefix)")
            print("4. Click 'Authorize' and 'Close'")
            print("5. Now you can test protected endpoints!")
            
            print("\n🧪 Test with curl:")
            print(f'curl -X GET "{BASE_URL}/api/auth/me" \\')
            print(f'  -H "Authorization: Bearer {access_token}"')
            
        else:
            print(f"❌ Login failed: {response.json()}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def register_new_user():
    """Register a new user for testing"""
    print("📝 Register New User")
    print("=" * 30)
    
    username = input("Username: ").strip()
    email = input("Email: ").strip()
    full_name = input("Full Name: ").strip()
    password = input("Password: ").strip()
    
    user_data = {
        "username": username,
        "email": email,
        "full_name": full_name,
        "password": password
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ User registered successfully!")
            print(f"User ID: {response.json()['id']}")
            return True
        else:
            print(f"❌ Registration failed: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🚀 CodeGuardian AI - Authentication Helper")
    print("\nChoose an option:")
    print("1. Get auth token (existing user)")
    print("2. Register new user")
    print("3. Register + Get token")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        get_auth_token()
    elif choice == "2":
        register_new_user()
    elif choice == "3":
        if register_new_user():
            print("\n" + "="*50)
            get_auth_token()
    else:
        print("Invalid choice!")

if __name__ == "__main__":
    main()
