import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState({ accountNumber: '', code: '' });

  // Updated port for orchestrator
  const ORCHESTRATOR_URL = 'http://localhost:3003';
  const BANK_SIMULATOR_URL = 'http://localhost:3001';

  const handleAuth = (e) => {
    e.preventDefault();
    axios.post(`${BANK_SIMULATOR_URL}/auth/validate`, authData)
      .then(response => {
        if (response.data.valid) {
          setIsAuthenticated(true);
          addMessage('System', 'Authentication successful! How can I help you today?');
        }
      })
      .catch(error => {
        addMessage('System', 'Authentication failed. Please check your credentials.');
        console.error('Auth error:', error);
      });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    addMessage('User', inputMessage);
    const messageToSend = inputMessage;
    setInputMessage('');

    axios.post(`${ORCHESTRATOR_URL}/chat`, {
      message: messageToSend
    }, {
      headers: {
        'Authorization': `Bearer test_session_token`
      }
    })
    .then(response => {
      addMessage('Assistant', response.data.response);
    })
    .catch(error => {
      addMessage('System', 'Error processing your request');
      console.error('Chat error:', error);
    });
  };

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { text, isUser: sender === 'User' }]);
  };

  const renderAuthForm = () => (
    <div className="auth-container">
      <h2>Bank Authentication</h2>
      <form onSubmit={handleAuth}>
        <input
          type="text"
          placeholder="Account Number (TEST-123)"
          value={authData.accountNumber}
          onChange={(e) => setAuthData({...authData, accountNumber: e.target.value})}
        />
        <input
          type="password"
          placeholder="Online Code (0000)"
          value={authData.code}
          onChange={(e) => setAuthData({...authData, code: e.target.value})}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );

  const renderChatInterface = () => (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.isUser ? 'user' : ''}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask about your balance or recent transactions..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );

  return (
    <div className="app">
      {!isAuthenticated ? renderAuthForm() : renderChatInterface()}
    </div>
  );
}

export default App;