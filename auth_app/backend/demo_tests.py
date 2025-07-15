"""
Simple Test Runner - Executable version for demonstration
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle the output."""
    print(f"\n{'='*50}")
    print(f"🔍 {description}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=Path(__file__).parent)
        
        if result.returncode == 0:
            print(f"✅ SUCCESS: {description}")
            if result.stdout:
                print(result.stdout)
        else:
            print(f"❌ FAILED: {description}")
            if result.stderr:
                print(result.stderr)
            if result.stdout:
                print(result.stdout)
        
        return result.returncode == 0
    
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def check_dependencies():
    """Check if required dependencies are installed."""
    print("🔍 Checking dependencies...")
    
    try:
        import pytest
        print("✅ pytest available")
    except ImportError:
        print("❌ pytest not available")
        return False
    
    try:
        import fastapi
        print("✅ fastapi available")
    except ImportError:
        print("❌ fastapi not available")
        return False
    
    return True

def run_sample_tests():
    """Run sample tests to demonstrate functionality."""
    print("\n" + "="*60)
    print("🚀 AUTHENTICATION API - TEST AUTOMATION DEMO")
    print("="*60)
    
    # Check if we're in the right directory
    if not os.path.exists("main.py"):
        print("❌ Please run this from the backend directory")
        return False
    
    # Clean up any existing test artifacts
    cleanup_commands = [
        "rm -f test_auth.db",
        "rm -rf .pytest_cache",
        "rm -f .coverage",
        "rm -rf coverage"
    ]
    
    for cmd in cleanup_commands:
        subprocess.run(cmd, shell=True, capture_output=True)
    
    # Create a simple test to verify setup
    simple_test_content = '''
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    """Test that the API is responding."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data

def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_docs_accessible():
    """Test that API docs are accessible."""
    response = client.get("/docs")
    assert response.status_code == 200
'''
    
    # Write simple test
    with open("test_simple.py", "w") as f:
        f.write(simple_test_content)
    
    print("\n📝 Running basic connectivity tests...")
    success = run_command("python -m pytest test_simple.py -v", "Basic API Tests")
    
    if success:
        print("\n📊 Test Summary:")
        print("✅ API is responding correctly")
        print("✅ Health check endpoint working")
        print("✅ Documentation accessible")
        print("\n🎯 Test automation setup is ready!")
        print("\n📁 Available test files:")
        if os.path.exists("tests"):
            test_files = [f for f in os.listdir("tests") if f.startswith("test_") and f.endswith(".py")]
            for test_file in test_files:
                print(f"   - tests/{test_file}")
    
    # Cleanup
    if os.path.exists("test_simple.py"):
        os.remove("test_simple.py")
    
    return success

def main():
    """Main function to run the demonstration."""
    
    print("🔧 Setting up test environment...")
    
    # Check dependencies first
    if not check_dependencies():
        print("\n❌ Missing dependencies. Please install:")
        print("   pip install fastapi pytest httpx")
        return
    
    # Run the demonstration
    if run_sample_tests():
        print("\n" + "="*60)
        print("✅ TEST AUTOMATION SETUP COMPLETE!")
        print("="*60)
        print("\n📚 Next steps:")
        print("1. Run full test suite: python -m pytest tests/ -v")
        print("2. Run with coverage: python -m pytest tests/ --cov=.")
        print("3. Check test files in tests/ directory")
        print("4. Review README_TESTING.md for detailed instructions")
        
        # Show available test commands
        print("\n🛠️  Available test commands:")
        print("   python -m pytest tests/test_auth.py -v      # Authentication tests")
        print("   python -m pytest tests/test_users.py -v     # User management tests")
        print("   python -m pytest tests/test_integration.py -v # Integration tests")
        
    else:
        print("\n❌ Setup failed. Please check the error messages above.")

if __name__ == "__main__":
    main()
