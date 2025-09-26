import { apiRequest, validateMessage } from '@/utils/index.js';

class RAGAPI {
  async initializeNews() {
    try {
      return await apiRequest.post('/init', {});
    } catch (error) {
      console.error('❌ Failed to initialize news:', error);
      throw new Error('Failed to initialize news database');
    }
  }

  async queryNews(query) {
    try {
      // Validate query before sending
      if (!validateMessage(query)) {
        throw new Error('Query cannot be empty');
      }

      return await apiRequest.post('/query', { query });
    } catch (error) {
      console.error('❌ Failed to query news:', error);
      throw new Error('Failed to search news');
    }
  }
}

export default new RAGAPI();