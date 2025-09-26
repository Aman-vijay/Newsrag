import Parser from "rss-parser";
import { qdrantClient, testQdrantConnection } from "../configs/qdrant.js";
import { generateEmbedding } from "../configs/embeddings.js";

const parser = new Parser();

// Configs
const COLLECTION_NAME = "news";
const DISTANCE_METRIC = "Cosine";
const DEFAULT_LIMIT = 60;

const RSS_FEEDS = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://feeds.bbci.co.uk/news/politics/rss.xml",
  "https://feeds.bbci.co.uk/news/business/rss.xml",
  "https://feeds.bbci.co.uk/news/technology/rss.xml",
  "https://rss.cnn.com/rss/edition.rss",
  "https://rss.cnn.com/rss/cnn_world.rss",
  "https://www.aljazeera.com/xml/rss/all.xml",
  "https://feeds.npr.org/1004/rss.xml",
];

/**
 * Helper: normalize RSS item into article object
 */
function normalizeArticle(item, id) {
  return {
    id,
    title: item.title || "No title",
    link: item.link || "",
    content: item.contentSnippet || item.content || item.summary || "",
  };
}

/**
 * Fetch ~ N news articles via RSS
 */
export async function fetchNews(limit = DEFAULT_LIMIT) {
  const allArticles = [];
  let articleId = 0;

  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`🌐 Fetching RSS feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);

      if (feed?.items?.length) {
        const articles = feed.items.map((item) =>
          normalizeArticle(item, articleId++)
        );
        allArticles.push(...articles);

        console.log(`✅ Got ${articles.length} articles from ${feedUrl}`);

        if (allArticles.length >= limit) break;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to fetch from ${feedUrl}: ${error.message}`);
    }
  }

  if (!allArticles.length) {
    throw new Error("No articles fetched from any RSS feeds");
  }

  console.log(`🎉 Collected total ${allArticles.length} articles`);
  return allArticles.slice(0, limit);
}

/**
 * Generate embeddings for articles
 */
export async function embedArticles(articles) {
  const embedded = [];

  console.log(`🧠 Generating embeddings for ${articles.length} articles...`);

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const text = `${article.title} ${article.content}`;

    try {
      console.log(`→ [${i + 1}/${articles.length}] ${article.title}`);
      const embedding = await generateEmbedding(text);
      embedded.push({ ...article, embedding });
    } catch (error) {
      console.error(`❌ Skipped article "${article.title}" – ${error.message}`);
    }
  }

  console.log(`✅ Generated embeddings for ${embedded.length} articles`);
  return embedded;
}

/**
 * Store embeddings in Qdrant
 */
export async function storeInQdrant(articles, { recreate = false } = {}) {
  if (!articles.length) return;

  try {
    console.log("🔍 Checking Qdrant connection...");
    await testQdrantConnection();

    const vectorSize = articles[0].embedding.length;

    if (recreate) {
      console.log(`📦 Recreating collection "${COLLECTION_NAME}"`);
      await qdrantClient.recreateCollection(COLLECTION_NAME, {
        vectors: { size: vectorSize, distance: DISTANCE_METRIC },
      });
    } else {
      console.log(`📦 Ensuring collection "${COLLECTION_NAME}" exists`);
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: { size: vectorSize, distance: DISTANCE_METRIC },
      });
    }

    const points = articles.map((article) => ({
      id: article.id,
      vector: article.embedding,
      payload: {
        title: article.title,
        link: article.link,
        content: article.content,
      },
    }));

    console.log(`💾 Upserting ${points.length} points...`);
    await qdrantClient.upsert(COLLECTION_NAME, { points });

    console.log(`✅ Stored ${articles.length} articles in Qdrant`);
  } catch (error) {
    console.error("❌ Failed to store in Qdrant:", error.message);
    throw error;
  }
}

/**
 * Search Qdrant with a query
 */
export async function searchNews(query, topK = 5) {
  try {
    console.log(`🔍 Searching news for: "${query}"`);
    await testQdrantConnection();

    const embedding = await generateEmbedding(query);
    console.log(`🧠 Generated query embedding [dim=${embedding.length}]`);

    const results = await qdrantClient.search(COLLECTION_NAME, {
      vector: embedding,
      limit: topK,
    });

    console.log(`✅ Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error("❌ Search failed:", error.message);
    throw error;
  }
}

/**
 * Full pipeline: fetch → embed → store
 */
export async function ingestNewsPipeline({ recreate = true } = {}) {
  try {
    console.log("🚀 Starting news ingestion pipeline...");

    const articles = await fetchNews();
    const embedded = await embedArticles(articles);
    await storeInQdrant(embedded, { recreate });

    console.log("🎉 Pipeline completed successfully!");
  } catch (error) {
    console.error("💥 Pipeline failed:", error.message);
    throw error;
  }
}
