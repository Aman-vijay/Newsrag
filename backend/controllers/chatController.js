import { v4 as uuidv4 } from 'uuid';
import {searchNews} from "../services/newsService.js";
import { generateAIResponse,generateAIResponseStream } from '../services/aiService.js';
// import { saveMessage, getChatHistory, clearChatHistory } from '../services/redisService.js';


export async function createSession(req, res) {
  try {
    const sessionId = uuidv4();
    res.json({ sessionId, message: "New chat session created" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export async function sendMessageStream(req, res) {
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
    });

    // Step 1: Retrieve context from Qdrant
    const searchResults = await searchNews(message, 5);
    console.log(`🔍 Found ${searchResults.length} relevant articles`);

    // Send sources first
    res.write(
      `data: ${JSON.stringify({
        type: "sources",
        sources: searchResults.map((r) => ({
          title: r.payload.title,
          link: r.payload.link,
          score: r.score,
        })),
      })}\n\n`
    );

    // Step 2: Build context for LLM
    const context = searchResults
      .map(
        (result) =>
          `Title: ${result.payload.title}\nContent: ${result.payload.content}`
      )
      .join("\n\n");

    // Step 3: Stream AI response
    const stream = await generateAIResponseStream(message, context);
    let fullResponse = "";

    try {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(
            `data: ${JSON.stringify({
              type: "content",
              content,
            })}\n\n`
          );
        }
      }
    } catch (streamError) {
      console.error("❌ Error during stream:", streamError.message);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: streamError.message,
        })}\n\n`
      );
    }

    // Step 4: Completion signal
    res.write(
      `data: ${JSON.stringify({
        type: "complete",
        fullResponse, // send full response at the end too
      })}\n\n`
    );

    res.write("\n");
    res.end();
  } catch (error) {
    console.error("❌ Streaming chat error:", error.message);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        error: error.message,
      })}\n\n`
    );
    res.end();
  }
}

// export async function sendMessageStream(req, res) {
//   try {
//     const { sessionId, message } = req.body;

//     if (!sessionId || !message) {
//       return res.status(400).json({ error: "Session ID and message are required" });
//     }

//     console.log(`💬 Processing streaming message for session ${sessionId}: "${message}"`);

//     // SSE headers
//     res.writeHead(200, {
//       "Content-Type": "text/event-stream",
//       "Cache-Control": "no-cache",
//       "Connection": "keep-alive",
//     });

//     // Step 1: Save user message
//     await saveMessage(sessionId, {
//       type: "user",
//       content: message,
//       timestamp: new Date().toISOString(),
//     });

//     // Step 2: Retrieve context
//     const searchResults = await searchNews(message, 5);
//     console.log(`🔍 Found ${searchResults.length} relevant articles`);

//     // Send sources immediately
//     res.write(`data: ${JSON.stringify({
//       type: "sources",
//       sources: searchResults.map((r) => ({
//         title: r.payload.title,
//         link: r.payload.link,
//         score: r.score,
//       })),
//     })}\n\n`);

//     // Step 3: Build context
//     const context = searchResults
//       .map((result) => `Title: ${result.payload.title}\nContent: ${result.payload.content}`)
//       .join("\n\n");

//     // Step 4: AI response (streaming)
//     const stream = await generateAIResponseStream(message, context);
//     let fullResponse = "";

//     try {
//       for await (const chunk of stream) {
//         const content = chunk.choices[0]?.delta?.content || "";
//         if (content) {
//           fullResponse += content;
//           res.write(`data: ${JSON.stringify({
//             type: "content",
//             content,
//           })}\n\n`);
//         }
//       }
//     } catch (streamError) {
//       console.error("❌ Error during stream:", streamError.message);
//       res.write(`data: ${JSON.stringify({ type: "error", error: streamError.message })}\n\n`);
//     }

//     // Step 5: Save assistant response
//     await saveMessage(sessionId, {
//       type: "bot",
//       content: fullResponse,
//       timestamp: new Date().toISOString(),
//       sources: searchResults.map((r) => ({
//         title: r.payload.title,
//         link: r.payload.link,
//         score: r.score,
//       })),
//     });

//     // Step 6: Completion signal
//     res.write(`data: ${JSON.stringify({ type: "complete" })}\n\n`);
//     res.write("\n");
//     res.end();
//   } catch (error) {
//     console.error("❌ Streaming chat error:", error.message);
//     res.write(`data: ${JSON.stringify({
//       type: "error",
//       error: error.message,
//     })}\n\n`);
//     res.end();
//   }
// }
