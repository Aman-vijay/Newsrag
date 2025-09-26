import React from 'react';
import './ErrorDisplay.scss';

const ErrorDisplay = ({ 
  error, 
  title = "Something went wrong", 
  onRetry, 
  onDismiss,
  retryText = "Try Again",
  type = "error" // error, warning, info
}) => {
  if (!error) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❌';
    }
  };

  return (
    <div className={`error-display ${type}`}>
      <div className="error-content">
        <span className="error-icon">{getIcon()}</span>
        <h3>{title}</h3>
        <p>{error}</p>
        <div className="error-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              {retryText}
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} className="dismiss-button">
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;