#!/usr/bin/env python3
"""
Authentication Testing Script for CodeGuardian AI Platform
Tests user registration, login, and protected endpoints with Bearer tokens
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
AUTH_URL = f"{BASE_URL}/api/auth"

def print_separator(title):
    """Print a nice separator for test sections"""
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

def print_response(response, title="Response"):
    """Pretty print HTTP response"""
    print(f"\n{title}:")
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    try:
        print(f"Body: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Body: {response.text}")

def test_health_check():
    """Test basic health check endpoint"""
    print_separator("1. HEALTH CHECK TEST")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print_response(response, "Health Check")
        
        if response.status_code == 200:
            print("✅ Health check passed!")
            return True
        else:
            print("❌ Health check failed!")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_user_registration():
    """Test user registration"""
    print_separator("2. USER REGISTRATION TEST")
    
    # Test user data
    test_user = {
        "username": f"testuser_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "email": f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
        "full_name": "Test User",
        "password": "testpassword123"
    }
    
    print(f"Registering user: {test_user['username']}")
    
    try:
        response = requests.post(
            f"{AUTH_URL}/register",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        
        print_response(response, "Registration")
        
        if response.status_code == 200:
            print("✅ User registration successful!")
            return test_user, response.json()
        else:
            print("❌ User registration failed!")
            return None, None
            
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return None, None

def test_user_login(username, password):
    """Test user login and token generation"""
    print_separator("3. USER LOGIN TEST")
    
    # OAuth2 form data for login
    login_data = {
        "username": username,
        "password": password
    }
    
    print(f"Logging in user: {username}")
    
    try:
        response = requests.post(
            f"{AUTH_URL}/login",
            data=login_data,  # OAuth2PasswordRequestForm expects form data
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print_response(response, "Login")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            print(f"✅ Login successful!")
            print(f"🔑 Access Token: {access_token[:50]}...")
            return access_token
        else:
            print("❌ Login failed!")
            return None
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_protected_endpoint(access_token):
    """Test accessing protected endpoint with Bearer token"""
    print_separator("4. PROTECTED ENDPOINT TEST")
    
    if not access_token:
        print("❌ No access token available for testing")
        return False
    
    # Test the /auth/me endpoint (requires authentication)
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    print("Testing /auth/me endpoint with Bearer token...")
    
    try:
        response = requests.get(f"{AUTH_URL}/me", headers=headers)
        print_response(response, "Protected Endpoint (/auth/me)")
        
        if response.status_code == 200:
            user_data = response.json()
            print("✅ Protected endpoint access successful!")
            print(f"👤 Current user: {user_data.get('username')} ({user_data.get('email')})")
            return True
        else:
            print("❌ Protected endpoint access failed!")
            return False
            
    except Exception as e:
        print(f"❌ Protected endpoint error: {e}")
        return False

def test_invalid_token():
    """Test accessing protected endpoint with invalid token"""
    print_separator("5. INVALID TOKEN TEST")
    
    # Test with invalid token
    headers = {
        "Authorization": "Bearer invalid_token_here",
        "Content-Type": "application/json"
    }
    
    print("Testing with invalid Bearer token...")
    
    try:
        response = requests.get(f"{AUTH_URL}/me", headers=headers)
        print_response(response, "Invalid Token Test")
        
        if response.status_code == 401:
            print("✅ Invalid token correctly rejected!")
            return True
        else:
            print("❌ Invalid token test failed - should return 401!")
            return False
            
    except Exception as e:
        print(f"❌ Invalid token test error: {e}")
        return False

def test_no_token():
    """Test accessing protected endpoint without token"""
    print_separator("6. NO TOKEN TEST")
    
    print("Testing protected endpoint without token...")
    
    try:
        response = requests.get(f"{AUTH_URL}/me")
        print_response(response, "No Token Test")
        
        if response.status_code == 403:
            print("✅ No token correctly rejected!")
            return True
        else:
            print("❌ No token test failed - should return 403!")
            return False
            
    except Exception as e:
        print(f"❌ No token test error: {e}")
        return False

def main():
    """Run all authentication tests"""
    print("🚀 Starting CodeGuardian AI Authentication Tests")
    print(f"🎯 Target URL: {BASE_URL}")
    
    results = []
    
    # 1. Health check
    results.append(test_health_check())
    
    # 2. User registration
    user_data, registered_user = test_user_registration()
    results.append(user_data is not None)
    
    if user_data:
        # 3. User login
        access_token = test_user_login(user_data["username"], user_data["password"])
        results.append(access_token is not None)
        
        # 4. Protected endpoint with valid token
        results.append(test_protected_endpoint(access_token))
    else:
        print("⚠️  Skipping login and protected endpoint tests due to registration failure")
        results.extend([False, False])
    
    # 5. Invalid token test
    results.append(test_invalid_token())
    
    # 6. No token test
    results.append(test_no_token())
    
    # Summary
    print_separator("TEST SUMMARY")
    test_names = [
        "Health Check",
        "User Registration", 
        "User Login",
        "Protected Endpoint (Valid Token)",
        "Invalid Token Rejection",
        "No Token Rejection"
    ]
    
    passed = sum(results)
    total = len(results)
    
    for i, (name, result) in enumerate(zip(test_names, results)):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{i+1}. {name}: {status}")
    
    print(f"\n🎯 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All authentication tests passed!")
    else:
        print("⚠️  Some tests failed. Check the logs above.")
    
    return passed == total

if __name__ == "__main__":
    main()
