import { useState, useCallback, useEffect } from 'react';
import { chatApi } from '@/api';

export const useSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("sessionId");
    if (storedSession) {
      setSessionId(storedSession);
    }
  }, []);

  // Centralized session storage helper
  const updateSession = useCallback((newSessionId) => {
    setSessionId(newSessionId);
    if (newSessionId) {
      localStorage.setItem("sessionId", newSessionId);
    } else {
      localStorage.removeItem("sessionId");
    }
  }, []);

  const createSession = useCallback(async () => {
    // If session already exists, return it
    if (sessionId) {
      console.log("✅ Reusing existing session:", sessionId);
      return sessionId;
    }

    setIsCreatingSession(true);
    setSessionError(null);
    
    try {
      const response = await chatApi.createSession();
      const newSessionId = response.sessionId;
      updateSession(newSessionId);
      console.log('✅ New session created:', newSessionId);
      return newSessionId;
    } catch (error) {
      const errorMessage = error.message || 'Failed to create session';
      setSessionError(errorMessage);
      console.error('❌ Session creation failed:', error);
      throw new Error(errorMessage);
    } finally {
      setIsCreatingSession(false);
    }
  }, [sessionId, updateSession]);

  const resetSession = useCallback(() => {
    updateSession(null);
    setSessionError(null);
  }, [updateSession]);

  // Handle session initialization with URL parameter
  const initializeSession = useCallback(async (urlSessionId, navigate) => {
    // If there's a sessionId in URL, use that
    if (urlSessionId) {
      updateSession(urlSessionId);
      return urlSessionId;
    }

    // Check if there's a stored session
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      // Update URL to match the stored session if navigate is provided
      if (navigate) {
        navigate(`/chat/${storedSessionId}`, { replace: true });
      }
      return storedSessionId;
    }

    // If no session exists, create a new one
    return await createSession();
  }, [updateSession, createSession]);

  return {
    sessionId,
    isCreatingSession,
    sessionError,
    createSession,
    resetSession,
    initializeSession,
    updateSession,
  };
};