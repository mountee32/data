#!/bin/bash

# Change to backend directory
cd backend || exit

# Check if requirements are installed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing requirements..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start the API server
echo "Starting API server..."
python run.py
