import { useState, useCallback,useEffect } from 'react';
import { chatApi } from '@/api';

export const useSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  useEffect(()=>{
    const storedSession = localStorage.getItem("sessionId")
    if(storedSession){
        setSessionId(storedSession);}
  },[]);

  const createSession = useCallback(async () => {
    setIsCreatingSession(true);
    setSessionError(null);
    
    try {

        if (sessionId) {
        console.log("✅ Reusing existing session:", sessionId);
        return sessionId;
      }


      const response = await chatApi.createSession();
      setSessionId(response.sessionId);
      localStorage.setItem("sessionId",response.sessionId);
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
    localStorage.removeItem("sessionId");
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