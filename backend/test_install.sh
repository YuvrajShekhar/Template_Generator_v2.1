#!/bin/bash
# Test if requirements can be installed

echo "Testing Python 3.8 package installation..."
echo ""

# Check Python version
echo "Python version:"
python3 --version
echo ""

# Create temporary venv
echo "Creating test virtual environment..."
python3 -m venv /tmp/test_venv
source /tmp/test_venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Test install requirements
echo ""
echo "Installing requirements..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All packages installed successfully!"
    pip list
else
    echo ""
    echo "❌ Installation failed"
fi

# Cleanup
deactivate
rm -rf /tmp/test_venv
