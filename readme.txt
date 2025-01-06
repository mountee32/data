To Run The backend
-----------------
cd legal_case_mgmt/backend && source venv/bin/activate && uvicorn app.main:app --reload

Test with...
-----------------
cd legal_case_mgmt/backend && source venv/bin/activate && pytest -v

To get an API token
-----------------
curl -X POST "http://localhost:8000/api/v1/auth/login" -d "username=testuser&password=testpassword123"
...example output
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzY4ODQ2NTMsInN1YiI6IjkifQ.WOQjOgFc_do5rPIOvnpm-6o2oOs57CSnBBP3s0nYqT4","token_type":"bearer"}

To Curl Test the API
----------------------
./legal_case_mgmt/backend/test_api.sh