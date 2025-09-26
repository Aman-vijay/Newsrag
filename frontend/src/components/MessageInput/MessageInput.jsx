// src/components/MessageInput/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.scss';

const MessageInput = ({ onSendMessage, disabled = false, isStreaming = false }) => {
  const [message, setMessage] = useState('');
  const [useStreaming, setUseStreaming] = useState(true);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Focus on textarea when component mounts
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSendMessage(message.trim(), useStreaming);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestedQuestions = [
    "What's happening in technology today?",
    "Tell me about recent political developments",
    "Any updates on climate change?",
    "What are the latest business news?"
  ];

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <div className="message-input-container">
      {/* Suggested questions (show when input is empty) */}
      {!message.trim() && (
        <div className="suggestions">
          <p className="suggestions-title">Try asking:</p>
          <div className="suggestion-pills">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(question)}
                className="suggestion-pill"
                disabled={disabled}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls */}
      <div className="input-controls">
        <label className="streaming-toggle">
          <input
            type="checkbox"
            checked={useStreaming}
            onChange={(e) => setUseStreaming(e.target.checked)}
            disabled={disabled}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">
            Stream responses {useStreaming ? '✨' : '⚡'}
          </span>
        </label>
      </div>

      {/* Main input form */}
      <form onSubmit={handleSubmit} className="message-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about recent news..."
            disabled={disabled}
            rows={1}
            className="message-textarea"
            maxLength={1000}
          />
          
          <div className="input-actions">
            <div className="character-count">
              <span className={message.length > 900 ? 'warning' : ''}>
                {message.length}/1000
              </span>
            </div>
            
            <button 
              type="submit" 
              disabled={!message.trim() || disabled}
              className="send-button"
              title={disabled ? (isStreaming ? 'Streaming...' : 'Processing...') : 'Send message'}
            >
              {disabled ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                <span className="send-icon">📤</span>
              )}
            </button>
          </div>
        </div>
      </form>
      
      {/* Status message */}
      {disabled && (
        <div className="status-message">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">
              {isStreaming ? 'AI is responding...' : 'Processing your message...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;