const chat = require('./chat');
const assert = require('assert').strict;

async function testChatHandler() {
    console.log('Testing Chat Handler...\n');

    try {
        const testCustomerId = '1234567890';

        // Test 1: Balance inquiry
        console.log('Test 1: Balance inquiry');
        const balanceResult = await chat.handleMessage(testCustomerId, 'What is my balance?');
        assert(balanceResult.success, 'Should successfully process balance inquiry');
        assert(balanceResult.response.includes('CHECKING: USD 1500.00'), 'Should show checking balance');
        assert(balanceResult.response.includes('SAVINGS: USD 5000.00'), 'Should show savings balance');
        console.log('✓ Balance inquiry successful');
        console.log('Response:', balanceResult.response);

        // Test 2: Transaction inquiry
        console.log('\nTest 2: Transaction inquiry');
        const txResult = await chat.handleMessage(testCustomerId, 'Show my transactions');
        assert(txResult.success, 'Should successfully process transaction inquiry');
        assert(txResult.response.includes('Payroll deposit'), 'Should show deposit');
        assert(txResult.response.includes('ATM withdrawal'), 'Should show withdrawal');
        console.log('✓ Transaction inquiry successful');
        console.log('Response:', txResult.response);

        // Test 3: Unknown command
        console.log('\nTest 3: Unknown command');
        const unknownResult = await chat.handleMessage(testCustomerId, 'Hello there');
        assert(unknownResult.success, 'Should successfully process unknown command');
        assert(unknownResult.response.includes('I can help you'), 'Should return help message');
        console.log('✓ Unknown command handled correctly');
        console.log('Response:', unknownResult.response);

        // Test 4: Chat history
        console.log('\nTest 4: Chat history');
        // Store the session ID from the first message for history lookup
        const sessionId = 'chat_' + Date.now();
        // Send a test message to ensure we have chat history
        await chat.handleMessage(testCustomerId, 'Test message for history');
        // Get chat history
        const history = await chat.getHistory(sessionId, 5);
        assert(history.success, 'Should successfully retrieve chat history');
        assert(Array.isArray(history.messages), 'Should return array of messages');
        assert(history.messages.length > 0, 'Should have stored messages');
        
        // Verify message structure
        const lastMessage = history.messages[0];
        assert('message' in lastMessage, 'Messages should have content');
        assert('isBot' in lastMessage, 'Messages should indicate sender');
        assert('timestamp' in lastMessage, 'Messages should have timestamp');
        console.log('✓ Chat history retrieved successfully');
        console.log('History:', history.messages);

        // Test 5: Invalid customer ID
        console.log('\nTest 5: Invalid customer ID');
        const invalidResult = await chat.handleMessage('invalid_id', 'What is my balance?');
        assert(invalidResult.success, 'Should handle invalid customer gracefully');
        assert(invalidResult.response.includes('couldn\'t find any accounts'), 'Should return appropriate error message');
        console.log('✓ Invalid customer handled correctly');
        console.log('Response:', invalidResult.response);

        console.log('\n✓ All chat handler tests passed!');
    } catch (error) {
        console.error('\n✗ Test failed:', error);
        throw error;
    }
}

// Run tests
testChatHandler().catch(console.error);