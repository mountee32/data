import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState({ accountNumber: '', code: '' });

  const API_BASE = 'http://localhost:3000';

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/auth/validate', authData);
      if (response.data.valid) {
        setIsAuthenticated(true);
        addMessage('System', 'Authentication successful! How can I help you today?');
      }
    } catch (error) {
      addMessage('System', 'Authentication failed. Please check your credentials.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessages = [...messages, { text: inputMessage, isUser: true }];
    setMessages(newMessages);
    setInputMessage('');

    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        message: inputMessage
      }, {
        headers: {
          Authorization: `Bearer test_session_token`
        }
      });
      
      addMessage('Assistant', response.data.response);
    } catch (error) {
      addMessage('System', 'Error processing your request');
    }
  };

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { text: `${sender}: ${text}`, isUser: sender === 'User' }]);
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        <div className="auth-container">
          <h2>Bank Authentication</h2>
          <form onSubmit={handleAuth}>
            <input
              type="text"
              placeholder="Account Number"
              value={authData.accountNumber}
              onChange={(e) => setAuthData({...authData, accountNumber: e.target.value})}
            />
            <input
              type="password"
              placeholder="Online Code"
              value={authData.code}
              onChange={(e) => setAuthData({...authData, code: e.target.value})}
            />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
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
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;