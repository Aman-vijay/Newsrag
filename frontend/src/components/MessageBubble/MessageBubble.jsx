// src/components/MessageBubble/MessageBubble.jsx
import React from 'react';
import { SourcesList } from '@/components';
import './MessageBubble.scss';

const MessageBubble = ({ message, isStreaming = false }) => {
  const { type, content, timestamp, sources, isError } = message;
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const renderContent = () => {
    if (type === 'user') {
      return (
        <div className="message-content">
          <p>{content}</p>
        </div>
      );
    }

    return (
      <div className="message-content bot-content">
        <div className="bot-avatar">
          <span className="avatar-emoji">🤖</span>
        </div>
        
        <div className="bot-message-wrapper">
          <div className="bot-text">
            {isError ? (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span>{content || 'Something went wrong. Please try again.'}</span>
              </div>
            ) : (
              <>
                {content || (isStreaming ? 'Thinking...' : 'No response')}
                {isStreaming && (
                  <span className="streaming-cursor">▌</span>
                )}
              </>
            )}
          </div>
          
          {sources && sources.length > 0 && !isError && (
            <SourcesList sources={sources} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`message-bubble ${type} ${isError ? 'error' : ''} ${isStreaming ? 'streaming' : ''}`}>
      {renderContent()}
      
      {timestamp && (
        <div className="message-timestamp">
          {formatTime(timestamp)}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;