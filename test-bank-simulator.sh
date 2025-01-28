#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Testing Bank Simulator API (Port 3001)..."

# Start bank simulator
echo -e "\nStarting bank simulator..."
cd bank-simulator && node index.js &
BANK_PID=$!

# Wait for service to be ready
echo "Waiting for service to start..."
sleep 5

# Test 1: Authentication Validation
echo -e "\nTest 1: POST /auth/validate"
echo "Testing valid credentials..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"accountNumber": "TEST-123", "code": "0000"}')

if echo "$AUTH_RESPONSE" | grep -q '"valid":true'; then
  echo -e "${GREEN}✓ Valid credentials accepted${NC}"
else
  echo -e "${RED}✗ Valid credentials test failed${NC}"
  echo "Response: $AUTH_RESPONSE"
fi

echo -e "\nTesting invalid credentials..."
INVALID_AUTH_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"accountNumber": "WRONG", "code": "9999"}')

if echo "$INVALID_AUTH_RESPONSE" | grep -q '"valid":false'; then
  echo -e "${GREEN}✓ Invalid credentials rejected${NC}"
else
  echo -e "${RED}✗ Invalid credentials test failed${NC}"
  echo "Response: $INVALID_AUTH_RESPONSE"
fi

# Test 2: Balance Endpoint
echo -e "\nTest 2: GET /accounts/{id}/balance"
BALANCE_RESPONSE=$(curl -s http://localhost:3001/accounts/TEST-123/balance)

if echo "$BALANCE_RESPONSE" | grep -q '"balance":.*"currency":"USD"'; then
  echo -e "${GREEN}✓ Balance retrieved successfully${NC}"
  echo "Response: $BALANCE_RESPONSE"
else
  echo -e "${RED}✗ Balance check failed${NC}"
  echo "Response: $BALANCE_RESPONSE"
fi

# Test 3: Transactions Endpoint
echo -e "\nTest 3: GET /accounts/{id}/transactions"
TX_RESPONSE=$(curl -s http://localhost:3001/accounts/TEST-123/transactions)

if echo "$TX_RESPONSE" | grep -q '"transactions":\['; then
  echo -e "${GREEN}✓ Transactions retrieved successfully${NC}"
  echo "Response: $TX_RESPONSE"
else
  echo -e "${RED}✗ Transactions check failed${NC}"
  echo "Response: $TX_RESPONSE"
fi

# Cleanup
echo -e "\nCleaning up..."
kill $BANK_PID
echo -e "${GREEN}Bank simulator stopped${NC}"

echo -e "\nAll tests completed!"