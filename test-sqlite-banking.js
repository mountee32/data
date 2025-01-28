const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'banking.db');
const db = new sqlite3.Database(DB_PATH);

async function testBankingQueries() {
  console.log('Testing SQLite banking queries...\n');

  // Test 1: Authenticate customer
  console.log('Test 1: Customer Authentication');
  const validCredentials = {
    accountNumber: '1234567890',
    code: '123456'
  };

  try {
    const customer = await queryPromise(
      'SELECT * FROM customers WHERE account_number = ? AND online_banking_code = ?',
      [validCredentials.accountNumber, validCredentials.code]
    );

    if (customer) {
      console.log('✓ Valid credentials authenticated');
      console.log('Customer:', customer);
    } else {
      console.log('✗ Authentication failed');
    }
  } catch (err) {
    console.error('Authentication error:', err);
  }

  // Test 2: Get account balances
  console.log('\nTest 2: Account Balances');
  try {
    const accounts = await queryPromise(
      'SELECT account_type, balance, currency FROM accounts WHERE customer_id = ?',
      [validCredentials.accountNumber]
    );

    console.log('✓ Retrieved account balances:');
    accounts.forEach(account => {
      console.log(`- ${account.account_type}: ${account.currency} ${account.balance}`);
    });
  } catch (err) {
    console.error('Balance check error:', err);
  }

  // Test 3: Get recent transactions
  console.log('\nTest 3: Recent Transactions');
  try {
    const transactions = await queryPromise(`
      SELECT t.* 
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE a.customer_id = ?
      ORDER BY t.created_at DESC
      LIMIT 5
    `, [validCredentials.accountNumber]);

    console.log('✓ Retrieved recent transactions:');
    transactions.forEach(tx => {
      console.log(`- ${tx.transaction_type}: ${tx.amount} (${tx.description})`);
    });
  } catch (err) {
    console.error('Transaction check error:', err);
  }

  // Test 4: Store chat message
  console.log('\nTest 4: Chat History');
  try {
    const sessionId = 'test-session-123';
    await runPromise(
      'INSERT INTO chat_history (session_id, customer_id, message, is_bot) VALUES (?, ?, ?, ?)',
      [sessionId, validCredentials.accountNumber, 'What is my balance?', 0]
    );

    await runPromise(
      'INSERT INTO chat_history (session_id, customer_id, message, is_bot) VALUES (?, ?, ?, ?)',
      [sessionId, validCredentials.accountNumber, 'Your checking account balance is $1500.00', 1]
    );

    const messages = await queryPromise(
      'SELECT * FROM chat_history WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );

    console.log('✓ Retrieved chat history:');
    messages.forEach(msg => {
      const prefix = msg.is_bot ? 'Bot' : 'User';
      console.log(`- ${prefix}: ${msg.message}`);
    });
  } catch (err) {
    console.error('Chat history error:', err);
  }
}

// Helper function to promisify db.get/all
function queryPromise(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Helper function to promisify db.run
function runPromise(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Run tests
testBankingQueries()
  .then(() => {
    console.log('\nAll tests completed!');
    db.close();
  })
  .catch(err => {
    console.error('Test failed:', err);
    db.close();
  });