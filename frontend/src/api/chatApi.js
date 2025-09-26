import { chatRequest, validateMessage } from '@/utils/index.js';

class ChatAPI {
  async createSession() {
    try {
      return await chatRequest.post('/session', {});
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      throw new Error('Failed to create new chat session');
    }
  }

  async sendMessage(sessionId, message) {
    try {
      // Validate message before sending
      if (!validateMessage(message)) {
        throw new Error('Message cannot be empty');
      }

      return await chatRequest.post('/message', { sessionId, message });
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  }

  async sendMessageStream(sessionId, message) {
    try {
      // Validate message before sending
      if (!validateMessage(message)) {
        throw new Error('Message cannot be empty');
      }

      return await chatRequest.postStream('/', { sessionId, message });
    } catch (error) {
      console.error('❌ Failed to start message stream:', error);
      throw new Error('Failed to start message stream');
    }
  }

  async getChatHistory(sessionId) {
    try {
      return await chatRequest.get(`/history/${sessionId}`);
    } catch (error) {
      console.error('❌ Failed to get chat history:', error);
      throw new Error('Failed to load chat history');
    }
  }

  async clearChatHistory(sessionId) {
    try {
      return await chatRequest.delete(`/history/${sessionId}`);
    } catch (error) {
      console.error('❌ Failed to clear chat history:', error);
      throw new Error('Failed to clear chat history');
    }
  }
}

export default new ChatAPI();