#!/usr/bin/env python3
"""
Demo script for To-Do List API
This script demonstrates the complete API workflow including authentication and CRUD operations.
"""

import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

class APIDemo:
    def __init__(self):
        self.base_url = BASE_URL
        self.access_token = None
        self.headers = {"Content-Type": "application/json"}
        
    def print_step(self, step, description):
        print(f"\n{'='*60}")
        print(f"STEP {step}: {description}")
        print('='*60)
        
    def print_response(self, response, description="Response"):
        print(f"\n{description}:")
        print(f"Status Code: {response.status_code}")
        if response.headers.get('content-type', '').startswith('application/json'):
            print(f"Body: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Body: {response.text}")
            
    def register_user(self):
        self.print_step(1, "User Registration")
        
        user_data = {
            "username": "demo_user",
            "email": "demo@example.com",
            "password": "demopassword123"
        }
        
        print(f"Registering user: {user_data['username']}")
        response = requests.post(f"{self.base_url}/auth/register", json=user_data)
        self.print_response(response, "Registration Response")
        
        return response.status_code == 200
        
    def login_user(self):
        self.print_step(2, "User Login")
        
        login_data = {
            "username": "demo_user",
            "password": "demopassword123"
        }
        
        print(f"Logging in user: {login_data['username']}")
        response = requests.post(
            f"{self.base_url}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        self.print_response(response, "Login Response")
        
        if response.status_code == 200:
            self.access_token = response.json()["access_token"]
            self.headers["Authorization"] = f"Bearer {self.access_token}"
            print(f"✅ Authentication successful! Token obtained.")
            return True
        return False
        
    def create_lists(self):
        self.print_step(3, "Creating To-Do Lists")
        
        lists_to_create = [
            {
                "title": "Work Tasks",
                "description": "Professional tasks and projects"
            },
            {
                "title": "Personal Tasks",
                "description": "Personal errands and activities"
            },
            {
                "title": "Shopping List",
                "description": "Items to buy"
            }
        ]
        
        created_lists = []
        
        for i, list_data in enumerate(lists_to_create, 1):
            print(f"\nCreating list {i}: {list_data['title']}")
            response = requests.post(f"{self.base_url}/lists", json=list_data, headers=self.headers)
            self.print_response(response, f"Create List {i} Response")
            
            if response.status_code == 200:
                created_lists.append(response.json())
                
        return created_lists
        
    def create_tasks(self, lists):
        self.print_step(4, "Creating Tasks")
        
        if not lists:
            print("❌ No lists available to create tasks")
            return []
            
        # Tasks for Work List
        work_list_id = lists[0]["id"]
        work_tasks = [
            {
                "title": "Complete project proposal",
                "description": "Finish Q4 project proposal with budget analysis",
                "priority": "high",
                "due_date": (datetime.now() + timedelta(days=7)).isoformat() + "Z"
            },
            {
                "title": "Review team code",
                "description": "Code review for the new feature implementation",
                "priority": "medium"
            },
            {
                "title": "Update documentation",
                "description": "Update API documentation with new endpoints",
                "priority": "low"
            }
        ]
        
        # Tasks for Personal List
        personal_list_id = lists[1]["id"] if len(lists) > 1 else work_list_id
        personal_tasks = [
            {
                "title": "Book dentist appointment",
                "description": "Schedule regular checkup",
                "priority": "medium"
            },
            {
                "title": "Plan weekend trip",
                "description": "Research and book weekend getaway",
                "priority": "low"
            }
        ]
        
        created_tasks = []
        
        print(f"\nCreating tasks for Work List (ID: {work_list_id}):")
        for task in work_tasks:
            response = requests.post(f"{self.base_url}/lists/{work_list_id}/tasks", json=task, headers=self.headers)
            if response.status_code == 200:
                created_tasks.append(response.json())
                print(f"✅ Created: {task['title']}")
            else:
                print(f"❌ Failed to create: {task['title']}")
                
        print(f"\nCreating tasks for Personal List (ID: {personal_list_id}):")
        for task in personal_tasks:
            response = requests.post(f"{self.base_url}/lists/{personal_list_id}/tasks", json=task, headers=self.headers)
            if response.status_code == 200:
                created_tasks.append(response.json())
                print(f"✅ Created: {task['title']}")
            else:
                print(f"❌ Failed to create: {task['title']}")
                
        return created_tasks
        
    def demonstrate_crud(self, lists, tasks):
        self.print_step(5, "Demonstrating CRUD Operations")
        
        if not lists or not tasks:
            print("❌ No data available for CRUD demonstration")
            return
            
        # READ: Get all lists
        print("\n📖 Getting all lists:")
        response = requests.get(f"{self.base_url}/lists", headers=self.headers)
        self.print_response(response, "All Lists")
        
        # READ: Get specific list with tasks
        list_id = lists[0]["id"]
        print(f"\n📖 Getting list details (ID: {list_id}):")
        response = requests.get(f"{self.base_url}/lists/{list_id}", headers=self.headers)
        self.print_response(response, "List Details")
        
        # UPDATE: Update a task (mark as completed)
        if tasks:
            task_id = tasks[0]["id"]
            print(f"\n✏️ Marking task as completed (ID: {task_id}):")
            update_data = {"completed": True}
            response = requests.put(f"{self.base_url}/tasks/{task_id}", json=update_data, headers=self.headers)
            self.print_response(response, "Task Update")
            
        # UPDATE: Update list title
        print(f"\n✏️ Updating list title (ID: {list_id}):")
        update_data = {"title": "Updated Work Tasks", "description": "Updated description for work tasks"}
        response = requests.put(f"{self.base_url}/lists/{list_id}", json=update_data, headers=self.headers)
        self.print_response(response, "List Update")
        
        # READ: Get updated list to verify changes
        print(f"\n📖 Verifying list update (ID: {list_id}):")
        response = requests.get(f"{self.base_url}/lists/{list_id}", headers=self.headers)
        self.print_response(response, "Updated List Details")
        
    def demonstrate_security(self):
        self.print_step(6, "Demonstrating Security Features")
        
        # Test without authentication
        print("\n🔒 Testing endpoint without authentication:")
        response = requests.get(f"{self.base_url}/lists")
        self.print_response(response, "Unauthorized Request")
        
        # Test with invalid token
        print("\n🔒 Testing with invalid token:")
        invalid_headers = {"Authorization": "Bearer invalid_token_here"}
        response = requests.get(f"{self.base_url}/lists", headers=invalid_headers)
        self.print_response(response, "Invalid Token Request")
        
    def run_demo(self):
        print("🎬 Starting To-Do List API Demo")
        print(f"📡 Base URL: {self.base_url}")
        
        try:
            # Step 1: Register user
            if not self.register_user():
                print("❌ Registration failed - user might already exist, continuing...")
                
            # Step 2: Login
            if not self.login_user():
                print("❌ Login failed, stopping demo")
                return
                
            # Step 3: Create lists
            lists = self.create_lists()
            
            # Step 4: Create tasks
            tasks = self.create_tasks(lists)
            
            # Step 5: Demonstrate CRUD operations
            self.demonstrate_crud(lists, tasks)
            
            # Step 6: Demonstrate security
            self.demonstrate_security()
            
            print("\n🎉 Demo completed successfully!")
            print("\n📚 Next steps:")
            print("1. Import postman_collection.json into Postman")
            print("2. Visit http://localhost:8000/docs for interactive API documentation")
            print("3. Use the Bearer token from this demo in your requests")
            
        except requests.exceptions.ConnectionError:
            print("❌ Could not connect to the API server.")
            print("💡 Make sure the server is running: uvicorn main:app --reload")
        except Exception as e:
            print(f"❌ Demo failed with error: {str(e)}")

if __name__ == "__main__":
    demo = APIDemo()
    demo.run_demo()
