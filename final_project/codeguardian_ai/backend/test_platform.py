#!/usr/bin/env python3
"""
Test script for CodeGuardian AI Project and Analysis endpoints
"""

import requests
import json
import time
import os
from pathlib import Path

BASE_URL = "http://localhost:8000"

def get_auth_token():
    """Get authentication token"""
    # Register and login
    user_data = {
        "username": "demo_user",
        "email": "demo@example.com",
        "full_name": "Demo User",
        "password": "demopassword123"
    }
    
    # Try to register (might fail if user exists)
    try:
        requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
    except:
        pass
    
    # Login
    login_data = {
        "username": "demo_user",
        "password": "demopassword123"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def create_test_project(token):
    """Create a test project"""
    headers = {"Authorization": f"Bearer {token}"}
    
    project_data = {
        "name": "Test Analysis Project",
        "description": "A test project for code analysis",
        "technology_stack": ["Python", "FastAPI"]
    }
    
    response = requests.post(
        f"{BASE_URL}/api/projects/",
        json=project_data,
        headers=headers
    )
    
    print(f"Create Project Status: {response.status_code}")
    if response.status_code == 200:
        project = response.json()
        print(f"✅ Project created: {project['name']} (ID: {project['id']})")
        return project['id']
    else:
        print(f"❌ Project creation failed: {response.json()}")
        return None

def start_code_analysis(token, project_id):
    """Start code analysis for a project"""
    headers = {"Authorization": f"Bearer {token}"}
    
    analysis_data = {
        "analysis_types": ["quality", "testing", "performance"]
    }
    
    response = requests.post(
        f"{BASE_URL}/api/analysis/{project_id}/analyze",
        json=analysis_data,
        headers=headers
    )
    
    print(f"Start Analysis Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Analysis started: {result['message']}")
        return True
    else:
        print(f"❌ Analysis start failed: {response.json()}")
        return False

def check_analysis_status(token, project_id):
    """Check analysis status"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/api/analysis/{project_id}/analyses",
        headers=headers
    )
    
    if response.status_code == 200:
        analyses = response.json()
        print(f"\n📊 Analysis Status for Project {project_id}:")
        for analysis in analyses:
            print(f"  - {analysis['analysis_type']}: {analysis['status']} ({analysis['progress']}%)")
        return analyses
    else:
        print(f"❌ Failed to get analysis status: {response.json()}")
        return []

def get_quality_report(token, project_id):
    """Get quality report"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/api/analysis/{project_id}/quality-report",
        headers=headers
    )
    
    if response.status_code == 200:
        report = response.json()
        print(f"\n📈 Quality Report for Project {project_id}:")
        print(f"  - Maintainability Index: {report.get('maintainability_index', 'N/A')}")
        print(f"  - Complexity Score: {report.get('complexity_score', 'N/A')}")
        print(f"  - Lines of Code: {report.get('lines_of_code', 'N/A')}")
        print(f"  - Quality Gate: {report.get('quality_gate_status', 'N/A')}")
        return report
    else:
        print(f"❌ No quality report available yet")
        return None

def test_security_scan(token, project_id):
    """Test security scanning"""
    headers = {"Authorization": f"Bearer {token}"}
    
    scan_data = {
        "scan_types": ["bandit", "safety"]
    }
    
    response = requests.post(
        f"{BASE_URL}/api/security/{project_id}/scan",
        json=scan_data,
        headers=headers
    )
    
    print(f"Security Scan Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Security scan started: {result.get('message', 'Started')}")
        return True
    else:
        print(f"❌ Security scan failed: {response.json()}")
        return False

def main():
    """Run the complete test suite"""
    print("🚀 Testing CodeGuardian AI Platform")
    print("=" * 50)
    
    # Get authentication token
    print("\n1. Getting authentication token...")
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token")
        return
    print("✅ Authentication successful")
    
    # Create a test project
    print("\n2. Creating test project...")
    project_id = create_test_project(token)
    if not project_id:
        print("❌ Failed to create project")
        return
    
    # Start code analysis
    print("\n3. Starting code analysis...")
    if start_code_analysis(token, project_id):
        
        # Wait a bit for analysis to start
        print("\n4. Waiting for analysis to process...")
        time.sleep(2)
        
        # Check analysis status
        print("\n5. Checking analysis status...")
        analyses = check_analysis_status(token, project_id)
        
        # Try to get quality report
        print("\n6. Getting quality report...")
        get_quality_report(token, project_id)
        
        # Test security scan
        print("\n7. Testing security scan...")
        test_security_scan(token, project_id)
    
    print("\n" + "=" * 50)
    print("🎯 Test completed!")
    print(f"📝 You can view detailed results at: {BASE_URL}/docs")
    print(f"🔗 Project ID for further testing: {project_id}")

if __name__ == "__main__":
    main()
