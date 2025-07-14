# To-Do List API with Bearer Token Authentication

A comprehensive RESTful API for managing to-do lists and tasks with secure authentication using Bearer tokens.

## Features

- **User Authentication**: Registration and login with JWT Bearer tokens
- **To-Do Lists Management**: Create, read, update, and delete lists
- **Tasks Management**: Full CRUD operations for tasks within lists
- **Secure Endpoints**: All core endpoints protected with Bearer token authentication
- **Database**: SQLite with SQLAlchemy ORM
- **API Documentation**: Interactive Swagger UI and ReDoc

## Quick Start

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Clone or navigate to the project directory:
```bash
cd to_do_list
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Run the application:
```bash
uvicorn main:app --reload
```

The API will be available at: `http://localhost:8000`

## API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Base URL

```
http://localhost:8000
```

## Authentication Flow

1. **Register** a new user: `POST /auth/register`
2. **Login** to get access token: `POST /auth/login`
3. **Use the token** in Authorization header: `Authorization: Bearer <your_token>`

## Key Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get access token

### Lists (Protected)
- `GET /lists` - Get all user's lists
- `POST /lists` - Create new list
- `GET /lists/{list_id}` - Get specific list
- `PUT /lists/{list_id}` - Update list
- `DELETE /lists/{list_id}` - Delete list

### Tasks (Protected)
- `GET /lists/{list_id}/tasks` - Get all tasks in a list
- `POST /lists/{list_id}/tasks` - Create new task
- `GET /tasks/{task_id}` - Get specific task
- `PUT /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task

## Example Usage

### 1. Register a User
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### 2. Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john_doe&password=securepassword123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Create a List (with Bearer Token)
```bash
curl -X POST "http://localhost:8000/lists" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Work Tasks",
    "description": "Tasks related to work projects"
  }'
```

### 4. Create a Task
```bash
curl -X POST "http://localhost:8000/lists/1/tasks" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project proposal",
    "description": "Finish the Q4 project proposal document",
    "priority": "high"
  }'
```

## Request/Response Examples

### User Registration
**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2025-07-14T10:30:00Z"
}
```

### Create List
**Request:**
```json
{
  "title": "Personal Tasks",
  "description": "My personal to-do items"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Personal Tasks",
  "description": "My personal to-do items",
  "created_at": "2025-07-14T10:35:00Z",
  "updated_at": "2025-07-14T10:35:00Z",
  "owner_id": 1
}
```

### Create Task
**Request:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs, and fruits",
  "priority": "medium",
  "due_date": "2025-07-15T18:00:00Z"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, bread, eggs, and fruits",
  "completed": false,
  "priority": "medium",
  "due_date": "2025-07-15T18:00:00Z",
  "created_at": "2025-07-14T10:40:00Z",
  "updated_at": "2025-07-14T10:40:00Z",
  "list_id": 1
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `422` - Unprocessable Entity (invalid data format)
- `500` - Internal Server Error

Example error response:
```json
{
  "detail": "Invalid authentication credentials"
}
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 30 minutes
- All endpoints except authentication require valid Bearer tokens
- Users can only access their own lists and tasks

## Development

### Project Structure
```
to_do_list/
├── main.py              # FastAPI application entry point
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic schemas for request/response
├── auth.py              # Authentication utilities
├── database.py          # Database configuration
├── crud.py              # Database operations
├── dependencies.py      # Dependency injection
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## Postman Collection

Import the `postman_collection.json` file into Postman for a complete set of API requests with examples.

## Environment Variables

Create a `.env` file with:
```
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./todo.db
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
