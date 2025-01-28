#!/bin/bash

echo "Testing complete flow..."

# 1. Test Bank Authentication
echo -e "\n1. Testing Authentication..."
curl -X POST http://localhost:3001/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"TEST-123","code":"0000"}'

# 2. Test Balance Query via Orchestrator
echo -e "\n\n2. Testing Balance Query..."
curl -X POST http://localhost:3003/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_session_token" \
  -d '{"message":"What is my current balance?"}'

# 3. Test Transaction Query via Orchestrator
echo -e "\n\n3. Testing Transaction Query..."
curl -X POST http://localhost:3003/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_session_token" \
  -d '{"message":"Show me my recent transactions"}'

echo -e "\n\nTest complete! Check responses above."