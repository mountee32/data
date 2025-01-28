#!/bin/bash

# Create a pid file in the data directory
PID_FILE="/data/.dev-pids"

# Start Bank Simulator
cd bank-simulator
npm install
node index.js &
BANK_PID=$!
echo "Bank Simulator started (PID: $BANK_PID)"

# Start Orchestrator
cd ../orchestrator
npm install
node index.js &
ORCH_PID=$!
echo "Orchestrator started (PID: $ORCH_PID)"

# Save PIDs for cleanup
echo "$BANK_PID $ORCH_PID" > $PID_FILE

echo "All services started. Use 'kill $(cat $PID_FILE)' to stop all services"

# Keep script running
wait