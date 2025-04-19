"use client";
import React, { useState } from "react";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Welcome to LeezieBite! \nType 1 to view the menu 🍽️",
    },
  ]);
  const [input, setInput] = useState("");
  const sessionId = "react-user-123";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await fetch("http://localhost:3020/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input, sessionId }),
      });

      const data = await res.json();

      // Check for Paystack link
      const urlMatch = data.reply.match(
        /https:\/\/checkout\.paystack\.com\/[^\s]+/
      );
      if (urlMatch) {
        const payUrl = urlMatch[0];
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: `Order placed!\nClick below to pay:`,
            payUrl,
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Error talking to server" },
      ]);
    }
  };

  return (
    <>
      <script src="https://js.paystack.co/v1/inline.js"></script>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: "97px",
            right: "55px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#e63946",
            color: "white",
            fontSize: "28px",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}
        >
          💬
        </button>
      )}

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "93px",
            right: "50px",
            width: "360px",
            height: "500px",
            background: "#f8f8f8",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              backgroundColor: "#e63946",
              color: "white",
              padding: "12px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>💬 LeezieBite</span>
            <span onClick={() => setOpen(false)} style={{ cursor: "pointer" }}>
              ✖
            </span>
          </div>

          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              backgroundColor: "#ece5dd",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.from === "user" ? "flex-end" : "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      msg.from === "user" ? "#dcf8c6" : "#ffffff",
                    padding: "10px 14px",
                    borderRadius: "16px",
                    maxWidth: "75%",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.text}
                  {msg.payUrl && (
                    <div style={{ marginTop: "10px", textAlign: "center" }}>
                      <p style={{ marginBottom: "8px", fontWeight: "bold" }}>
                        {/* Order Placed! Total: ₦{msg.amount / 100} */}
                      </p>
                      <a
                        href={msg.payUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: "#e63946",
                          color: "#fff",
                          textDecoration: "none",
                          padding: "8px 16px",
                          borderRadius: "20px",
                          display: "inline-block",
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

          <div
            style={{
              display: "flex",
              padding: "10px",
              backgroundColor: "#fff",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "20px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: "10px",
                backgroundColor: "#e63946",
                color: "white",
                border: "none",
                borderRadius: "50%",
                padding: "8px 12px",
                fontSize: "16px",
                cursor: "pointer",
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
