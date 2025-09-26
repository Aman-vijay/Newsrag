import { useState, useCallback } from 'react';
import { chatApi } from '@/api';

export const useChatStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);

  const sendStreamMessage = useCallback(async (sessionId, message, onChunk, onComplete, onError) => {
    if (!sessionId || !message.trim()) {
      throw new Error('Session ID and message are required');
    }

    setIsStreaming(true);
    setStreamError(null);

    try {
      const response = await chatApi.sendMessageStream(sessionId, message);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let sources = [];
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'sources':
                  sources = data.sources;
                  onChunk?.({ type: 'sources', sources });
                  break;
                  
                case 'content':
                  content += data.content;
                  onChunk?.({ type: 'content', content: data.content, fullContent: content });
                  break;
                  
                case 'complete':
                  onComplete?.({ content, sources, fullResponse: data.fullResponse });
                  break;
                  
                case 'error':
                  throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      setStreamError(error.message);
      onError?.(error);
      throw error;
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const sendNormalMessage = useCallback(async (sessionId, message) => {
    if (!sessionId || !message.trim()) {
      throw new Error('Session ID and message are required');
    }

    try {
      const response = await chatApi.sendMessage(sessionId, message);
      return response;
    } catch (error) {
      setStreamError(error.message);
      throw error;
    }
  }, []);

  return {
    isStreaming,
    streamError,
    sendStreamMessage,
    sendNormalMessage,
  };
};