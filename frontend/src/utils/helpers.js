// Format timestamps
export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString();
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Generate unique IDs
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validate message content
export const validateMessage = (message) => {
  return message && message.trim().length > 0;
};

// Format sources
export const formatSources = (sources) => {
  return sources?.map(source => ({
    title: source.title || 'Unknown Source',
    url: source.url || '#',
    snippet: truncateText(source.content, 150)
  })) || [];
};