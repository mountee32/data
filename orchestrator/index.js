const express = require('express');
const app = express();
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Enable OPTIONS for all routes (helps with endpoint detection)
app.options('*', cors());

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Supabase configuration
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// OpenRouter configuration
const openRouterConfig = {
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
};

// Bank Simulator URL
const BANK_SIMULATOR_URL = 'http://localhost:3001';

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing authentication token' });

  // For prototype, accept test token
  if (token === 'test_session_token') {
    req.session = { user_id: 'test_user' };
    return next();
  }
  
  // Check if token starts with our session prefix
  if (token.startsWith('session_')) {
    // Generate a UUID for the chat session
    const sessionId = '868fea98-700f-429d-b257-44df40f131f5';
    req.session = {
      user_id: 'TEST-123',
      session_id: sessionId
    };
    return next();
  }
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data?.is_valid) {
    return res.status(401).json({ error: 'Invalid session token' });
  }
  
  req.session = data;
  next();
};

// Authentication endpoint
app.post('/auth', async (req, res) => {
  try {
    const { accountNumber, code } = req.body;
    
    // Validate credentials with Supabase
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('account_number', accountNumber)
      .eq('online_banking_code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No matching customer found
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      console.error('Authentication error:', error.message);
      return res.status(500).json({ error: 'Authentication service unavailable' });
    }

    if (!customer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate session token (using a simple format for testing)
    const sessionToken = `session_${Date.now()}`;

    // Store session in Supabase
    await supabase
      .from('sessions')
      .insert({
        token: sessionToken,
        user_id: accountNumber,
        is_valid: true
      });

    res.json({ token: sessionToken });
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
    
    // Log error
    await supabase
      .from('error_logs')
      .insert({
        error_message: error.message,
        stack_trace: error.stack
      });
  }
});

// Core chat handler
app.post('/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    
    let finalResponse;

    // For testing, directly handle balance and transaction requests
    if (message.toLowerCase().includes('balance')) {
      try {
        const balanceResponse = await axios.get(`${BANK_SIMULATOR_URL}/accounts/TEST-123/balance`);
        finalResponse = `Your current balance is $${balanceResponse.data.balance}`;
      } catch (error) {
        console.error('Balance check error:', error);
        finalResponse = "Sorry, I couldn't retrieve your balance at the moment.";
      }
    } else if (message.toLowerCase().includes('transaction')) {
      try {
        const txResponse = await axios.get(`${BANK_SIMULATOR_URL}/accounts/TEST-123/transactions`);
        const transactions = txResponse.data.transactions
          .map(tx => `${tx.date}: ${tx.description} ($${tx.amount})`)
          .join('\n');
        finalResponse = `Here are your recent transactions:\n${transactions}`;
      } catch (error) {
        console.error('Transaction check error:', error);
        finalResponse = "Sorry, I couldn't retrieve your transactions at the moment.";
      }
    }

    // Default response if no specific command recognized
    if (!finalResponse) {
      finalResponse = "I can help you check your balance or view recent transactions. What would you like to know?";
    }

    // Log conversation in chat_history
    try {
      // Insert user message
      await supabase
        .from('chat_history')
        .insert({
          session_id: req.session.session_id,
          customer_id: req.session.user_id,
          message: message,
          is_bot: false
        });

      // Insert bot response
      await supabase
        .from('chat_history')
        .insert({
          session_id: req.session.session_id,
          customer_id: req.session.user_id,
          message: finalResponse,
          is_bot: true
        });
    } catch (logError) {
      console.error('Failed to log conversation:', logError);
      // Continue anyway as this isn't critical
    }

    res.json({ response: finalResponse });

  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Failed to process message';
    res.status(500).json({ error: errorMessage });
    
    try {
      await supabase
        .from('error_logs')
        .insert({
          user_id: req.session?.user_id,
          error_message: error.message,
          stack_trace: error.stack
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Orchestrator running on port ${PORT}`);
});
