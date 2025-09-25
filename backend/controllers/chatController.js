import { v4 as uuidv4 } from 'uuid';
import { searchNews } from "../services/newsService.js";
import { generateAIResponse, generateAIResponseStream } from '../services/aiService.js';
import { saveMessage, getChatHistory, clearChatHistory } from '../services/redisService.js';

// Create new session 
export const createSession = (req, res) => {
  try {
    const sessionId = uuidv4();
    console.log(`✅ Created new session: ${sessionId}`);
    res.json({ sessionId, message: "New chat session created" });
  } catch (error) {
    console.error("❌ Session creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Send message and get bot response (non-streaming)
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: "Session ID and message are required" });
    }

    console.log(`💬 Processing message for session ${sessionId}: "${message}"`);
    
    // Step 1: Save user message to history
    await saveMessage(sessionId, {
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Step 2: Search relevant news articles
    const searchResults = await searchNews(message, 5);
    console.log(`🔍 Found ${searchResults.length} relevant articles`);

    // Step 3: Generate context from search results
    const context = searchResults
      .map(result => `Title: ${result.payload.title}\nContent: ${result.payload.content}`)
      .join('\n\n');

    // Step 4: Generate AI response using OpenAI
    const aiResponse = await generateAIResponse(message, context);
    console.log(`🤖 Generated AI response: ${aiResponse.substring(0, 100)}...`);

    // Step 5: Save bot response to history
    await saveMessage(sessionId, {
      type: 'bot',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      sources: searchResults.map(r => ({
        title: r.payload.title,
        link: r.payload.link,
        score: r.score
      }))
    });

    // Step 6: Return response
    res.json({
      response: aiResponse,
      sources: searchResults.map(r => ({
        title: r.payload.title,
        link: r.payload.link,
        score: r.score
      }))
    });

  } catch (error) {
    console.error("❌ Chat error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Send message and get streaming bot response
export const sendMessageStream = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "Session ID and message are required" });
    }

    console.log(`💬 Processing streaming message for session ${sessionId}: "${message}"`);

    // SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Cleanup function
    const cleanup = () => {
      clearInterval(keepAlive);
    };

    // Handle client disconnect
    req.on('close', cleanup);
    req.on('aborted', cleanup);

    try {
      // Step 1: Save user message
      await saveMessage(sessionId, {
        type: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      // Step 2: Retrieve context
      const searchResults = await searchNews(message, 5);
      console.log(`🔍 Found ${searchResults.length} relevant articles`);

      // Send sources immediately
      res.write(`data: ${JSON.stringify({
        type: "sources",
        sources: searchResults.map((r) => ({
          title: r.payload.title,
          link: r.payload.link,
          score: r.score,
        })),
      })}\n\n`);

      // Step 3: Build context
      const context = searchResults
        .map((result) => `Title: ${result.payload.title}\nContent: ${result.payload.content}`)
        .join("\n\n");

      // Step 4: AI response (streaming)
      const stream = await generateAIResponseStream(message, context);
      let fullResponse = "";

      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullResponse += content;
            res.write(`data: ${JSON.stringify({
              type: "content",
              content,
            })}\n\n`);
          }
        }
      } catch (streamError) {
        console.error("❌ Error during stream:", streamError.message);
        res.write(`data: ${JSON.stringify({ 
          type: "error", 
          error: streamError.message 
        })}\n\n`);
        cleanup();
        res.end();
        return;
      }

      // Step 5: Save assistant response
      await saveMessage(sessionId, {
        type: "bot",
        content: fullResponse,
        timestamp: new Date().toISOString(),
        sources: searchResults.map((r) => ({
          title: r.payload.title,
          link: r.payload.link,
          score: r.score,
        })),
      });

      // Send completion signal
      res.write(`data: ${JSON.stringify({
        type: "complete",
        fullResponse,
      })}\n\n`);

      cleanup();
      res.end();

    } catch (error) {
      console.error("❌ Streaming processing error:", error.message);
      res.write(`data: ${JSON.stringify({
        type: "error",
        error: error.message,
      })}\n\n`);
      cleanup();
      res.end();
    }

  } catch (error) {
    console.error("❌ Streaming chat error:", error.message);
    res.write(`data: ${JSON.stringify({
      type: "error",
      error: error.message,
    })}\n\n`);
    res.end();
  }
}

// Get chat history for a session
export const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }
    
    console.log(`📚 Fetching history for session: ${sessionId}`);
    const history = await getChatHistory(sessionId);
    res.json({ history });
    
  } catch (error) {
    console.error("❌ Get history error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Clear chat history for a session
export const clearHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }
    
    console.log(`🗑️ Clearing history for session: ${sessionId}`);
    await clearChatHistory(sessionId);
    res.json({ message: "Chat history cleared successfully" });
    
  } catch (error) {
    console.error("❌ Clear history error:", error.message);
    res.status(500).json({ error: error.message });
  }
};