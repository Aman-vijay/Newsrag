import { redis } from "../configs/redis.js";

const CHAT_TTL = 60 * 60 * 24; 


export const saveMessage = async (sessionId, message) => {
  try {
    const key = `chat:${sessionId}`;
    
    // Ensure message is properly formatted
    const messageToSave = {
      id: message.id || Date.now(),
      type: message.type || 'unknown',
      content: message.content || '',
      timestamp: message.timestamp || new Date().toISOString(),
      ...(message.sources && { sources: message.sources })
    };
    
    // Always stringify the message before saving
    const serializedMessage = JSON.stringify(messageToSave);
    
    await redis.rpush(key, serializedMessage);
    await redis.expire(key, CHAT_TTL);

    console.log(`💾 Saved message to session ${sessionId}: ${messageToSave.type}`);
  } catch (error) {
    console.error("❌ Redis save error:", error);
    throw new Error(`Failed to save message: ${error.message}`);
  }
}

// Get full chat history
// export const getChatHistory = async (sessionId) => {
//   try {
//     const key = `chat:${sessionId}`;
//     const items = await redis.lrange(key, 0, -1);

//     if (!items || items.length === 0) {
//       console.log(`ℹ️ No history found for ${key}`);
//       return [];
//     }

//     return items.map((item) => JSON.parse(item));
//   } catch (error) {
//     console.error("❌ Redis get error:", error);
//     throw new Error(`Failed to get chat history: ${error.message}`);
//   }
// };

export const getChatHistory = async (sessionId) => {
  try{
    const key = `chat:${sessionId}`;
    const items = await redis.lrange(key, 0, -1);

    return items.map((item)=>{
      try{
        if(typeof item ==='object' && item !== null){
          return item; // Already an object
        }
        if(typeof item === 'string' && (item.startsWith('{') || item.startsWith('['))){
          return JSON.parse(item); // Parse valid JSON strings
        }

        return{
          type:'unknown',
          content: item ,// Store raw string for invalid JSON
          timestamp: new Date().toISOString()
        };
      } catch(e){
        console.warn(`⚠️ Skipping corrupted message: ${item}`);
        return { type: 'error', content: 'Failed to parse message', timestamp: new Date().toISOString(), error: e.message };
      }
    });
  } catch(error){
    console.error("❌ Redis get error:", error);
    throw new Error(`Failed to get chat history: ${error.message}`);
  }
}


  // Clear chat history
export const clearChatHistory = async (sessionId) => {
  try {
    const key = `chat:${sessionId}`;
    await redis.del(key);
    console.log(`🗑️ Cleared chat history for session ${sessionId}`);
  } catch (error) {
    console.error("❌ Redis clear error:", error);
    throw new Error(`Failed to clear chat history: ${error.message}`);
  }
}

// Clean up corrupted session data
export const cleanupSession = async (sessionId) => {
  try {
    const key = `chat:${sessionId}`;
    const items = await redis.lrange(key, 0, -1);
    
    console.log(`🧹 Cleaning up session ${sessionId} with ${items.length} items`);
    
    // Delete the corrupted key
    await redis.del(key);
    
    // Try to recover valid messages
    const validMessages = [];
    items.forEach((item, index) => {
      try {
        if (typeof item === 'string' && (item.startsWith('{') || item.startsWith('['))) {
          const parsed = JSON.parse(item);
          validMessages.push(parsed);
        }
      } catch (e) {
        console.warn(`⚠️ Skipping corrupted message at index ${index}: ${item}`);
      }
    });
    
    // Save valid messages back
    if (validMessages.length > 0) {
      for (const message of validMessages) {
        await saveMessage(sessionId, message);
      }
      console.log(`✅ Recovered ${validMessages.length} valid messages`);
    }
    
    return validMessages;
  } catch (error) {
    console.error("❌ Session cleanup error:", error);
    throw new Error(`Failed to cleanup session: ${error.message}`);
  }
};

// Test Redis connection
export const testRedisConnection = async () => {
  try {
    const pong = await redis.ping();
    console.log("✅ Redis connection successful:", pong);
    return true;
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
    throw new Error(`Redis connection failed: ${error.message}`);
  }
}




