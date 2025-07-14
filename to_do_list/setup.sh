#!/bin/bash

# Setup script for To-Do List API
echo "🚀 Setting up To-Do List API..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating environment file..."
    cp .env.example .env
    echo "✏️ Please edit .env file with your settings"
fi

# Create database tables
echo "🗄️ Creating database tables..."
python -c "from models import Base, engine; Base.metadata.create_all(bind=engine); print('Database tables created successfully!')"

echo "✅ Setup complete!"
echo ""
echo "📋 To start the API server:"
echo "   source venv/bin/activate"
echo "   uvicorn main:app --reload"
echo ""
echo "📖 API Documentation will be available at:"
echo "   http://localhost:8000/docs"
echo ""
echo "🧪 To run tests:"
echo "   pip install pytest pytest-asyncio httpx"
echo "   pytest"
