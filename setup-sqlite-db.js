const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Ensure db directory exists
const DB_DIR = path.join(__dirname, 'db');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}

const DB_PATH = path.join(DB_DIR, 'banking.db');
const db = new sqlite3.Database(DB_PATH);

// Convert Supabase SQL to SQLite compatible SQL
const schema = `
  -- Enable foreign keys
  PRAGMA foreign_keys = ON;

  -- Create customers table
  CREATE TABLE IF NOT EXISTS customers (
    account_number TEXT PRIMARY KEY,
    online_banking_code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Create accounts table
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    account_type TEXT NOT NULL,
    balance DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(account_number)
  );

  -- Create transactions table
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );

  -- Create chat_history table
  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    customer_id TEXT,
    message TEXT NOT NULL,
    is_bot INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(account_number)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_accounts_customer_id ON accounts(customer_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
  CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);
`;

// Test data
const testData = {
  customers: [
    {
      account_number: '1234567890',
      online_banking_code: '123456'
    },
    {
      account_number: '0987654321',
      online_banking_code: '654321'
    }
  ],
  accounts: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      customer_id: '1234567890',
      account_type: 'CHECKING',
      balance: 1500.00,
      currency: 'USD'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      customer_id: '1234567890',
      account_type: 'SAVINGS',
      balance: 5000.00,
      currency: 'USD'
    }
  ],
  transactions: [
    {
      id: 'tx1',
      account_id: '11111111-1111-1111-1111-111111111111',
      transaction_type: 'DEPOSIT',
      amount: 1000.00,
      description: 'Payroll deposit'
    },
    {
      id: 'tx2',
      account_id: '11111111-1111-1111-1111-111111111111',
      transaction_type: 'WITHDRAWAL',
      amount: -50.00,
      description: 'ATM withdrawal'
    }
  ]
};

async function setupDatabase() {
  return new Promise((resolve, reject) => {
    console.log('Setting up SQLite database...');
    
    // Run all schema creation statements
    db.serialize(() => {
      db.exec(schema, (err) => {
        if (err) {
          console.error('Error creating schema:', err);
          reject(err);
          return;
        }
        console.log('✓ Schema created');

        // Insert test data
        console.log('\nInserting test data...');
        
        // Insert customers
        const customerStmt = db.prepare('INSERT OR REPLACE INTO customers (account_number, online_banking_code) VALUES (?, ?)');
        testData.customers.forEach(customer => {
          customerStmt.run(customer.account_number, customer.online_banking_code);
        });
        customerStmt.finalize();
        console.log('✓ Customers inserted');

        // Insert accounts
        const accountStmt = db.prepare('INSERT OR REPLACE INTO accounts (id, customer_id, account_type, balance, currency) VALUES (?, ?, ?, ?, ?)');
        testData.accounts.forEach(account => {
          accountStmt.run(account.id, account.customer_id, account.account_type, account.balance, account.currency);
        });
        accountStmt.finalize();
        console.log('✓ Accounts inserted');

        // Insert transactions
        const txStmt = db.prepare('INSERT OR REPLACE INTO transactions (id, account_id, transaction_type, amount, description) VALUES (?, ?, ?, ?, ?)');
        testData.transactions.forEach(tx => {
          txStmt.run(tx.id, tx.account_id, tx.transaction_type, tx.amount, tx.description);
        });
        txStmt.finalize();
        console.log('✓ Transactions inserted');

        // Verify data
        db.all('SELECT c.account_number, a.account_type, a.balance, COUNT(t.id) as tx_count FROM customers c LEFT JOIN accounts a ON c.account_number = a.customer_id LEFT JOIN transactions t ON t.account_id = a.id GROUP BY c.account_number, a.id', (err, rows) => {
          if (err) {
            console.error('Error verifying data:', err);
            reject(err);
            return;
          }
          
          console.log('\nData verification:');
          rows.forEach(row => {
            console.log(`Customer ${row.account_number}:`);
            console.log(`- ${row.account_type}: $${row.balance}`);
            console.log(`- Transactions: ${row.tx_count}`);
          });
          
          resolve();
        });
      });
    });
  });
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('\nDatabase setup complete!');
    db.close();
  })
  .catch(err => {
    console.error('Setup failed:', err);
    db.close();
  });