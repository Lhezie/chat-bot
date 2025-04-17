'use client'
import React, { useState } from 'react';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome to LeezieBite! Type "1" to view the menu 🍽️' },
  ]);
  const [input, setInput] = useState('');
  const sessionId = 'react-user-123';

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('http://localhost:6000/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, sessionId }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { from: 'bot', text: data.reply }]);

      // If reply includes Paystack link, open it
      if (data.reply.includes('https://checkout.paystack.com')) {
        const urlMatch = data.reply.match(/https:\/\/checkout\.paystack\.com\/[^\s]+/);
        if (urlMatch) window.open(urlMatch[0], '_blank');
      }
    } catch (err) {
      setMessages((prev) => [...prev, { from: 'bot', text: '❌ Error talking to the server' }]);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'Arial' }}>
      <h2>💬 LeezieBite ChatBot</h2>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '1rem',
          minHeight: '200px',
          maxHeight: '400px',
          overflowY: 'auto',
          marginBottom: '1rem',
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.from === 'user' ? 'right' : 'left' }}>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>{msg.from === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
            </p>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={input}
        placeholder="Type a command like 1, 2, 99..."
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        style={{ width: '75%', padding: '10px' }}
      />
      <button onClick={sendMessage} className="bg-red-500" style={{ padding: '10px 20px', marginLeft: '10px' }}>
        Send
      </button>
    </div>
  );
};

export default ChatBot;
