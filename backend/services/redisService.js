import { redis } from "../configs/redis.js";

const CHAT_TTL = 60 * 60 * 24; 


export const saveMessage = async (sessionId, message) => {
  try {
    const key = `chat:${sessionId}`;
    await redis.rpush(key, JSON.stringify(message));
    await redis.expire(key, CHAT_TTL);

    console.log(`Saved message to session ${sessionId}`);
  } catch (error) {
    console.error("Redis save error:", error);
    throw new Error(`Failed to save message: ${error.message}`);
  }
}

// Get full chat history
export const getChatHistory = async (sessionId) => {
  try {
    const key = `chat:${sessionId}`;
    const items = await redis.lrange(key, 0, -1); // get all items

    return items.map((item) => JSON.parse(item));
  } catch (error) {
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




