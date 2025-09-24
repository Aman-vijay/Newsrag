
import { ingestNewsPipeline, searchNews } from "../services/newsService.js";

export async function initNews(req, res) {
  try {
    await ingestNewsPipeline();
    res.json({ message: "News ingested & stored in Qdrant ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function queryNews(req, res) {
  try {
    const { query } = req.body;
    const results = await searchNews(query);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
