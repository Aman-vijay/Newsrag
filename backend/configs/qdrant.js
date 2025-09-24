import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";


dotenv.config();


export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// Test connection function
export const testQdrantConnection = async () => {
  try {
    console.log("🔍 Testing Qdrant connection...");
    const collections = await qdrantClient.getCollections();
    console.log("✅ Qdrant connection successful");
    return true;
  } catch (error) {
    console.error("❌ Qdrant connection failed:", error.message);
    throw new Error(`Cannot connect to Qdrant: ${error.message}`);
  }
};
