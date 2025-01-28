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

1. Configure Supabase:

The project uses Supabase for data storage. The following tables are required:

- `customers`: Stores customer credentials
  - `account_number` (varchar): Customer's account number
  - `online_banking_code` (varchar): Customer's online banking code
  - `created_at` (timestamptz): Account creation timestamp

- `chat_history`: Stores conversation history
  - `session_id` (uuid): Unique session identifier
  - `customer_id` (varchar): Reference to customer account
  - `message` (text): The chat message content
  - `is_bot` (boolean): True for bot responses, false for user messages
  - `created_at` (timestamptz): Message timestamp

- `accounts`: Stores customer bank accounts
  - `id` (uuid): Unique account identifier
  - `customer_id` (varchar): Reference to customer
  - `account_type` (varchar): Type of account (e.g., CHECKING, SAVINGS)
  - `balance` (decimal): Current balance
  - `currency` (varchar): Account currency
  - `is_active` (boolean): Account status
  - `created_at` (timestamptz): Account creation timestamp

- `transactions`: Stores account transactions
  - `id` (uuid): Unique transaction identifier
  - `account_id` (uuid): Reference to account
  - `transaction_type` (varchar): Type of transaction
  - `amount` (decimal): Transaction amount
  - `description` (varchar): Transaction description
  - `created_at` (timestamptz): Transaction timestamp

To set up the banking tables:
1. Open your Supabase project's SQL editor
2. Create a "New query"
3. Copy and paste the contents of setup-banking-tables.sql
4. Click "Run" to execute the SQL commands
5. Verify the tables were created in the "Table Editor"
6. Run the data population script:
   ```bash
   node test-setup-banking-data.js
   ```

Note: If you get permission errors, make sure to:
1. Enable "Row Level Security (RLS)" for each table
2. Add appropriate policies (the SQL script includes these)
3. Use the correct API key (anon/public key for normal operations)

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
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## Running Tests

The project includes test scripts for both authentication and chat functionality:

1. Authentication Flow Test:

```bash
chmod +x test-auth.sh  # Make script executable (first time only)
./test-auth.sh
```

The authentication test will:
1. Start both the bank simulator and orchestrator services
2. Test authentication with valid credentials
3. Test protected endpoint access
4. Test invalid credentials handling
5. Automatically clean up services when done

2. Chat History Test:
```bash
node test-chat-history.js
```

The chat history test will:
1. Connect to Supabase directly
2. Insert test messages into chat_history
3. Verify bot responses are stored
4. Retrieve and display conversation flow
5. Verify message ordering and timestamps

### Test Credentials

The following credentials are stored in the Supabase customers table:

- Account Number: 1234567890
- Online Code: 123456

Invalid credentials (for testing):
- Account Number: ABC123
- Online Code: 999999

## Manual Testing

If you want to test the endpoints manually:

1. Start the services:
```bash
./start-dev.sh
```

2. Authenticate:
```bash
curl -X POST http://localhost:3000/auth \
  -H "Content-Type: application/json" \
  -d '{"accountNumber": "TEST-123", "code": "0000"}'
```

3. Use the returned token to check balance:
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "What is my balance?"}'
```

## Development Notes

- The bank simulator runs on port 3001
- The orchestrator runs on port 3000
- All services are automatically cleaned up after tests
- Check test-auth.sh output for detailed test results