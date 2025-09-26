import React from 'react';
import './SessionControls.scss';

const SessionControls = ({ 
  sessionId, 
  onNewSession, 
  onClearHistory, 
  onLoadHistory,
  isLoading 
}) => {
  const formatSessionId = (id) => {
    if (!id) return 'No session';
    return `${id.slice(0, 8)}...`;
  };

  return (
    <div className="session-controls">
      <div className="session-info">
        <div className="session-indicator">
          <span className="session-dot"></span>
          <span className="session-text">
            Session: {formatSessionId(sessionId)}
          </span>
        </div>
      </div>

      <div className="control-buttons">
        <button
          onClick={onLoadHistory}
          className="control-btn secondary"
          disabled={!sessionId || isLoading}
          title="Reload chat history"
        >
          <span className="btn-icon">🔄</span>
          <span className="btn-text">Reload</span>
        </button>

        <button
          onClick={onClearHistory}
          className="control-btn warning"
          disabled={!sessionId || isLoading}
          title="Clear chat history"
        >
          <span className="btn-icon">🗑️</span>
          <span className="btn-text">Clear</span>
        </button>

        <button
          onClick={onNewSession}
          className="control-btn primary"
          disabled={isLoading}
          title="Start new session"
        >
          <span className="btn-icon">➕</span>
          <span className="btn-text">New Chat</span>
        </button>
      </div>
    </div>
  );
};

export default SessionControls;