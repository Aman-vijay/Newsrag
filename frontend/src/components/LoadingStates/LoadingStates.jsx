import React from 'react';
import { Loader, ErrorDisplay } from '@/components';
import './LoadingStates.scss';

export const LoadingState = ({ message = "Loading...", className = "" }) => (
  <div className={`loading-state ${className}`}>
    <Loader message={message} />
  </div>
);

export const ErrorState = ({ 
  error, 
  title, 
  onRetry, 
  retryText = "Try Again",
  className = "" 
}) => (
  <div className={`error-state ${className}`}>
    <ErrorDisplay 
      error={error}
      title={title}
      onRetry={onRetry}
      retryText={retryText}
    />
  </div>
);

export const SessionLoadingState = ({ message = "Initializing chat..." }) => (
  <div className="session-loading-state">
    <div className="container">
      <LoadingState message={message} />
    </div>
  </div>
);

export const SessionErrorState = ({ 
  error, 
  onRetry, 
  title = "Failed to create session" 
}) => (
  <div className="session-error-state">
    <div className="container">
      <ErrorState
        error={error}
        title={title}
        onRetry={onRetry}
        retryText="Try Again"
      />
    </div>
  </div>
);