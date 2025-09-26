export const API_ENDPOINTS = {
  CHAT: '/chat',
  RAG: '/rag',
  INGEST: '/rag/ingest',
  QUERY: '/rag/query'
};

// Message Types
export const MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  ERROR: 'error'
};

// Chat States
export const CHAT_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  STREAMING: 'streaming',
  ERROR: 'error'
};

// UI Constants
export const UI_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_DELAY: 50,
  AUTO_SCROLL_THRESHOLD: 100
};