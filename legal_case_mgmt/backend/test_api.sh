#!/bin/bash

# Get access token using Python for JSON parsing
TOKEN=$(python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" <<< $(curl -s -X POST "http://localhost:8000/api/v1/auth/login" -d "username=testuser&password=testpassword123"))

if [ -z "$TOKEN" ]; then
  echo "Failed to obtain access token"
  exit 1
fi

echo "Obtained token: $TOKEN"

# Test GET all cases
echo -e "\nTesting GET /api/v1/cases/"
curl -s -X GET "http://localhost:8000/api/v1/cases/" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test POST new case
echo -e "\nTesting POST /api/v1/cases/"
NEW_CASE=$(curl -s -X POST "http://localhost:8000/api/v1/cases/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "case_number": "TEST-001",
    "title": "Test Case",
    "case_type": "civil",
    "status": "open"
  }')
echo $NEW_CASE | python3 -m json.tool

# Get new case ID
CASE_ID=$(python3 -c "import sys, json; print(json.load(sys.stdin)['case_id'])" <<< "$NEW_CASE")

# Test GET single case
echo -e "\nTesting GET /api/v1/cases/$CASE_ID"
curl -s -X GET "http://localhost:8000/api/v1/cases/$CASE_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test PUT update case
echo -e "\nTesting PUT /api/v1/cases/$CASE_ID"
curl -s -X PUT "http://localhost:8000/api/v1/cases/$CASE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "closed"
  }' | python3 -m json.tool

# Test DELETE case
echo -e "\nTesting DELETE /api/v1/cases/$CASE_ID"
curl -s -X DELETE "http://localhost:8000/api/v1/cases/$CASE_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool