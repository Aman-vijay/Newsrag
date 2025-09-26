import { useState, useCallback } from 'react';
import { chatApi } from '@/api';

export const useSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  const createSession = useCallback(async () => {
    setIsCreatingSession(true);
    setSessionError(null);
    
    try {
      const response = await chatApi.createSession();
      setSessionId(response.sessionId);
      console.log('✅ Session created:', response.sessionId);
      return response.sessionId;
    } catch (error) {
      setSessionError(error.message);
      console.error('❌ Session creation failed:', error);
      throw error;
    } finally {
      setIsCreatingSession(false);
    }
  }, []);

  const resetSession = useCallback(() => {
    setSessionId(null);
    setSessionError(null);
  }, []);

  return {
    sessionId,
    isCreatingSession,
    sessionError,
    createSession,
    resetSession,
  };
};