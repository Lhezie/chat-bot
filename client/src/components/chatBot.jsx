// 'use client';
// import React, { useState } from 'react';

// const ChatBot = () => {
//   const [messages, setMessages] = useState([
//     { from: 'bot', text: 'Welcome to LeezieBite! Type "1" to view the menu 🍽️' },
//   ]);
//   const [input, setInput] = useState('');
//   const sessionId = 'react-user-123';

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const newMessages = [...messages, { from: 'user', text: input }];
//     setMessages(newMessages);
//     setInput('');

//     try {
//       const res = await fetch('http://localhost:3020/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({ message: input, sessionId }),
//       });

//       const data = await res.json();

//       // If reply includes Paystack link
//       const urlMatch = data.reply.match(/https:\/\/checkout\.paystack\.com\/[^\s]+/);
//       if (urlMatch) {
//         const payUrl = urlMatch[0];
//         setMessages((prev) => [
//           ...prev,
//           {
//             from: 'bot',
//             text: `Order placed! Total: ₦7500\nClick below to pay:`,
//             payUrl,
//           },
//         ]);
//       } else {
//         setMessages((prev) => [...prev, { from: 'bot', text: data.reply }]);
//       }
//     } catch (err) {
//       setMessages((prev) => [...prev, { from: 'bot', text: '❌ Error talking to the server' }]);
//     }
//   };

//   return (
//     <div
//       style={{
//         position: 'fixed',
//         bottom: '20px',
//         right: '20px',
//         width: '350px',
//         background: '#f0f0f0',
//         padding: '1rem',
//         borderRadius: '12px',
//         boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
//         fontFamily: 'sans-serif',
//         display: 'flex',
//         flexDirection: 'column',
//         height: '500px',
//       }}
//     >
//       <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>💬 LeezieBite Chat</h3>

//       <div
//         style={{
//           flex: 1,
//           overflowY: 'auto',
//           padding: '10px',
//           backgroundColor: '#e5ddd5',
//           borderRadius: '10px',
//           marginBottom: '10px',
//         }}
//       >
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             style={{
//               display: 'flex',
//               justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
//               marginBottom: '8px',
//             }}
//           >
//             <div
//               style={{
//                 maxWidth: '70%',
//                 padding: '10px 14px',
//                 borderRadius: '16px',
//                 backgroundColor: msg.from === 'user' ? '#dcf8c6' : '#ffffff',
//                 color: '#111',
//                 fontSize: '14px',
//                 whiteSpace: 'pre-wrap',
//               }}
//             >
//               {msg.text}
//               {msg.payUrl && (
//                 <div style={{ marginTop: '10px', textAlign: 'center' }}>
//                   <a
//                     href={msg.payUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style={{
//                       backgroundColor: '#0aa83f',
//                       color: '#fff',
//                       textDecoration: 'none',
//                       padding: '8px 16px',
//                       borderRadius: '20px',
//                       display: 'inline-block',
//                     }}
//                   >
//                     Pay Now
//                   </a>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div style={{ display: 'flex', alignItems: 'center' }}>
//         <input
//           type="text"
//           value={input}
//           placeholder="Type a command like 1, 2, 99..."
//           onChange={(e) => setInput(e.target.value)}
//           onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//           style={{
//             flex: 1,
//             padding: '10px',
//             borderRadius: '20px',
//             border: '1px solid #ccc',
//             outline: 'none',
//           }}
//         />
//         <button
//           onClick={sendMessage}
//           style={{
//             marginLeft: '8px',
//             padding: '8px 12px',
//             backgroundColor: '#25D366',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '50%',
//             cursor: 'pointer',
//           }}
//         >
//           ➤
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatBot;




'use client';
import React, { useState } from 'react';

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome to LeezieBite! \n Type 1 to view the menu 🍽️' },
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

      if (data.reply.includes('https://checkout.paystack.com')) {
        const amount = 750000;
        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            text: `Order placed! Click below to pay:`,
            isPaystack: true,
            amount,
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { from: 'bot', text: data.reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { from: 'bot', text: 'Error talking to server' }]);
    }
  };

  const handlePaystack = (amount) => {
    const handler = window.PaystackPop && window.PaystackPop.setup({
      key: 'pk_test_74bc384aaa2695a4a20f011e6f0e3b50ff530a9c', // your real key here
      email: 'user@example.com',
      amount,
      currency: 'NGN',
      callback: (response) => {
        window.location.href = '/payment-success';
      },
    });

    if (handler) handler.openIframe();
  };

  return (
    <>
      <script src="https://js.paystack.co/v1/inline.js"></script>

      {/* Minimized button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: '97px',
            right: '55px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#e63946',
            color: 'white',
            fontSize: '28px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
          }}
        >
          💬
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '93px',
            right: '50px',
            width: '360px',
            height: '500px',
            background: '#f8f8f8',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              backgroundColor: '#075E54',
              color: 'white',
              padding: '12px',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>💬 LeezieBite </span>
            <span onClick={() => setOpen(false)} style={{ cursor: 'pointer' }}>✖</span>
          </div>

          <div
            style={{
              flex: 1,
              padding: '10px',
              overflowY: 'auto',
              backgroundColor: '#ece5dd',
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.from === 'user' ? '#dcf8c6' : '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    maxWidth: '75%',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text}
                  {msg.isPaystack && (
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <button
                        style={{
                          backgroundColor: '#0aa83f',
                          color: 'white',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '18px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handlePaystack(msg.amount)}
                      >
                        Pay Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', padding: '10px', backgroundColor: '#fff' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '20px',
                border: '1px solid #ccc',
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: '10px',
                backgroundColor: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                padding: '8px 12px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

