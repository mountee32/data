#!/bin/bash

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

# Start Frontend
cd ../frontend
npm install
PORT=3002 npm start &
FE_PID=$!
echo "Frontend started on port 3002 (PID: $FE_PID)"

# Save PIDs for cleanup
echo "$BANK_PID $ORCH_PID $FE_PID" > .dev-pids

echo "All services started. Use 'kill $(cat .dev-pids)' to stop all services"

# Keep script running
wait