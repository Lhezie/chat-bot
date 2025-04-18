'use client';
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
      const res = await fetch('http://localhost:3020/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: input, sessionId }),
      });

      const data = await res.json();

      // If reply includes Paystack link
      const urlMatch = data.reply.match(/https:\/\/checkout\.paystack\.com\/[^\s]+/);
      if (urlMatch) {
        const payUrl = urlMatch[0];
        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            text: `Order placed! Total: ₦7500\nClick below to pay:`,
            payUrl,
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { from: 'bot', text: data.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { from: 'bot', text: '❌ Error talking to the server' }]);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '350px',
        background: '#f0f0f0',
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        height: '500px',
      }}
    >
      <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>💬 LeezieBite Chat</h3>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: '#e5ddd5',
          borderRadius: '10px',
          marginBottom: '10px',
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '10px 14px',
                borderRadius: '16px',
                backgroundColor: msg.from === 'user' ? '#dcf8c6' : '#ffffff',
                color: '#111',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.text}
              {msg.payUrl && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <a
                    href={msg.payUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#0aa83f',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      display: 'inline-block',
                    }}
                  >
                    Pay Now
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={input}
          placeholder="Type a command like 1, 2, 99..."
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '20px',
            border: '1px solid #ccc',
            outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: '8px',
            padding: '8px 12px',
            backgroundColor: '#25D366',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
