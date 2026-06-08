#!/bin/bash

# Umbra Protocol - Quick Setup Script

echo "🔧 Umbra Protocol - Setup Script"
echo "=================================="

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL is installed"
else
    echo "✗ PostgreSQL is not installed. Please install it first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created. Please edit it with your settings."
else
    echo "✓ .env file already exists"
fi

# Setup backend
echo ""
echo "📦 Setting up Python backend..."
cd backend

if [ ! -d venv ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
if [ -f venv/bin/activate ]; then
    source venv/bin/activate
else
    echo "✗ Failed to create virtual environment"
    exit 1
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Telegram bot token and database credentials"
echo "2. Run: source backend/venv/bin/activate (on macOS/Linux)"
echo "3. Run: cd backend && python app.py"
echo "4. Open frontend/index.html in your browser"
echo ""
echo "Documentation: See SETUP.md for detailed instructions"
