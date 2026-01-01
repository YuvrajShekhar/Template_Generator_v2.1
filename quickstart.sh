#!/bin/bash

# DocManager Quick Start Script - Python 3.8.10 Compatible

echo "=========================================="
echo "DocManager Django + React Setup"
echo "Python 3.8.10 Compatible"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | grep -oP '\d+\.\d+' || echo "0.0")
major=$(echo $python_version | cut -d. -f1)
minor=$(echo $python_version | cut -d. -f2)

if [ "$major" -lt 3 ] || ([ "$major" -eq 3 ] && [ "$minor" -lt 8 ]); then
    echo "Error: Python 3.8 or higher is required"
    echo "Current version: $(python3 --version 2>&1)"
    exit 1
fi

echo "✓ Python version OK: $(python3 --version 2>&1)"
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Backend setup
echo "Setting up Django backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Running migrations..."
python manage.py migrate

echo "Backend setup complete!"
echo ""

# Frontend setup
cd ../frontend
echo "Setting up React frontend..."

echo "Installing Node dependencies..."
npm install

echo "Frontend setup complete!"
echo ""

# Final instructions
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Python version: $(python3 --version 2>&1)"
echo "Django version: $(python -c 'import django; print(django.get_version())')"
echo ""
echo "To start the application:"
echo ""
echo "1. Backend (Terminal 1):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo ""
echo "2. Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
