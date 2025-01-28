require('dotenv').config();
const chat = require('./chat');
const db = require('./db');

// Test configuration
const DETAILED_MODE = process.argv.includes('--detailed');
const customerId = '1234567890';  // Known test customer ID with accounts

async function testChatIntegration() {
    const sessionId = `test_${Date.now()}`;

    try {
        console.log('\n=== Testing Chat Integration ===\n');

        // Test 1: Basic greeting
        logTestStart('Test 1: Basic greeting');
        const greeting = await chat.handleMessage(
            customerId,
            "Hi, I need help with my banking",
            sessionId
        );
        logResponse(greeting);

        // Test 2: Balance inquiry
        logTestStart('Test 2: Balance inquiry');
        const balance = await chat.handleMessage(
            customerId,
            "What's my current balance?",
            sessionId
        );
        logResponse(balance);

        // Test 3: Transaction history
        logTestStart('Test 3: Transaction history');
        const transactions = await chat.handleMessage(
            customerId,
            "Show me my recent transactions",
            sessionId
        );
        logResponse(transactions);

        // Test 4: Context-aware follow-up
        logTestStart('Test 4: Context-aware follow-up');
        const followup = await chat.handleMessage(
            customerId,
            "Which one was the most recent?",
            sessionId
        );
        logResponse(followup);

        // Test 5: Error handling
        logTestStart('Test 5: Error handling');
        const error = await chat.handleMessage(
            'INVALID-ID',
            "What's my balance?",
            sessionId
        );
        logResponse(error);

        // Test 6: Full conversation flow
        logTestStart('Test 6: Full conversation flow');
        const conversationFlow = await runConversationFlow();
        logResponse({
            responses: conversationFlow.map(r => r.response),
            ...(DETAILED_MODE ? { metrics: conversationFlow.map(r => r.metrics) } : {})
        });

        // Get conversation history
        if (DETAILED_MODE) {
            console.log('\nConversation History:');
            const history = await chat.getHistory(sessionId);
            console.log(JSON.stringify(history, null, 2));
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

async function runConversationFlow() {
    const flowSessionId = `flow_${Date.now()}`;
    const responses = [];

    const steps = [
        // Authentication flow
        "Hi, I need to access my account. My account number is 1234567890 and code is 123456",
        // Balance inquiry
        "Can you show me my account balances?",
        // Transaction history for specific account
        "Show me recent transactions for my checking account",
        // Follow-up question
        "When was the most recent deposit?"
    ];

    for (const message of steps) {
        const result = await chat.handleMessage(customerId, message, flowSessionId);
        responses.push({
            response: result.response,
            metrics: result.metrics
        });
    }

    return responses;
}

function logTestStart(title) {
    console.log(`\n=== ${title} ===`);
}

function logResponse(result) {
    if (DETAILED_MODE) {
        // Detailed mode - show all information
        if (result.metrics) {
            console.log('Response:', result.response);
            console.log('Metrics:', result.metrics);
            if (result.success !== undefined) {
                console.log('Success:', result.success);
            }
            console.log('\n---');
        } else if (Array.isArray(result.responses)) {
            // For conversation flow test
            console.log('\nConversation Flow:');
            result.responses.forEach((response, i) => {
                console.log(`\nStep ${i + 1}:`);
                console.log(`Bot: ${response}`);
            });
            if (result.metrics) {
                console.log('\nMetrics by step:');
                result.metrics.forEach((metric, i) => {
                    console.log(`\nStep ${i + 1} metrics:`, metric);
                });
            }
        }
    } else {
        // Summary mode - show only user/bot messages
        if (Array.isArray(result.responses)) {
            // For conversation flow test
            console.log('\nConversation Flow:');
            result.responses.forEach((response, i) => {
                console.log(`\nStep ${i + 1}:`);
                console.log(`Bot: ${response}`);
            });
        } else {
            // For single message tests
            const cleanResponse = result.response.replace(/\n\nCHECKING: USD.*SAVINGS: USD.*$/g, '');
            console.log(`Bot: ${cleanResponse}`);
        }
    }
}

// Run tests
console.log('Starting chat integration tests...');
console.log(`Mode: ${DETAILED_MODE ? 'Detailed' : 'Summary'}`);
testChatIntegration().then(() => {
    console.log('\nTests completed');
    process.exit(0);
}).catch(error => {
    console.error('Tests failed:', error);
    process.exit(1);
});