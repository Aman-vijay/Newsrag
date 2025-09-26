import { API_URLS } from './config.js';

// Generic API request handler
export const makeApiRequest = async (url, options = {}) => {
  try {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle different response types
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    console.error('❌ API request failed:', error);
    throw error;
  }
};

// Specific API request builders
export const apiRequest = {
  get: (endpoint) => makeApiRequest(`${API_URLS.RAG}${endpoint}`, { method: 'GET' }),
  
  post: (endpoint, data) => makeApiRequest(`${API_URLS.RAG}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  delete: (endpoint) => makeApiRequest(`${API_URLS.RAG}${endpoint}`, { method: 'DELETE' })
};

// Chat-specific API request builders
export const chatRequest = {
  get: (endpoint) => makeApiRequest(`${API_URLS.CHAT}${endpoint}`, { method: 'GET' }),
  
  post: (endpoint, data) => makeApiRequest(`${API_URLS.CHAT}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // For streaming responses, return raw response
  postStream: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_URLS.CHAT}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('❌ Stream request failed:', error);
      throw error;
    }
  },
  
  delete: (endpoint) => makeApiRequest(`${API_URLS.CHAT}${endpoint}`, { method: 'DELETE' })
};