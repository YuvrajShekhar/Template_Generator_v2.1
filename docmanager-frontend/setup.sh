#!/bin/bash

# DocManager Frontend Setup Script for Ubuntu
# This script sets up the development environment

set -e

echo "🚀 DocManager Frontend Setup"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check Node.js version
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        print_status "Node.js $(node -v) is installed"
    else
        print_warning "Node.js version is too old. Required: 20+, Found: $(node -v)"
        echo "Please update Node.js: https://nodejs.org/"
        exit 1
    fi
else
    print_error "Node.js is not installed"
    echo "Please install Node.js 20+ from: https://nodejs.org/"
    echo ""
    echo "Quick install with nvm:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  source ~/.bashrc"
    echo "  nvm install 20"
    exit 1
fi

# Check npm
echo ""
echo "Checking npm..."
if command -v npm &> /dev/null; then
    print_status "npm $(npm -v) is installed"
else
    print_error "npm is not installed"
    exit 1
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "VITE_API_BASE_URL=http://localhost:8000" > .env
    print_status ".env file created"
else
    print_status ".env file already exists"
fi

# Success message
echo ""
echo "============================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "============================"
echo ""
echo "To start the development server:"
echo ""
echo "  npm run dev"
echo ""
echo "The application will be available at:"
echo "  http://localhost:5173"
echo ""
echo "Make sure your backend is running at:"
echo "  http://localhost:8000"
echo ""
echo "Happy coding! 🎉"
