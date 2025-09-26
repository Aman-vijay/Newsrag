import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChatWindow, SessionLoadingState, SessionErrorState } from '@/components';
import { useSession } from '@/hooks';
import './ChatPage.scss';

const ChatPage = () => {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialMessage, setInitialMessage] = useState(null);

  const {
    sessionId,
    isCreatingSession,
    sessionError,
    createSession,
    resetSession,
    initializeSession,
  } = useSession();

  // Handle initial message from landing page
  useEffect(() => {
    if (location.state?.initialMessage) {
      setInitialMessage(location.state.initialMessage);
      // Clear the state to prevent re-sending on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleSessionInitialization = useCallback(async () => {
    try {
      const activeSessionId = await initializeSession(urlSessionId, navigate);
      if (activeSessionId && !urlSessionId) {
        // Navigate to the session URL if we're not already there
        navigate(`/chat/${activeSessionId}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }, [urlSessionId, initializeSession, navigate]);

  useEffect(() => {
    handleSessionInitialization();
  }, [handleSessionInitialization]);

  const handleSessionError = async (errorType) => {
    switch (errorType) {
      case 'new_session_requested':
        // Clear current session and create new one
        resetSession();
        try {
          const newSessionId = await createSession();
          navigate(`/chat/${newSessionId}`, { replace: true });
        } catch (error) {
          console.error('Failed to create new session:', error);
        }
        break;
      case 'history_load_failed':
        // Session might be invalid, create new one
        resetSession();
        setTimeout(async () => {
          try {
            const newSessionId = await createSession();
            navigate(`/chat/${newSessionId}`, { replace: true });
          } catch (error) {
            console.error('Failed to create new session:', error);
          }
        }, 1000);
        break;
      default:
        console.error('Unexpected session error:', errorType);
    }
  };

  // Show loading state while creating session
  if (isCreatingSession) {
    return <SessionLoadingState message="Creating new session..." />;
  }

  // Show error state if session creation failed
  if (sessionError && !sessionId) {
    return (
      <SessionErrorState 
        error={sessionError}
        onRetry={createSession}
        title="Failed to create session"
      />
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatWindow
  sessionId={sessionId}
  onSessionError={handleSessionError}
  onNewSession={async () => {
    const newSessionId = await createSession(true);
    navigate(`/chat/${newSessionId}`, { replace: true });
  }}
  initialMessage={initialMessage}
/>

      </div>
    </div>
  );
};

export default ChatPage;