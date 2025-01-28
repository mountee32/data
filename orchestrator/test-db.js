const db = require('./db');
const assert = require('assert').strict;

async function testDatabaseOperations() {
    console.log('Testing database operations...\n');

    try {
        // Test 1: Validate credentials
        console.log('Test 1: Credential validation');
        const validCustomer = await db.validateCredentials('1234567890', '123456');
        assert(validCustomer, 'Valid credentials should return customer data');
        console.log('✓ Valid credentials accepted');

        const invalidCustomer = await db.validateCredentials('wrong', 'wrong');
        assert(!invalidCustomer, 'Invalid credentials should return null');
        console.log('✓ Invalid credentials rejected');

        // Test 2: Session management
        console.log('\nTest 2: Session management');
        const testToken = `test_${Date.now()}`;
        await db.createSession(testToken, validCustomer.account_number);
        console.log('✓ Session created');

        const session = await db.validateSession(testToken);
        assert(session.customer_id === validCustomer.account_number, 'Session validation should return customer ID');
        console.log('✓ Session validated');

        // Test 3: Chat history
        console.log('\nTest 3: Chat history');
        const testSessionId = `chat_${Date.now()}`;
        await db.storeMessage(testSessionId, validCustomer.account_number, 'Test user message', false);
        await db.storeMessage(testSessionId, validCustomer.account_number, 'Test bot response', true);
        console.log('✓ Messages stored');

        const messages = await db.getRecentMessages(testSessionId);
        assert(messages.length === 2, 'Should retrieve both messages');
        assert(messages[0].is_bot === 1, 'Last message should be bot response');
        console.log('✓ Messages retrieved correctly');

        // Test 4: Banking data
        console.log('\nTest 4: Banking data');
        const accounts = await db.getCustomerAccounts(validCustomer.account_number);
        assert(accounts.length > 0, 'Customer should have accounts');
        console.log('✓ Customer accounts retrieved');

        const transactions = await db.getAccountTransactions(accounts[0].id);
        assert(transactions.length > 0, 'Account should have transactions');
        console.log('✓ Account transactions retrieved');

        // Print some sample data
        console.log('\nSample data:');
        console.log('Customer:', validCustomer);
        console.log('Accounts:', accounts);
        console.log('Recent transactions:', transactions);
        console.log('Chat messages:', messages);

        console.log('\n✓ All database tests passed!');
    } catch (error) {
        console.error('\n✗ Test failed:', error);
        throw error;
    } finally {
        await db.close();
    }
}

// Run tests
testDatabaseOperations().catch(console.error);