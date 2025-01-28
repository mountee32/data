const express = require('express');
const app = express();
app.use(express.json());

// Test data
const testAccount = {
  accountNumber: "TEST-123",
  code: "0000",
  balance: 1500.00,
  transactions: [
    { date: "2025-01-25", description: "ATM Deposit", amount: 500.00 },
    { date: "2025-01-26", description: "Online Payment", amount: -200.00 },
    { date: "2025-01-27", description: "Direct Deposit", amount: 1200.00 }
  ]
};

// Auth validation endpoint
app.post('/auth/validate', (req, res) => {
  const { accountNumber, code } = req.body;
  const isValid = accountNumber === testAccount.accountNumber && code === testAccount.code;
  res.json({ valid: isValid });
});

// Balance endpoint
app.get('/accounts/:id/balance', (req, res) => {
  res.json({ 
    balance: testAccount.balance,
    currency: "USD",
    lastUpdated: new Date().toISOString()
  });
});

// Transactions endpoint
app.get('/accounts/:id/transactions', (req, res) => {
  res.json({
    account: req.params.id,
    transactions: testAccount.transactions.slice(0, 5)
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Bank Simulator running on port ${PORT}`);
});