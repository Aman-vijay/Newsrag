// src/components/Loader/Loader.jsx
import React from 'react';
import './Loader.scss';

const Loader = ({ 
  message = 'Loading...', 
  size = 'medium',
  type = 'spinner',
  className = '' 
}) => {
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
      
      case 'pulse':
        return (
          <div className="loader-pulse">
            <div className="pulse-ring"></div>
          </div>
        );
      
      case 'typing':
        return (
          <div className="loader-typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
      
      default:
        return (
          <div className="loader-spinner">
            <div className="spinner"></div>
          </div>
        );
    }
  };

  return (
    <div className={`loader ${size} ${className}`}>
      {renderLoader()}
      {message && (
        <p className="loader-message">{message}</p>
      )}
    </div>
  );
};

export default Loader;