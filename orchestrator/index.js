const express = require('express');
const app = express();
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cors = require('cors');

app.use(express.json());
app.use(cors());

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

// Core chat handler
app.post('/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Get conversation context
    const { data: context } = await supabase
      .from('conversation_logs')
      .select('message, role')
      .eq('user_id', req.session.user_id)
      .order('timestamp', { ascending: false })
      .limit(3);

    // Call OpenRouter
    const llmResponse = await axios.post(
      `${openRouterConfig.baseURL}/chat/completions`,
      {
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a banking assistant. Help users check balances and view transactions.'
          },
          ...(context || []).map(m => ({ role: m.role, content: m.message })).reverse(),
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract intent and get bank data if needed
    const botResponse = llmResponse.data.choices[0].message.content;
    let finalResponse = botResponse;

    if (botResponse.toLowerCase().includes('balance')) {
      try {
        const balanceResponse = await axios.get(`${BANK_SIMULATOR_URL}/accounts/TEST-123/balance`);
        finalResponse = `Your current balance is $${balanceResponse.data.balance}`;
      } catch (error) {
        console.error('Balance check error:', error);
      }
    } else if (botResponse.toLowerCase().includes('transaction')) {
      try {
        const txResponse = await axios.get(`${BANK_SIMULATOR_URL}/accounts/TEST-123/transactions`);
        const transactions = txResponse.data.transactions
          .map(tx => `${tx.date}: ${tx.description} ($${tx.amount})`)
          .join('\n');
        finalResponse = `Here are your recent transactions:\n${transactions}`;
      } catch (error) {
        console.error('Transaction check error:', error);
      }
    }

    // Log conversation
    await supabase
      .from('conversation_logs')
      .insert([
        { user_id: req.session.user_id, message, role: 'user' },
        { user_id: req.session.user_id, message: finalResponse, role: 'assistant' }
      ]);

    res.json({ response: finalResponse });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
    
    // Log error
    await supabase
      .from('error_logs')
      .insert({
        user_id: req.session?.user_id,
        error_message: error.message,
        stack_trace: error.stack
      });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Orchestrator running on port ${PORT}`);
});
