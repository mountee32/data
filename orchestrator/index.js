const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

// Import our modules
const auth = require('./auth');
const chat = require('./chat');

app.use(express.json());
app.use(cors());

// Enable OPTIONS for all routes
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

// Authentication endpoint
app.post('/auth', async (req, res) => {
  const { accountNumber, code } = req.body;
  
  if (!accountNumber || !code) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const result = await auth.login(accountNumber, code);
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  res.json({ token: result.token });
});

// Chat endpoint
app.post('/chat', auth.middleware(), async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const result = await chat.handleMessage(req.customer.id, message);
  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json({ response: result.response });
});

// Chat history endpoint
app.get('/chat/history/:sessionId', auth.middleware(), async (req, res) => {
  const { sessionId } = req.params;
  const result = await chat.getHistory(sessionId);
  
  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json({ messages: result.messages });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Orchestrator running on port ${PORT}`);
});
