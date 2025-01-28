const db = require('./db');
const openRouter = require('./openrouter');

class ChatHandler {
    constructor() {
        this.BANK_SIMULATOR_URL = 'http://localhost:3001';
    }

    // Process incoming chat message
    async handleMessage(customerId, message, sessionId = null) {
        try {
            // Create a unique session ID if not provided
            sessionId = sessionId || `chat_${Date.now()}`;

            // Get conversation history for context
            const history = await this.getHistory(sessionId);
            // Get customer accounts for context
            const accounts = await db.getCustomerAccounts(customerId);
            
            const context = {
                customerId,
                history: history.success ? history.messages : [],
                sessionId,
                accounts
            };

            // Store user message
            await db.storeMessage(sessionId, customerId, message, false);

            // Generate response using OpenRouter
            const { response, metrics } = await this.generateResponse(context, message);

            // Store bot response
            await db.storeMessage(sessionId, customerId, response, true);

            // Store metrics
            await this.storeMetrics(sessionId, metrics);

            return {
                success: true,
                response,
                metrics
            };
        } catch (error) {
            console.error('Chat handling error:', error);
            return {
                success: false,
                error: 'Failed to process message'
            };
        }
    }

    // Generate response using OpenRouter
    async generateResponse(context, message) {
        try {
            // Get LLM response
            const llmResponse = await openRouter.generateResponse(context, message);
            
            // Extract banking action
            const bankingAction = openRouter.extractBankingAction(llmResponse.content);
            
            // Handle banking actions
            let finalResponse = llmResponse.content;
            if (bankingAction.action !== 'none') {
                const bankingData = await this.executeBankingAction(
                    context.customerId,
                    bankingAction
                );
                if (bankingData) {
                    finalResponse = this.formatBankingResponse(
                        bankingAction.action,
                        bankingData,
                        llmResponse.content
                    );
                }
            }

            return {
                response: finalResponse,
                metrics: llmResponse.metrics
            };
        } catch (error) {
            console.error('Response generation error:', error);
            throw error;
        }
    }

    // Execute banking action
    async executeBankingAction(customerId, action) {
        try {
            switch (action.action) {
                case 'balance':
                    const accounts = await db.getCustomerAccounts(customerId);
                    if (!accounts || accounts.length === 0) return null;
                    return {
                        type: 'balance',
                        data: accounts.map(account => ({
                            type: account.account_type,
                            currency: account.currency,
                            balance: account.balance
                        }))
                    };

                case 'transactions':
                    const transactions = await db.getAccountTransactions(customerId);
                    if (!transactions || transactions.length === 0) return null;
                    return {
                        type: 'transactions',
                        data: transactions.map(tx => ({
                            date: tx.created_at.split(' ')[0],
                            description: tx.description,
                            amount: tx.amount
                        }))
                    };

                default:
                    return null;
            }
        } catch (error) {
            console.error('Banking action error:', error);
            return null;
        }
    }

    // Format banking response
    formatBankingResponse(action, data, llmResponse) {
        if (!data) return llmResponse;

        let formattedData = '';
        if (data.type === 'balance') {
            formattedData = data.data.map(account =>
                `${account.type}: ${account.currency} ${account.balance.toFixed(2)}`
            ).join('\n');
        } else if (data.type === 'transactions') {
            formattedData = data.data.map(tx =>
                `${tx.date}: ${tx.description} (${tx.amount > 0 ? '+' : ''}${tx.amount})`
            ).join('\n');
        }

        return `${llmResponse}\n\n${formattedData}`;
    }

    // Store metrics
    async storeMetrics(sessionId, metrics) {
        try {
            // TODO: Implement metrics storage
            console.log('Chat metrics:', {
                sessionId,
                ...metrics,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to store metrics:', error);
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