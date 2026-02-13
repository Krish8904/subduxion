import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m the Subduxion assistant. Ask me anything about the project - features, technical details, or how to use the platform!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Subduxion project knowledge base
  const SUBDUXION_KNOWLEDGE = `You are a helpful assistant for Subduxion, a comprehensive subscription management platform.

About Subduxion:
Subduxion is a modern subscription management system designed to help businesses and individuals track, manage, and optimize their recurring subscriptions.

Key Features:
- Subscription Tracking: Add and monitor all your subscriptions in one place
- Payment Management: Track payment dates, amounts, and billing cycles
- Cost Analytics: Visualize spending patterns and identify optimization opportunities
- Renewal Reminders: Get notified before subscriptions renew
- Multi-currency Support: Track subscriptions in different currencies
- Category Organization: Group subscriptions by type (Software, Entertainment, etc.)
- Admin Dashboard: Comprehensive admin panel for system management
- User Management: Role-based access control
- Reports & Insights: Detailed analytics on subscription spending

Technical Stack:
- Frontend: React.js with modern hooks
- Backend: Node.js/Express
- Database: MongoDB/PostgreSQL
- Authentication: JWT-based secure authentication
- UI/UX: Responsive design, mobile-friendly

User Roles:
- Regular Users: Can manage their own subscriptions
- Admins: Full system access, user management, analytics

Security Features:
- Secure authentication system
- Password encryption
- Protected admin routes
- Session management
- Data privacy compliance

How to Use:
1. Sign up for an account
2. Log in to your dashboard
3. Add your subscriptions with details (name, cost, billing cycle, etc.)
4. View analytics and insights
5. Set up renewal reminders
6. Manage payments and track spending

Answer user questions about Subduxion in a friendly, helpful manner.`;

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: input }) // send just the user input
      });

      const data = await response.json();

      let assistantContent = "Sorry, I couldn't generate a response.";

      if (Array.isArray(data) && data[0]?.generated_text) {
        assistantContent = data[0].generated_text.trim();
      } else if (data.generated_text) {
        assistantContent = data.generated_text.trim();
      } else if (data.error) {
        assistantContent = data.error.includes('currently loading')
          ? "The AI model is warming up. Please try again in a few seconds!"
          : `Error: ${data.error}`;
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: assistantContent }
      ]);

    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Try again!" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render on admin login page
  if (window.location.pathname.includes('/admin/login') ||
    window.location.pathname.includes('/login')) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-button"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="chatbot-title">Subduxion Assistant</h3>
                <p className="chatbot-subtitle">Powered by Free AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="chatbot-close"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatbot-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-message assistant-message">
                <div className="message-content loading">
                  <Loader2 size={16} className="spinner" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-container">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Subduxion..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              className="chatbot-send"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .chatbot-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 9998;
        }

        .chatbot-button:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 32px rgba(99, 102, 241, 0.5);
        }

        .chatbot-button:active {
          transform: scale(1.05);
        }

        .chatbot-window {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 400px;
          max-width: calc(100vw - 48px);
          height: 600px;
          max-height: calc(100vh - 100px);
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chatbot-header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 16px 16px 0 0;
        }

        .chatbot-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chatbot-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatbot-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .chatbot-subtitle {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .chatbot-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .chatbot-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #f8f9fa;
        }

        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .chatbot-message {
          display: flex;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-message {
          justify-content: flex-end;
        }

        .assistant-message {
          justify-content: flex-start;
        }

        .message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .user-message .message-content {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border-radius: 12px 12px 4px 12px;
        }

        .assistant-message .message-content {
          background: white;
          color: #1e293b;
          border-radius: 12px 12px 12px 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .message-content.loading {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .chatbot-input-container {
          padding: 16px 20px;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 12px;
          border-radius: 0 0 16px 16px;
        }

        .chatbot-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .chatbot-input:focus {
          border-color: #6366f1;
        }

        .chatbot-input:disabled {
          background: #f1f5f9;
          cursor: not-allowed;
        }

        .chatbot-send {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .chatbot-send:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .chatbot-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .chatbot-window {
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            bottom: 0;
            right: 0;
            border-radius: 0;
          }

          .chatbot-header {
            border-radius: 0;
          }

          .chatbot-input-container {
            border-radius: 0;
          }

          .chatbot-button {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot;