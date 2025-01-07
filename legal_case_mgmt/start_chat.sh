#!/bin/bash

# Change to frontend directory
cd /data/legal_case_mgmt/frontend || exit

# Check if requirements are installed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing requirements..."
    pip install requests python-dotenv pydantic-ai
else
    source venv/bin/activate
fi

# Start the chat interface
echo "Starting chat interface..."
python agentchat.py
