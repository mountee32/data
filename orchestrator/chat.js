const db = require('./db');
const axios = require('axios');

class ChatHandler {
    constructor() {
        this.BANK_SIMULATOR_URL = 'http://localhost:3001';
    }

    // Process incoming chat message
    async handleMessage(customerId, message, sessionId = null) {
        try {
            // Create a unique session ID if not provided
            sessionId = sessionId || `chat_${Date.now()}`;

            // Store user message
            await db.storeMessage(sessionId, customerId, message, false);

            // Process message and generate response
            const response = await this.generateResponse(customerId, message);

            // Store bot response
            await db.storeMessage(sessionId, customerId, response, true);

            return {
                success: true,
                response
            };
        } catch (error) {
            console.error('Chat handling error:', error);
            return {
                success: false,
                error: 'Failed to process message'
            };
        }
    }

    // Generate response based on message content
    async generateResponse(customerId, message) {
        const lowerMessage = message.toLowerCase();

        try {
            // Check balance
            if (lowerMessage.includes('balance')) {
                const accounts = await db.getCustomerAccounts(customerId);
                if (!accounts || accounts.length === 0) {
                    return "I couldn't find any accounts for you.";
                }

                // Format balance response
                const balances = accounts.map(account => 
                    `${account.account_type}: ${account.currency} ${account.balance.toFixed(2)}`
                ).join('\n');
                
                return `Here are your account balances:\n${balances}`;
            }

            // Check transactions
            if (lowerMessage.includes('transaction')) {
                const accounts = await db.getCustomerAccounts(customerId);
                if (!accounts || accounts.length === 0) {
                    return "I couldn't find any accounts for you.";
                }

                // Get transactions for first account (could be enhanced to specify account)
                const transactions = await db.getAccountTransactions(accounts[0].id);
                if (!transactions || transactions.length === 0) {
                    return "No recent transactions found.";
                }

                // Format transaction response
                const txList = transactions.map(tx =>
                    `${tx.created_at.split(' ')[0]}: ${tx.description} (${tx.amount > 0 ? '+' : ''}${tx.amount})`
                ).join('\n');

                return `Here are your recent transactions:\n${txList}`;
            }

            // Default response
            return "I can help you check your balance or view recent transactions. What would you like to know?";

        } catch (error) {
            console.error('Response generation error:', error);
            return "I'm sorry, I encountered an error processing your request.";
        }
    }

    // Get conversation history
    async getHistory(sessionId, limit = 5) {
        try {
            const messages = await db.getRecentMessages(sessionId, limit);
            return {
                success: true,
                messages: messages.map(msg => ({
                    message: msg.message,
                    isBot: msg.is_bot === 1,
                    timestamp: msg.created_at
                }))
            };
        } catch (error) {
            console.error('History retrieval error:', error);
            return {
                success: false,
                error: 'Failed to retrieve chat history'
            };
        }
    }
}

module.exports = new ChatHandler();