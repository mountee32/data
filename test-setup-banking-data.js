const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://trtjucrqcjapcvfgsbdd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydGp1Y3JxY2phcGN2ZmdzYmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzMyMzksImV4cCI6MjA1MzY0OTIzOX0.bzkf_w0IG7hYNmo2TKjTO5MSSrWC6h4U0RDy7UI4zqE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Read SQL file content
const fs = require('fs');
const sqlContent = fs.readFileSync('setup-banking-tables.sql', 'utf8');

async function setupBankingData() {
  console.log('\nPopulating banking data in Supabase...');

  // Verify we can access the tables
  console.log('\nVerifying table access...');
  try {
    const { data: accountsCheck, error: accountsError } = await supabase
      .from('accounts')
      .select('count');
    
    if (accountsError) throw accountsError;
    console.log('✓ Tables accessible');
  } catch (error) {
    console.error('Error accessing tables:', error.message);
    console.error('Please create the tables using setup-banking-tables.sql in Supabase SQL editor first');
    return;
  }

  // Insert test accounts
  console.log('\nInserting test accounts...');
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .insert([
      {
        customer_id: '1234567890',
        account_type: 'CHECKING',
        balance: 1500.00,
        currency: 'USD'
      },
      {
        customer_id: '1234567890',
        account_type: 'SAVINGS',
        balance: 5000.00,
        currency: 'USD'
      },
      {
        customer_id: '0987654321',
        account_type: 'CHECKING',
        balance: 2500.00,
        currency: 'USD'
      }
    ])
    .select();

  if (accountsError) {
    console.error('Failed to insert accounts:', accountsError);
    return;
  }
  console.log('✓ Test accounts inserted:', accounts);

  // Insert test transactions
  console.log('\nInserting test transactions...');
  const checkingAccount = accounts.find(a => a.customer_id === '1234567890' && a.account_type === 'CHECKING');
  
  const { error: transactionsError } = await supabase
    .from('transactions')
    .insert([
      {
        account_id: checkingAccount.id,
        transaction_type: 'DEPOSIT',
        amount: 1000.00,
        description: 'Payroll deposit'
      },
      {
        account_id: checkingAccount.id,
        transaction_type: 'WITHDRAWAL',
        amount: -50.00,
        description: 'ATM withdrawal'
      },
      {
        account_id: checkingAccount.id,
        transaction_type: 'PAYMENT',
        amount: -120.00,
        description: 'Electric bill payment'
      },
      {
        account_id: checkingAccount.id,
        transaction_type: 'DEPOSIT',
        amount: 200.00,
        description: 'Transfer from savings'
      }
    ]);

  if (transactionsError) {
    console.error('Failed to insert transactions:', transactionsError);
    return;
  }
  console.log('✓ Test transactions inserted');

  // Verify data
  console.log('\nVerifying data...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('accounts')
    .select(`
      *,
      transactions (*)
    `)
    .eq('customer_id', '1234567890');

  if (verifyError) {
    console.error('Failed to verify data:', verifyError);
    return;
  }

  console.log('Data verification:');
  verifyData.forEach(account => {
    console.log(`\nAccount: ${account.account_type}`);
    console.log(`Balance: $${account.balance}`);
    if (account.transactions) {
      console.log('Recent transactions:');
      account.transactions.forEach(tx => {
        console.log(`- ${tx.description}: $${tx.amount}`);
      });
    }
  });
}

// Run the setup
setupBankingData().catch(console.error);