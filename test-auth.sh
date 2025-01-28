#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Start services
echo "Starting services..."
./start-dev.sh &

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5  # Give services time to initialize

# Function to check if a service is ready
check_service() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null; then
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    return 1
}

# Check if services are ready
echo "Checking bank simulator..."
if ! check_service "http://localhost:3001/accounts/TEST-123/balance"; then
    echo -e "${RED}Bank simulator failed to start${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Bank simulator is ready${NC}"

echo "Checking orchestrator..."
if ! check_service "http://localhost:3000/health"; then
    echo -e "${RED}Orchestrator failed to start${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Orchestrator is ready${NC}"

# Additional verification of auth endpoint
echo "Verifying auth endpoint..."
AUTH_CHECK=$(curl -s -X OPTIONS "http://localhost:3000/auth")
if [ $? -ne 0 ]; then
    echo -e "${RED}Auth endpoint is not accessible${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Auth endpoint verified${NC}"

echo -e "${GREEN}Services are ready!${NC}"
echo "Starting authentication flow test..."

# Test valid credentials
echo -e "\nTesting valid credentials..."
AUTH_PAYLOAD='{"accountNumber": "1234567890", "code": "123456"}'
echo "Request to /auth:"
echo "Headers: Content-Type: application/json"
echo "Payload: $AUTH_PAYLOAD"

RESPONSE=$(curl -s -X POST http://localhost:3000/auth \
  -H "Content-Type: application/json" \
  -d "$AUTH_PAYLOAD" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS:")

if [ "$HTTP_STATUS" != "200" ]; then
    echo -e "${RED}✗ HTTP Status $HTTP_STATUS - Request failed${NC}"
    echo "Response: $RESPONSE_BODY"
    exit 1
fi

if echo "$RESPONSE_BODY" | grep -q "token"; then
  echo -e "${GREEN}✓ Authentication successful!${NC}"
  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
  echo "Session token: $TOKEN"
  
  # Test the token with a simple chat message
  echo -e "\nTesting chat with token..."
  CHAT_PAYLOAD='{"message": "What is my balance?"}'
  echo "Request to /chat:"
  echo "Headers:"
  echo "  Content-Type: application/json"
  echo "  Authorization: Bearer $TOKEN"
  echo "Payload: $CHAT_PAYLOAD"

  CHAT_RESPONSE=$(curl -s -X POST http://localhost:3000/chat \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$CHAT_PAYLOAD")
  
  if echo "$CHAT_RESPONSE" | grep -q "response"; then
    echo -e "${GREEN}✓ Chat message successful!${NC}"
    echo "Response: $(echo "$CHAT_RESPONSE" | grep -o '"response":"[^"]*' | grep -o '[^"]*$')"
  else
    echo -e "${RED}✗ Chat message failed${NC}"
    echo "Error: $CHAT_RESPONSE"
  fi
else
  echo -e "${RED}✗ Authentication failed${NC}"
  echo "Error: $RESPONSE"
fi

# Test invalid credentials
echo -e "\nTesting invalid credentials..."
INVALID_PAYLOAD='{"accountNumber": "ABC123", "code": "999999"}'
echo "Request to /auth:"
echo "Headers: Content-Type: application/json"
echo "Payload: $INVALID_PAYLOAD"

INVALID_RESPONSE=$(curl -s -X POST http://localhost:3000/auth \
  -H "Content-Type: application/json" \
  -d "$INVALID_PAYLOAD" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$INVALID_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$INVALID_RESPONSE" | grep -v "HTTP_STATUS:")

if [ "$HTTP_STATUS" = "401" ]; then
  if echo "$RESPONSE_BODY" | grep -q "Invalid credentials"; then
    echo -e "${GREEN}✓ Invalid credentials correctly rejected with 401 status${NC}"
  else
    echo -e "${RED}✗ Got 401 but wrong error message${NC}"
    echo "Response: $RESPONSE_BODY"
  fi
else
  echo -e "${RED}✗ Expected status 401, got $HTTP_STATUS${NC}"
  echo "Response: $RESPONSE_BODY"
fi

echo -e "\nTests completed!"

# Cleanup
echo "Cleaning up services..."
PID_FILE="/data/.dev-pids"
if [ -f "$PID_FILE" ]; then
    kill $(cat "$PID_FILE") 2>/dev/null
    rm "$PID_FILE"
    echo -e "${GREEN}Services stopped${NC}"
else
    echo -e "${RED}Could not find .dev-pids file${NC}"
    # Attempt to find and kill node processes as backup
    pkill -f "node.*bank-simulator/index.js" 2>/dev/null
    pkill -f "node.*orchestrator/index.js" 2>/dev/null
fi