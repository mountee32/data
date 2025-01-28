Below is a simplified technical specification for a prototype chatbot solution. The focus is on demonstrating core functionality rather than production-grade rigor. We’ve deliberately chosen straightforward designs and minimal security/performance considerations for now, with the understanding that future iterations can address scaling, compliance, and robustness.

1. Project Scope
Objective: Create a working demo of a banking chatbot that:

Authenticates a user by account number and online code.
Performs a balance inquiry.
Optionally demonstrates updating the user’s address or scheduling a payment.
Primary Goal: Prove the viability of a conversation-driven experience that integrates with:

Supabase (for storing session/conversation data).
A Bank API Simulator (mock banking actions).
OpenRouter for LLM usage (GPT-4o-mini) to handle natural language understanding and response generation.
Key Simplifications:

No high-scale concurrency or advanced security.
Minimal error handling and logging.
Limited data model (just enough to prove the concept).
2. High-Level Architecture
mermaid
Copy
Edit
flowchart LR
    subgraph Client Side
        A[Web Chat UI<br>(React)] --> B[Minimal Chat Logic]
    end

    B --> C[Chatbot Orchestrator<br>(Node.js/Express)]
    C --> D[OpenRouter<br>(GPT-4o-mini)]
    C --> E[Supabase<br>(Prototype DB/Auth)]
    C --> F[Bank API Simulator<br>(Node.js/Express)]
Web Chat UI (React): Renders a simple chat interface.
Minimal Chat Logic: Sends user messages to the Chatbot Orchestrator, displays the response.
Chatbot Orchestrator (Node.js/Express): The central “brain” that handles conversation flow, calls the LLM (OpenRouter), interacts with Supabase, and queries the Bank Simulator for banking data.
OpenRouter (LLM - GPT-4o-mini): Used for NLU (interpreting user requests) and generating natural language responses.
Supabase: Stores minimal user session data, conversation logs, and possibly references to user records.
Bank API Simulator: Provides mock endpoints for login, balance inquiry, address update, etc.
3. Main Components & Decisions
3.1 Frontend (React)
Implementation: A single-page app with a chat window.
Logic:
Connect to the Orchestrator via REST or WebSocket (for simplicity, we’ll use REST POST requests).
No local conversation state beyond the current chat text.
Why React: Easy to stand up quickly, abundant examples, and can integrate with any Node.js server.
3.2 Chatbot Orchestrator (Node.js/Express)
Responsibilities:
Parse user message → Decide if it’s a login attempt, a balance check, etc.
Call OpenRouter with a prompt:
Provide relevant context (e.g., last few user messages, current state).
Manage Session: Track if the user is authenticated (store a short-lived token or state in Supabase).
Call Bank API Simulator: For actual banking data.
Simplifications:
Minimal error handling (return a 400 with a generic message if something fails).
Session token stored in memory or Supabase (no advanced encryption or RLS).
3.3 OpenRouter (GPT-4o-mini)
Usage:
The Orchestrator sends each user message + context to GPT-4o-mini.
GPT-4o-mini returns a natural language response or an “action directive” (like “User wants balance info”).
The Orchestrator then merges actual bank data (from the simulator) into the final message.
Prompt Strategy:
Keep it simple: Send the last few user messages plus a short instruction (“You are a banking assistant…”).
No chain-of-thought or advanced prompting—just enough to handle basic queries.
3.4 Supabase
Purpose:
Store conversation transcripts and user session info.
Optionally store “prototype” user records (username, hashed password, etc.) if we don’t rely solely on the Bank Simulator for login.
Simplifications:
No row-level security or multi-tenant complexity.
A single table for sessions (id, user_id, token, etc.) and one for conversation logs (id, user_id, message, timestamp).
3.5 Bank API Simulator (Node.js/Express)
Endpoints (examples):
POST /login → checks (accountNumber, onlineCode). Returns a mock success or failure.
GET /accounts/:accountId/balance → returns a hardcoded or dynamically updated balance.
PUT /customer/profile → updates address.
Data:
Hardcoded arrays or JSON objects in memory for quick iteration.
Simplifications:
No real logic for locking accounts, no concurrency handling.
Just returns success/failure stubs with minimal validation.
4. Key Flows
4.1 Authentication Flow (Simplified)
User: “Hello, I need to check my balance.”
Orchestrator: If the session is not authenticated, prompts for account number + code.
User: Provides credentials.
Orchestrator:
Calls Bank API Simulator’s /login endpoint.
If valid: Mark user as authenticated (store token in memory or Supabase).
If invalid: “Credentials do not match our records. Try again?”
4.2 Balance Inquiry
User: “Show me my balance” (now authenticated).
Orchestrator:
Possibly calls OpenRouter to confirm user intent → “Balance Inquiry.”
Calls Bank API Simulator: GET /accounts/{accountId}/balance.
Receives the balance.
Returns a final response to the user: “Your balance is $X.”
4.3 Optional: Address Update
User: “I need to update my address.”
Orchestrator:
Calls OpenRouter to interpret → “Address Update.”
Asks user for new address info.
User: Provides new address.
Orchestrator:
Calls PUT /customer/profile on Bank API Simulator.
Returns success or error message to the user.
5. Data Model (Prototype)
Supabase Tables
sessions

id: UUID
userId: string (or integer)
token: string
isAuthenticated: boolean
createdAt: timestamp
conversation_logs

id: UUID
userId: string
message: text
role: enum(“user”, “assistant”)
timestamp: timestamp
(Feel free to store additional fields if needed, or skip entirely if you only want in-memory logs for now.)

6. Security & Privacy (Prototype-Level)
Transport: Use HTTPS in deployment, but in local dev, HTTP is acceptable.
Data in Supabase: Minimal. We store session tokens, not real PII or real account numbers.
No Detailed PII: The “bank data” is mock. No compliance needed for this prototype.
LLM Data Sharing: We only pass minimal conversation text to OpenRouter. If a user enters personal info, it might be in logs (not recommended for real production).
7. Error Handling & Logging
Approach:
If a Bank API call fails, the Orchestrator returns a generic “Sorry, something went wrong” message.
Log the error to the server console or a simple error table in Supabase.
Retry Logic:
None for this prototype. If something fails, the user can just try again manually.
8. Performance & Scalability (Prototype)
Single Instance:
Run the Orchestrator, Bank Simulator, and Supabase in minimal dev plans or local Docker containers.
No load balancing.
Caching:
None. We’ll call the Bank Simulator on each request.
LLM Cost:
We’ll just keep usage low by limiting the conversation or using a small model (GPT-4o-mini).
9. Deployment & CI/CD (Prototype)
Local / Simple Hosting:
Node.js apps (Orchestrator, Bank Simulator) can be run on a single VM or container.
Supabase → sign up for a free or low-tier plan.
No strict CI/CD. Possibly just GitHub Actions to build/test.
10. Next Steps & Future Enhancements
Security Hardening: Add secure token storage, advanced user auth, RLS in Supabase, etc.
Scaling: Container orchestration, auto-scaling, caching layers, etc.
Rich NLU: More advanced prompt engineering or custom NLU flows for complex queries.
Error Recovery: More robust fallback flows and conversation reentry points.
Analytics: Track conversation metrics to refine user experience.

We propose three core tables:

customers
Stores the personal details for each customer.
accounts
Associates one or more bank accounts to a single customer.
transactions
Records individual debits/credits (e.g., deposits, withdrawals, purchases) against a specific account.
1. Table: customers
Column	Type	Description
customer_id	UUID (PK)	Primary key (unique identifier for the customer).
first_name	VARCHAR	Customer’s first name.
last_name	VARCHAR	Customer’s last name.
address_line1	VARCHAR	Address line 1.
address_line2	VARCHAR (NULL)	Address line 2 (optional).
city	VARCHAR	City.
state	VARCHAR	State or province.
postal_code	VARCHAR	Postal/ZIP code.
phone	VARCHAR	Phone number.
email	VARCHAR	Email address.
created_at	TIMESTAMP	Timestamp when record was created.
updated_at	TIMESTAMP	Timestamp when record was last updated.
Notes

You may choose to store phone in a normalized phone format or keep it as a simple string for the prototype.
customer_id can be an auto-increment integer instead of a UUID, depending on your preference.
2. Table: accounts
Column	Type	Description
account_id	UUID (PK)	Primary key (unique identifier for the account).
account_number	VARCHAR (Unique)	User-facing or bank-facing account number (e.g., "CHK-12345").
customer_id	UUID (FK)	References customers.customer_id to link account to a specific customer.
account_type	VARCHAR	Enum or text field (e.g., "checking", "savings", "credit-card").
balance	DECIMAL(12,2)	Current balance (positive for assets, negative for credit card debt, if desired).
currency	VARCHAR	Currency code, e.g., "USD".
created_at	TIMESTAMP	Timestamp when record was created.
updated_at	TIMESTAMP	Timestamp when record was last updated.
Notes

If you want to handle credit limits (for credit cards), you could add a column like credit_limit DECIMAL(12,2).
account_number is often unique per bank. For the prototype, you can just treat it as a string.
3. Table: transactions
Column	Type	Description
transaction_id	UUID (PK)	Primary key for each transaction record.
account_id	UUID (FK)	References accounts.account_id, indicating which account this transaction belongs to.
transaction_date	TIMESTAMP	The date/time the transaction occurred (not just when it was recorded).
transaction_type	VARCHAR	Enum or text (e.g., "deposit", "withdrawal", "purchase", "payment", etc.).
description	VARCHAR	Short description or memo (e.g., "ATM Withdrawal", "Online Shopping").
amount	DECIMAL(12,2)	Amount of the transaction (positive for deposits, negative for withdrawals, or vice versa if you prefer).
balance_after	DECIMAL(12,2)	Balance of the account immediately after this transaction (optional but helpful for quick lookup).
created_at	TIMESTAMP	Timestamp when this transaction record was created in the system.
updated_at	TIMESTAMP	Timestamp when it was last updated.
Notes

transaction_type can be a simple text field. You can also break it down further if you need more detail (e.g., separate columns for category, subtype, etc.).
balance_after is optional—some designs choose to derive the balance by summing all transactions to date. However, storing balance_after can speed up queries in a prototype.
Relationship Diagram (Simplified)
mermaid
Copy
Edit
erDiagram
    CUSTOMERS ||--|{ ACCOUNTS : has
    ACCOUNTS ||--|{ TRANSACTIONS : has

    CUSTOMERS {
        UUID customer_id PK
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR address_line1
        VARCHAR address_line2
        VARCHAR city
        VARCHAR state
        VARCHAR postal_code
        VARCHAR phone
        VARCHAR email
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    ACCOUNTS {
        UUID account_id PK
        VARCHAR account_number
        UUID customer_id FK
        VARCHAR account_type
        DECIMAL(12,2) balance
        VARCHAR currency
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    TRANSACTIONS {
        UUID transaction_id PK
        UUID account_id FK
        TIMESTAMP transaction_date
        VARCHAR transaction_type
        VARCHAR description
        DECIMAL(12,2) amount
        DECIMAL(12,2) balance_after
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }