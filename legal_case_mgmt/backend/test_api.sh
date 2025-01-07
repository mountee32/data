#!/bin/bash

# Get access token and user ID using Python for JSON parsing
AUTH_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login" -d "username=testuser&password=testpassword123")
TOKEN=$(python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" <<< "$AUTH_RESPONSE")
USER_ID=$(python3 -c "import sys, json; print(json.load(sys.stdin)['user_id'])" <<< "$AUTH_RESPONSE")

if [ -z "$TOKEN" ]; then
  echo "Failed to obtain access token"
  exit 1
fi

echo "Obtained token: $TOKEN"
echo "User ID: $USER_ID"

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

# Document API Tests

# Test POST create document metadata
echo -e "\nTesting POST /api/v1/documents/"
DOCUMENT_PAYLOAD=$(python3 -c "import json; print(json.dumps({
    'case_id': $CASE_ID,
    'title': 'Test Document Title',
    'description': 'Test Document Description',
    'document_type': 'evidence',
    'created_by': $USER_ID
}))")

DOCUMENT_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/documents/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$DOCUMENT_PAYLOAD")
echo $DOCUMENT_RESPONSE | python3 -m json.tool

# Get document ID from response
DOCUMENT_ID=$(python3 -c "import sys, json; print(json.load(sys.stdin)['document_id'])" <<< "$DOCUMENT_RESPONSE")

# Test GET document metadata
echo -e "\nTesting GET /api/v1/documents/$DOCUMENT_ID"
curl -s -X GET "http://localhost:8000/api/v1/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test PUT update document metadata
echo -e "\nTesting PUT /api/v1/documents/$DOCUMENT_ID"
curl -s -X PUT "http://localhost:8000/api/v1/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated Test Document Description"
  }' | python3 -m json.tool

# Test DELETE document
echo -e "\nTesting DELETE /api/v1/documents/$DOCUMENT_ID"
curl -s -X DELETE "http://localhost:8000/api/v1/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
