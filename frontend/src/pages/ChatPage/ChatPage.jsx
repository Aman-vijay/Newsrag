import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChatWindow } from '@/components';
import { chatApi } from '@/api';
import { Loader } from '@/components';
import './ChatPage.scss';

const ChatPage = () => {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [initialMessage, setInitialMessage] = useState(null);

  useEffect(() => {
    initializeSession();
  }, [urlSessionId]);

  // Handle initial message from landing page
  useEffect(() => {
    if (location.state?.initialMessage) {
      setInitialMessage(location.state.initialMessage);
      // Clear the state to prevent re-sending on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const initializeSession = async () => {
    // If there's a sessionId in URL, use that
    if (urlSessionId) {
      setSessionId(urlSessionId);
      // Store in localStorage for persistence
      localStorage.setItem('sessionId', urlSessionId);
      return;
    }

    // Check if there's a stored session
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      // Update URL to match the stored session
      navigate(`/chat/${storedSessionId}`, { replace: true });
      return;
    }

    // If no session exists, create a new one
    await createNewSession();
  };

  const createNewSession = async () => {
    setIsCreatingSession(true);
    setSessionError(null);
    
    try {
      const response = await chatApi.createSession();
      const newSessionId = response.sessionId;
      
      setSessionId(newSessionId);
      localStorage.setItem('sessionId', newSessionId);
      
      // Navigate to the new session URL
      navigate(`/chat/${newSessionId}`, { replace: true });
      
      console.log('✅ New session created:', newSessionId);
    } catch (error) {
      setSessionError(error.message);
      console.error('❌ Session creation failed:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSessionError = (errorType) => {
    switch (errorType) {
      case 'new_session_requested':
        // Clear current session and create new one
        localStorage.removeItem('sessionId');
        createNewSession();
        break;
      case 'history_load_failed':
        // Session might be invalid, create new one
        setSessionError('Session expired. Creating new session...');
        localStorage.removeItem('sessionId');
        setTimeout(() => createNewSession(), 1000);
        break;
      default:
        setSessionError('An unexpected error occurred');
    }
  };

  // Show loading state while creating session
  if (isCreatingSession) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-loading">
            <Loader message="Creating new session..." />
          </div>
        </div>
      </div>
    );
  }

  // Show error state if session creation failed
  if (sessionError && !sessionId) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-error">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <h3>Failed to create session</h3>
              <p>{sessionError}</p>
              <button onClick={createNewSession} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatWindow 
          sessionId={sessionId} 
          onSessionError={handleSessionError}
          initialMessage={initialMessage}
        />
      </div>
    </div>
  );
};

export default ChatPage;