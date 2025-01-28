require('dotenv').config();
const chat = require('./chat');
const db = require('./db');

// Verify environment
console.log('Environment Check:');
console.log('- OpenRouter API Key:', process.env.OPENROUTER_API_KEY ? 'Present' : 'Missing');
console.log('- Working Directory:', process.cwd());
console.log('');

async function testChatIntegration() {
    const customerId = '1234567890';  // Known test customer ID with accounts
    const sessionId = `test_${Date.now()}`;

    try {
        console.log('\n=== Testing Chat Integration ===\n');

        // Test 1: Basic greeting
        console.log('Test 1: Basic greeting');
        const greeting = await chat.handleMessage(
            customerId,
            "Hi, I need help with my banking",
            sessionId
        );
        console.log('Response:', greeting.response);
        console.log('Metrics:', greeting.metrics);
        console.log('\n---\n');

        // Test 2: Balance inquiry
        console.log('Test 2: Balance inquiry');
        const balance = await chat.handleMessage(
            customerId,
            "What's my current balance?",
            sessionId
        );
        console.log('Response:', balance.response);
        console.log('Metrics:', balance.metrics);
        console.log('\n---\n');

        // Test 3: Transaction history
        console.log('Test 3: Transaction history');
        const transactions = await chat.handleMessage(
            customerId,
            "Show me my recent transactions",
            sessionId
        );
        console.log('Response:', transactions.response);
        console.log('Metrics:', transactions.metrics);
        console.log('\n---\n');

        // Test 4: Context-aware follow-up
        console.log('Test 4: Context-aware follow-up');
        const followup = await chat.handleMessage(
            customerId,
            "Which one was the most recent?",
            sessionId
        );
        console.log('Response:', followup.response);
        console.log('Metrics:', followup.metrics);
        console.log('\n---\n');

        // Test 5: Error handling
        console.log('Test 5: Error handling');
        const error = await chat.handleMessage(
            'INVALID-ID',
            "What's my balance?",
            sessionId
        );
        console.log('Response:', error.response);
        console.log('Success:', error.success);
        console.log('\n---\n');

        // Get conversation history
        console.log('Conversation History:');
        const history = await chat.getHistory(sessionId);
        console.log(JSON.stringify(history, null, 2));

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run tests
console.log('Starting chat integration tests...');
testChatIntegration().then(() => {
    console.log('\nTests completed');
    process.exit(0);
}).catch(error => {
    console.error('Tests failed:', error);
    process.exit(1);
});