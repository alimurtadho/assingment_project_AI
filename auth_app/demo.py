#!/usr/bin/env python3
"""
Authentication App Demo Script

This script demonstrates the authentication API functionality
by making HTTP requests to test all endpoints.
"""

import requests
import json
import time
from typing import Dict, Any

API_BASE_URL = "http://localhost:8000"

class AuthDemo:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.refresh_token = None
        self.user_data = None
        
    def print_step(self, step: str):
        print(f"\n{'='*60}")
        print(f"🔄 {step}")
        print('='*60)
        
    def print_success(self, message: str):
        print(f"✅ {message}")
        
    def print_error(self, message: str):
        print(f"❌ {message}")
        
    def print_response(self, response: requests.Response):
        print(f"Status Code: {response.status_code}")
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
    
    def test_health_check(self):
        """Test the health check endpoint"""
        self.print_step("Testing Health Check")
        
        try:
            response = self.session.get(f"{API_BASE_URL}/health")
            self.print_response(response)
            
            if response.status_code == 200:
                self.print_success("Health check passed!")
                return True
            else:
                self.print_error("Health check failed!")
                return False
        except Exception as e:
            self.print_error(f"Health check error: {e}")
            return False
    
    def test_user_registration(self):
        """Test user registration"""
        self.print_step("Testing User Registration")
        
        user_data = {
            "email": "demo@example.com",
            "password": "demopassword123",
            "confirm_password": "demopassword123"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE_URL}/auth/register",
                json=user_data
            )
            self.print_response(response)
            
            if response.status_code == 201:
                self.user_data = response.json()
                self.print_success("User registration successful!")
                return True
            else:
                self.print_error("User registration failed!")
                return False
        except Exception as e:
            self.print_error(f"Registration error: {e}")
            return False
    
    def test_user_login(self):
        """Test user login"""
        self.print_step("Testing User Login")
        
        login_data = {
            "username": "demo@example.com",
            "password": "demopassword123"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE_URL}/auth/login",
                data=login_data
            )
            self.print_response(response)
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data["access_token"]
                self.refresh_token = token_data["refresh_token"]
                self.print_success("User login successful!")
                return True
            else:
                self.print_error("User login failed!")
                return False
        except Exception as e:
            self.print_error(f"Login error: {e}")
            return False
    
    def test_get_current_user(self):
        """Test getting current user profile"""
        self.print_step("Testing Get Current User")
        
        if not self.access_token:
            self.print_error("No access token available!")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }
        
        try:
            response = self.session.get(
                f"{API_BASE_URL}/users/me",
                headers=headers
            )
            self.print_response(response)
            
            if response.status_code == 200:
                self.print_success("Get current user successful!")
                return True
            else:
                self.print_error("Get current user failed!")
                return False
        except Exception as e:
            self.print_error(f"Get current user error: {e}")
            return False
    
    def test_token_refresh(self):
        """Test token refresh"""
        self.print_step("Testing Token Refresh")
        
        if not self.refresh_token:
            self.print_error("No refresh token available!")
            return False
        
        refresh_data = {
            "refresh_token": self.refresh_token
        }
        
        try:
            response = self.session.post(
                f"{API_BASE_URL}/auth/refresh",
                json=refresh_data
            )
            self.print_response(response)
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data["access_token"]
                self.refresh_token = token_data["refresh_token"]
                self.print_success("Token refresh successful!")
                return True
            else:
                self.print_error("Token refresh failed!")
                return False
        except Exception as e:
            self.print_error(f"Token refresh error: {e}")
            return False
    
    def test_protected_route_with_new_token(self):
        """Test protected route with refreshed token"""
        self.print_step("Testing Protected Route with Refreshed Token")
        
        if not self.access_token:
            self.print_error("No access token available!")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }
        
        try:
            response = self.session.get(
                f"{API_BASE_URL}/users/me",
                headers=headers
            )
            self.print_response(response)
            
            if response.status_code == 200:
                self.print_success("Protected route access with refreshed token successful!")
                return True
            else:
                self.print_error("Protected route access failed!")
                return False
        except Exception as e:
            self.print_error(f"Protected route error: {e}")
            return False
    
    def test_logout(self):
        """Test user logout"""
        self.print_step("Testing User Logout")
        
        try:
            response = self.session.post(f"{API_BASE_URL}/auth/logout")
            self.print_response(response)
            
            if response.status_code == 200:
                self.print_success("User logout successful!")
                return True
            else:
                self.print_error("User logout failed!")
                return False
        except Exception as e:
            self.print_error(f"Logout error: {e}")
            return False
    
    def test_invalid_token_access(self):
        """Test access with invalid token"""
        self.print_step("Testing Access with Invalid Token")
        
        headers = {
            "Authorization": "Bearer invalid_token_here"
        }
        
        try:
            response = self.session.get(
                f"{API_BASE_URL}/users/me",
                headers=headers
            )
            self.print_response(response)
            
            if response.status_code == 401:
                self.print_success("Invalid token correctly rejected!")
                return True
            else:
                self.print_error("Invalid token should have been rejected!")
                return False
        except Exception as e:
            self.print_error(f"Invalid token test error: {e}")
            return False
    
    def test_registration_validation(self):
        """Test registration input validation"""
        self.print_step("Testing Registration Validation")
        
        # Test weak password
        weak_password_data = {
            "email": "test@example.com",
            "password": "weak",
            "confirm_password": "weak"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE_URL}/auth/register",
                json=weak_password_data
            )
            self.print_response(response)
            
            if response.status_code == 422:
                self.print_success("Weak password correctly rejected!")
            else:
                self.print_error("Weak password should have been rejected!")
        except Exception as e:
            self.print_error(f"Validation test error: {e}")
        
        # Test password mismatch
        mismatch_data = {
            "email": "test@example.com",
            "password": "strongpassword123",
            "confirm_password": "differentpassword123"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE_URL}/auth/register",
                json=mismatch_data
            )
            self.print_response(response)
            
            if response.status_code == 422:
                self.print_success("Password mismatch correctly rejected!")
                return True
            else:
                self.print_error("Password mismatch should have been rejected!")
                return False
        except Exception as e:
            self.print_error(f"Validation test error: {e}")
            return False
    
    def run_demo(self):
        """Run the complete demo"""
        print("🚀 Starting Authentication API Demo")
        print(f"API Base URL: {API_BASE_URL}")
        
        # List of test functions
        tests = [
            self.test_health_check,
            self.test_registration_validation,
            self.test_user_registration,
            self.test_user_login,
            self.test_get_current_user,
            self.test_token_refresh,
            self.test_protected_route_with_new_token,
            self.test_invalid_token_access,
            self.test_logout
        ]
        
        results = []
        
        for test in tests:
            try:
                result = test()
                results.append(result)
                time.sleep(1)  # Small delay between tests
            except Exception as e:
                self.print_error(f"Test failed with exception: {e}")
                results.append(False)
        
        # Summary
        self.print_step("Demo Summary")
        passed = sum(results)
        total = len(results)
        
        print(f"Tests passed: {passed}/{total}")
        
        if passed == total:
            self.print_success("All tests passed! 🎉")
        else:
            self.print_error(f"{total - passed} test(s) failed!")
        
        return passed == total

def main():
    """Main function"""
    print("Authentication API Demo Script")
    print("Make sure the API server is running at http://localhost:8000")
    
    input("Press Enter to start the demo...")
    
    demo = AuthDemo()
    success = demo.run_demo()
    
    if success:
        print("\n🎉 Demo completed successfully!")
    else:
        print("\n❌ Demo completed with some failures.")
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())
