// Base API URL configuration
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_IN_PROD === 'true'
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

// Build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${getApiBaseUrl()}${endpoint}`;
};

// Pre-built API URLs for convenience
export const API_URLS = {
  CHAT: buildApiUrl('/chat'),
  RAG: buildApiUrl('/rag'),
  INGEST: buildApiUrl('/rag/ingest'),
  QUERY: buildApiUrl('/rag/query')
};