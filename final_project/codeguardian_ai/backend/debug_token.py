#!/usr/bin/env python3
"""
Simple test for invalid token handling
"""

import requests

BASE_URL = "http://localhost:8000"

def test_invalid_token():
    """Test invalid token handling"""
    print("Testing invalid token...")
    
    headers = {
        "Authorization": "Bearer invalid_token_here",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code

if __name__ == "__main__":
    status = test_invalid_token()
    print(f"Expected: 401, Got: {status}")
