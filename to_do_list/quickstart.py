#!/usr/bin/env python3
"""
Quick Start Script for To-Do List API
Run this after installation to verify everything works correctly.
"""

import subprocess
import sys
import time
import threading
import requests
from pathlib import Path

def install_and_run():
    """Quick installation and demo runner."""
    
    print("🚀 To-Do List API Quick Start")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("main.py").exists():
        print("❌ Please run this script from the to_do_list directory")
        sys.exit(1)
    
    # Step 1: Setup
    print("\n📦 Step 1: Setting up environment...")
    try:
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        print("✅ Virtual environment created")
        
        # Determine activation script path
        if sys.platform == "win32":
            activate_script = "venv\\Scripts\\pip"
        else:
            activate_script = "venv/bin/pip"
            
        subprocess.run([activate_script, "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencies installed")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Setup failed: {e}")
        return
    
    # Step 2: Start server in background
    print("\n🌐 Step 2: Starting API server...")
    
    if sys.platform == "win32":
        python_executable = "venv\\Scripts\\python"
    else:
        python_executable = "venv/bin/python"
        
    server_process = subprocess.Popen([
        python_executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(5)
    
    # Step 3: Test server
    print("\n🧪 Step 3: Testing API...")
    try:
        response = requests.get("http://localhost:8000")
        if response.status_code == 200:
            print("✅ Server is running successfully!")
            print(f"📍 API Base URL: http://localhost:8000")
            print(f"📚 Documentation: http://localhost:8000/docs")
            print(f"📖 ReDoc: http://localhost:8000/redoc")
        else:
            print(f"⚠️ Server responded with status code: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server")
        server_process.terminate()
        return
    
    # Step 4: Run demo
    print("\n🎬 Step 4: Running API demo...")
    
    def run_demo():
        time.sleep(2)  # Give user time to read
        try:
            subprocess.run([python_executable, "demo.py"], check=True)
        except subprocess.CalledProcessError:
            print("❌ Demo failed")
    
    demo_thread = threading.Thread(target=run_demo)
    demo_thread.start()
    
    # Wait for demo to complete
    demo_thread.join()
    
    print("\n🎉 Quick start completed!")
    print("\n📋 What's running:")
    print("  • API Server: http://localhost:8000")
    print("  • Interactive Docs: http://localhost:8000/docs")
    print("  • ReDoc: http://localhost:8000/redoc")
    
    print("\n🛠️ Next steps:")
    print("  1. Import postman_collection.json into Postman")
    print("  2. Try the interactive API documentation")
    print("  3. Build your frontend application")
    
    print("\n⚡ To stop the server, press Ctrl+C")
    
    try:
        server_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping server...")
        server_process.terminate()
        server_process.wait()
        print("✅ Server stopped")

if __name__ == "__main__":
    install_and_run()
