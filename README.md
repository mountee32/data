# Banking Chatbot Prototype

A prototype banking chatbot that allows users to authenticate and perform basic banking operations like checking balances and viewing transactions.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Project Structure

- `bank-simulator/` - Mock bank API service
- `orchestrator/` - Main service handling authentication and chat
- `frontend/` - React-based web interface (optional)
- `test-auth.sh` - Test script for authentication flow
- `start-dev.sh` - Development server startup script

## Setup

1. Database Setup:

The project uses SQLite for data storage, providing a lightweight, file-based database perfect for development and testing. The database file is located at `db/banking.db` and contains the following tables:

- `customers`: Stores customer credentials
  - `account_number` (TEXT PRIMARY KEY): Customer's account number
  - `online_banking_code` (TEXT): Customer's online banking code
  - `created_at` (DATETIME): Account creation timestamp

- `chat_history`: Stores conversation history
  - `id` (INTEGER PRIMARY KEY): Auto-incrementing ID
  - `session_id` (TEXT): Session identifier
  - `customer_id` (TEXT): Reference to customer account
  - `message` (TEXT): The chat message content
  - `is_bot` (INTEGER): 1 for bot responses, 0 for user messages
  - `created_at` (DATETIME): Message timestamp

- `accounts`: Stores customer bank accounts
  - `id` (TEXT PRIMARY KEY): Unique account identifier
  - `customer_id` (TEXT): Reference to customer
  - `account_type` (TEXT): Type of account (e.g., CHECKING, SAVINGS)
  - `balance` (DECIMAL): Current balance
  - `currency` (TEXT): Account currency
  - `is_active` (INTEGER): 1 for active, 0 for inactive
  - `created_at` (DATETIME): Account creation timestamp

- `transactions`: Stores account transactions
  - `id` (TEXT PRIMARY KEY): Unique transaction identifier
  - `account_id` (TEXT): Reference to account
  - `transaction_type` (TEXT): Type of transaction
  - `amount` (DECIMAL): Transaction amount
  - `description` (TEXT): Transaction description
  - `created_at` (DATETIME): Transaction timestamp

To set up the database:

1. Install dependencies:
   ```bash
   npm install sqlite3
   ```

2. Initialize the database with schema and test data:
   ```bash
   node setup-sqlite-db.js
   ```

3. Verify the setup by running tests:
   ```bash
   node test-sqlite-banking.js
   ```

Benefits of SQLite:
- Zero-configuration required
- Single file database (easy to backup/version)
- No network latency
- Perfect for development and testing
- No authentication needed
- Direct SQL queries (no REST API)

Note: The database file is created in the `db` directory. You can delete this file and run setup-sqlite-db.js again to reset to a fresh state.

2. Install dependencies for both services:

```bash
# Install bank simulator dependencies
cd bank-simulator
npm install

# Install orchestrator dependencies
cd ../orchestrator
npm install
```

2. Configure environment variables:

Create `orchestrator/.env` with:
```
PORT=3000  # Port for the orchestrator service
```

Note: No database configuration is needed as SQLite uses a local file (db/banking.db)

## Running Tests

The project includes test scripts for each component:

1. SQLite Database Tests:
```bash
# Initialize database with schema and test data
node setup-sqlite-db.js

# Test direct database operations
node test-sqlite-banking.js
```

Tests the following database operations:
- Schema validation
- Customer data access
- Account queries
- Transaction records
- Chat history storage

2. Bank Simulator Tests (Port 3001):
```bash
./test-bank-simulator.sh
```

Tests the following endpoints:
- POST /auth/validate: Customer authentication
  - Request: { accountNumber, code }
  - Response: { valid: boolean }

- GET /accounts/{id}/balance: Account balance lookup
  - Response: { balance: number, currency: string }

- GET /accounts/{id}/transactions: Transaction history
  - Response: { transactions: Array<Transaction> }

The test script verifies:
- Service startup
- Valid/invalid credentials
- Balance retrieval
- Transaction history
- Error handling
- Service cleanup

3. Orchestrator Tests (Port 3000):
```bash
chmod +x test-auth.sh  # Make script executable (first time only)
./test-auth.sh
```

Tests the following endpoints:
- POST /auth: Customer authentication
  - Request: { accountNumber, code }
  - Response: { token }

- POST /chat: Message handling
  - Request: { message }
  - Headers: Authorization Bearer token
  - Response: { response }

The test script verifies:
- Service startup and health checks
- Authentication flow
- Protected endpoint access
- Chat message processing
- Error handling
- Service cleanup

### Test Credentials

The following credentials are stored in the SQLite database:

- Account Number: 1234567890
- Online Code: 123456

Invalid credentials (for testing):
- Account Number: ABC123
- Online Code: 999999

## Manual Testing

If you want to test the endpoints manually:

1. Ensure database is initialized:
```bash
node setup-sqlite-db.js  # If not already done
```

2. Start the services:
```bash
./start-dev.sh
```

3. Authenticate:
```bash
curl -X POST http://localhost:3000/auth \
  -H "Content-Type: application/json" \
  -d '{"accountNumber": "1234567890", "code": "123456"}'
```

4. Use the returned token to check balance:
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "What is my balance?"}'
```

Note: The SQLite database file (db/banking.db) can be deleted and recreated at any time to reset to a clean state.

## Development Notes

- The bank simulator runs on port 3001
- The orchestrator runs on port 3000
- All services are automatically cleaned up after tests
- Check test-auth.sh output for detailed test results