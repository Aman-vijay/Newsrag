import Parser from "rss-parser";
import { qdrantClient, testQdrantConnection } from "../configs/qdrant.js";
import { embedder, generateEmbedding } from "../configs/embeddings.js";

const parser = new Parser();
const COLLECTION_NAME = "news";

/**
 * Fetch ~50 news articles via RSS
 */
export async function fetchNews(limit = 50) {
 
  const RSS_FEEDS = [
    "https://feeds.bbci.co.uk/news/world/rss.xml", // BBC News
  ];

  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`Trying RSS feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      
      if (feed && feed.items && feed.items.length > 0) {
        console.log(`✅ Successfully fetched ${feed.items.length} articles from ${feedUrl}`);
        return feed.items.slice(0, limit).map((item, idx) => ({
          id: idx,
          title: item.title || "No title",
          link: item.link || "",
          content: item.contentSnippet || item.content || item.summary || "",
        }));
      }
    } catch (error) {
      console.log(`❌ Failed to fetch from ${feedUrl}:`, error.message);
      continue; 
    }
  }
  
  throw new Error("All RSS feeds failed to load");
}

export async function embedArticles(articles) {
  const embedded = [];
  console.log(`🔄 Starting to generate embeddings for ${articles.length} articles...`);
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    try {
      const text = `${article.title} ${article.content}`;
      console.log(`📝 Processing article ${i + 1}/${articles.length}: "${article.title.substring(0, 51)}..."`);
      
      const embedding = await generateEmbedding(text);
      embedded.push({ ...article, embedding });
      
      console.log(`✅ Generated embedding for article ${i + 1} (dimension: ${embedding.length})`);
    } catch (error) {
      console.error(`❌ Failed to generate embedding for article ${i + 1}:`, error.message);
      throw new Error(`Embedding generation failed for article "${article.title}": ${error.message}`);
    }
  }
  
  console.log(`🎉 Successfully generated embeddings for all ${embedded.length} articles`);
  return embedded;
}

/**
 * Store embeddings in Qdrant
 */
export async function storeInQdrant(articles) {
  if (!articles.length) return;
  
  try {
    console.log("🔍 Testing Qdrant connection before storing...");
    await testQdrantConnection();
    
    console.log(`📦 Creating/recreating collection: ${COLLECTION_NAME}`);
    console.log(`📏 Vector dimension: ${articles[0].embedding.length}`);
    
    // Create collection if not exists
    await qdrantClient.recreateCollection(COLLECTION_NAME, {
      vectors: { size: articles[0].embedding.length, distance: "Cosine" },
    });
    
    console.log("✅ Collection created/recreated successfully");

    const points = articles.map((article) => ({
      id: article.id,
      vector: article.embedding,
      payload: {
        title: article.title,
        link: article.link,
        content: article.content,
      },
    }));

    console.log(`💾 Upserting ${points.length} points to Qdrant...`);
    await qdrantClient.upsert(COLLECTION_NAME, { points });
    console.log(`✅ Stored ${articles.length} articles in Qdrant`);
    
  } catch (error) {
    console.error("❌ Failed to store in Qdrant:", error.message);
    console.error("Stack trace:", error.stack);
    throw new Error(`Qdrant storage failed: ${error.message}`);
  }
}

/**
 * Search Qdrant with a query
 */
export async function searchNews(query, topK = 5) {
  try {
    console.log(`🔍 Searching for: "${query}"`);
    
    // Test connection first
    await testQdrantConnection();
    
    // Generate embedding for query (use retrieval.query type)
    const embedding = await generateEmbedding(query);
    console.log(`🧠 Generated query embedding (dimension: ${embedding.length})`);
    
    // Search Qdrant
    console.log(`🔍 Searching Qdrant collection: ${COLLECTION_NAME}`);
    const results = await qdrantClient.search(COLLECTION_NAME, {
      vector: embedding,
      limit: topK,
    });
    
    console.log(`✅ Found ${results.length} results`);
    return results;
    
  } catch (error) {
    console.error("❌ Search failed:", error.message);
    throw new Error(`Search failed: ${error.message}`);
  }
}

/**
 * Full pipeline: fetch → embed → store
 */
export async function ingestNewsPipeline() {
  try {
    console.log("🚀 Starting news ingestion pipeline...");
    
    // Step 1: Fetch articles
    console.log("📰 Step 1: Fetching news articles...");
    const articles = await fetchNews();
    console.log(`✅ Fetched ${articles.length} articles`);
    
    // Step 2: Generate embeddings
    console.log("🧠 Step 2: Generating embeddings...");
    const embedded = await embedArticles(articles);
    console.log(`✅ Generated embeddings for ${embedded.length} articles`);
    
    // Step 3: Store in Qdrant
    console.log("💾 Step 3: Storing in Qdrant...");
    await storeInQdrant(embedded);
    console.log("🎉 News ingestion pipeline completed successfully!");
    
  } catch (error) {
    console.error("💥 Pipeline failed:", error.message);
    console.error("Stack trace:", error.stack);
    throw error;
  }
}
