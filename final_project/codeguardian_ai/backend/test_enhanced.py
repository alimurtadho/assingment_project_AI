#!/usr/bin/env python3
"""
Enhanced test script with polling for analysis completion
"""

import requests
import json
import time
import os

BASE_URL = "http://localhost:8000"

def get_auth_token():
    """Get authentication token"""
    user_data = {
        "username": f"user_{int(time.time())}",
        "email": f"user_{int(time.time())}@example.com",
        "full_name": "Test User",
        "password": "testpassword123"
    }
    
    # Register new user
    reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
    if reg_response.status_code != 200:
        print(f"Registration failed: {reg_response.json()}")
        return None
    
    # Login
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def create_sample_project_files(project_id):
    """Create some sample files for analysis"""
    upload_dir = "./uploads"
    project_dir = os.path.join(upload_dir, f"project_{project_id}", "extracted")
    
    os.makedirs(project_dir, exist_ok=True)
    
    # Create a sample Python file
    sample_py = """
def calculate_sum(numbers):
    '''Calculate sum of numbers'''
    total = 0
    for number in numbers:
        total += number
    return total

def divide_numbers(a, b):
    '''Divide two numbers'''
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def get_history(self):
        return self.history
"""
    
    with open(os.path.join(project_dir, "calculator.py"), "w") as f:
        f.write(sample_py)
    
    # Create a test file
    test_py = """
import unittest
from calculator import Calculator, calculate_sum, divide_numbers

class TestCalculator(unittest.TestCase):
    def setUp(self):
        self.calc = Calculator()
    
    def test_add(self):
        result = self.calc.add(2, 3)
        self.assertEqual(result, 5)
    
    def test_calculate_sum(self):
        numbers = [1, 2, 3, 4, 5]
        result = calculate_sum(numbers)
        self.assertEqual(result, 15)
    
    def test_divide_numbers(self):
        result = divide_numbers(10, 2)
        self.assertEqual(result, 5.0)
    
    def test_divide_by_zero(self):
        with self.assertRaises(ValueError):
            divide_numbers(10, 0)

if __name__ == '__main__':
    unittest.main()
"""
    
    with open(os.path.join(project_dir, "test_calculator.py"), "w") as f:
        f.write(test_py)
    
    print(f"✅ Created sample files in {project_dir}")

def poll_analysis_completion(token, project_id, max_wait=30):
    """Poll for analysis completion"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("⏳ Waiting for analysis to complete...")
    
    for i in range(max_wait):
        response = requests.get(
            f"{BASE_URL}/api/analysis/{project_id}/analyses",
            headers=headers
        )
        
        if response.status_code == 200:
            analyses = response.json()
            completed = all(analysis['status'] == 'completed' for analysis in analyses)
            
            if completed and analyses:
                print("✅ All analyses completed!")
                return analyses
            
            # Show progress
            for analysis in analyses:
                print(f"  - {analysis['analysis_type']}: {analysis['status']} ({analysis['progress']}%)")
        
        time.sleep(1)
        print(f"  Waiting... ({i+1}/{max_wait})")
    
    print("⚠️  Analysis timeout - checking current status")
    return analyses if response.status_code == 200 else []

def test_all_endpoints(token, project_id):
    """Test all available endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🔍 Testing all endpoints...")
    
    endpoints = [
        ("GET", f"/api/projects/", "List projects"),
        ("GET", f"/api/projects/{project_id}", "Get project details"),
        ("GET", f"/api/analysis/{project_id}/analyses", "Get analyses"),
        ("GET", f"/api/security/{project_id}/scans", "Get security scans"),
    ]
    
    for method, endpoint, description in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            
            status = "✅ PASS" if response.status_code == 200 else f"❌ FAIL ({response.status_code})"
            print(f"  {description}: {status}")
            
            if response.status_code == 200 and response.json():
                print(f"    📊 Data: {len(response.json()) if isinstance(response.json(), list) else 'Object'}")
        
        except Exception as e:
            print(f"  {description}: ❌ ERROR - {e}")

def main():
    """Enhanced platform test"""
    print("🚀 Enhanced CodeGuardian AI Platform Test")
    print("=" * 60)
    
    # Get authentication
    print("\n1. Getting authentication token...")
    token = get_auth_token()
    if not token:
        print("❌ Authentication failed")
        return
    print("✅ Authentication successful")
    
    # Create project
    print("\n2. Creating test project...")
    headers = {"Authorization": f"Bearer {token}"}
    project_data = {
        "name": "Enhanced Test Project",
        "description": "A comprehensive test project for analysis",
        "technology_stack": ["Python", "FastAPI", "Testing"]
    }
    
    response = requests.post(f"{BASE_URL}/api/projects/", json=project_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Project creation failed: {response.json()}")
        return
    
    project = response.json()
    project_id = project['id']
    print(f"✅ Project created: {project['name']} (ID: {project_id})")
    
    # Create sample files for analysis
    print("\n3. Creating sample project files...")
    create_sample_project_files(project_id)
    
    # Start analysis
    print("\n4. Starting comprehensive analysis...")
    analysis_data = {"analysis_types": ["quality", "testing", "performance"]}
    response = requests.post(f"{BASE_URL}/api/analysis/{project_id}/analyze", json=analysis_data, headers=headers)
    if response.status_code == 200:
        print("✅ Analysis started")
    else:
        print(f"❌ Analysis failed: {response.json()}")
        return
    
    # Poll for completion
    print("\n5. Monitoring analysis progress...")
    analyses = poll_analysis_completion(token, project_id)
    
    # Check quality report
    print("\n6. Getting quality report...")
    response = requests.get(f"{BASE_URL}/api/analysis/{project_id}/quality-report", headers=headers)
    if response.status_code == 200:
        report = response.json()
        print("✅ Quality report available:")
        print(f"  📈 Maintainability Index: {report.get('maintainability_index', 'N/A')}")
        print(f"  🔧 Complexity Score: {report.get('complexity_score', 'N/A')}")
        print(f"  📝 Lines of Code: {report.get('lines_of_code', 'N/A')}")
        print(f"  🚦 Quality Gate: {report.get('quality_gate_status', 'N/A')}")
    else:
        print("⚠️  Quality report not yet available")
    
    # Test all endpoints
    test_all_endpoints(token, project_id)
    
    print("\n" + "=" * 60)
    print("🎯 Enhanced test completed!")
    print(f"🌐 FastAPI Docs: {BASE_URL}/docs")
    print(f"📊 Project ID: {project_id}")
    print("🔗 Use the Project ID to test more endpoints in the docs!")

if __name__ == "__main__":
    main()
