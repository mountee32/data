require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class OpenRouterClient {
    constructor() {
        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error('OPENROUTER_API_KEY environment variable is not set');
        }

        this.API_KEY = process.env.OPENROUTER_API_KEY;
        this.API_URL = 'https://openrouter.ai/api/v1/chat/completions';
        this.MODEL = 'openai/gpt-4o-mini';
        
        // Load prompts from config file
        this.loadPrompts();
    }

    loadPrompts() {
        try {
            const configPath = path.join(__dirname, 'prompts.config.txt');
            const content = fs.readFileSync(configPath, 'utf8');
            
            // Split content by prompt identifier and store in prompts object
            const lines = content.split('\n');
            this.prompts = {};
            
            let currentPrompt = null;
            let currentContent = [];
            
            for (const line of lines) {
                if (line.startsWith('SYSTEM_PROMPT_') || line.startsWith('USER_PROMPT_')) {
                    // If we were building a previous prompt, save it
                    if (currentPrompt) {
                        this.prompts[currentPrompt] = currentContent.join('\n');
                        currentContent = [];
                    }
                    currentPrompt = line.trim();
                } else {
                    currentContent.push(line);
                }
            }
            
            // Save the last prompt
            if (currentPrompt) {
                this.prompts[currentPrompt] = currentContent.join('\n');
            }

        } catch (error) {
            console.error('Failed to load prompts config:', error);
            throw new Error('Failed to load prompts configuration');
        }
    }

    async generateResponse(context, message) {
        const startTime = Date.now();
        
        try {
            const messages = this.buildMessages(context, message);
            
            if (process.argv.includes('--detailed')) {
                console.log('Sending request to OpenRouter:', {
                    model: this.MODEL,
                    messageCount: messages.length
                });
            }

            const response = await axios.post(this.API_URL, {
                model: this.MODEL,
                messages: messages,
                temperature: 0.7,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            }, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'Banking Assistant',
                    'Content-Type': 'application/json'
                }
            });

            if (process.argv.includes('--detailed')) {
                console.log('OpenRouter response:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: response.data
                });
            }

            const endTime = Date.now();
            const metrics = {
                tokenUsage: response.data.usage?.total_tokens || 0,
                responseTime: endTime - startTime,
                completionQuality: response.data.choices?.[0]?.message?.content ?
                    this.assessCompletionQuality(response.data.choices[0].message.content) : 0
            };

            if (!response.data.choices?.[0]?.message?.content) {
                throw new Error('Invalid response format from OpenRouter');
            }

            return {
                content: response.data.choices[0].message.content,
                metrics
            };

        } catch (error) {
            const errorDetails = {
                status: error.status || error.response?.status,
                message: error.message,
                response: error.response,
                data: error.response?.data
            };
            console.error('OpenRouter API error details:', errorDetails);
            
            if (error.message.includes('401')) {
                throw new Error('OpenRouter API authentication failed. Please check your API key.');
            }
            
            if (error.response?.data?.error) {
                throw new Error(`OpenRouter API error: ${error.response.data.error.message}`);
            }
            
            throw new Error(`OpenRouter API error: ${error.message}`);
        }
    }

    buildMessages(context, message) {
        let systemPrompt = this.prompts['SYSTEM_PROMPT_BANKING_ASSISTANT'];
        
        if (!systemPrompt) {
            console.error('Banking assistant system prompt not found in config');
            throw new Error('Required system prompt not found in configuration');
        }

        // Add account context if available
        if (context.accounts) {
            systemPrompt += `\n\nAvailable accounts:`;
            context.accounts.forEach(account => {
                systemPrompt += `\n- ${account.account_type} (${account.currency})`;
            });
        }

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add conversation history for context
        if (context.history && context.history.length > 0) {
            context.history.forEach(msg => {
                messages.push({
                    role: msg.isBot ? 'assistant' : 'user',
                    content: msg.message
                });
            });
        }

        // Add current user message
        messages.push({ role: 'user', content: message });

        return messages;
    }

    assessCompletionQuality(response) {
        // Basic quality assessment based on response length and structure
        const quality = {
            length: response.length > 20 ? 1 : 0.5,
            structure: response.includes('\n') ? 1 : 0.8,
            relevance: this.containsBankingTerms(response) ? 1 : 0.7
        };

        return (quality.length + quality.structure + quality.relevance) / 3;
    }

    containsBankingTerms(text) {
        const bankingTerms = [
            'account', 'balance', 'transaction', 'payment',
            'transfer', 'deposit', 'withdraw', 'bank',
            'credit', 'debit', 'money', 'currency'
        ];

        const lowerText = text.toLowerCase();
        return bankingTerms.some(term => lowerText.includes(term));
    }

    extractBankingAction(response) {
        const lowerResponse = response.toLowerCase();
        
        // Extract banking action from response
        if (lowerResponse.includes('balance')) {
            return { action: 'balance' };
        }
        if (lowerResponse.includes('transaction')) {
            return { action: 'transactions' };
        }
        if (lowerResponse.includes('update') && lowerResponse.includes('contact')) {
            return { action: 'update_contact' };
        }

        return { action: 'none' };
    }
}

module.exports = new OpenRouterClient();