const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabase = createClient(
  'https://trtjucrqcjapcvfgsbdd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydGp1Y3JxY2phcGN2ZmdzYmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzMyMzksImV4cCI6MjA1MzY0OTIzOX0.bzkf_w0IG7hYNmo2TKjTO5MSSrWC6h4U0RDy7UI4zqE'
);

async function testCustomerValidation() {
  console.log('\nTesting Supabase customer validation...');

  // Test valid credentials
  const validAccount = '1234567890';
  const validCode = '123456';
  
  console.log(`\nTesting valid credentials:
Account: ${validAccount}
Code: ${validCode}`);

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('account_number', validAccount)
      .eq('online_banking_code', validCode)
      .single();

    if (error) throw error;

    if (data) {
      console.log('\n✓ Valid credentials found in database');
      console.log('Customer record:', data);
    } else {
      console.log('\n✗ No matching customer found');
    }
  } catch (error) {
    console.error('\n✗ Database query failed:', error.message);
  }

  // Test invalid credentials
  const invalidAccount = 'WRONG';
  const invalidCode = '999999';

  console.log(`\nTesting invalid credentials:
Account: ${invalidAccount}
Code: ${invalidCode}`);

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('account_number', invalidAccount)
      .eq('online_banking_code', invalidCode)
      .single();

    if (error && error.code === 'PGRST116') {
      console.log('\n✓ Invalid credentials correctly rejected');
    } else if (data) {
      console.log('\n✗ Error: Invalid credentials were accepted');
    }
  } catch (error) {
    if (error.code === 'PGRST116') {
      console.log('\n✓ Invalid credentials correctly rejected');
    } else {
      console.error('\n✗ Database query failed:', error.message);
    }
  }
}

// Run the tests
testCustomerValidation().catch(console.error);