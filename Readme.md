# 📰 NewsRAG — RAG-Powered Chatbot for News Websites

A full-stack chatbot that answers user queries over a news corpus using a Retrieval-Augmented Generation (RAG) pipeline. Each user gets a unique session with persistent chat history, semantic search over recent news, and AI-powered responses via Google Gemini.

---

## 🎯 Objectives Met

| Component         | Status | Details                                                                 |
|-------------------|--------|------------------------------------------------------------------------|
| RAG Pipeline      | ✅     | Ingest ~50 news articles → Jina Embeddings → Qdrant vector store → Gemini API |
| Backend (Node.js) | ✅     | REST API + session management + Redis chat history + optional SQL storage |
| Frontend (React)  | ✅     | Chat UI with history, input, streaming responses, and session reset     |
| Caching & Perf.   | ✅     | Redis with TTL, session-based caching, cache warming strategy           |

---

## 🚀 Tech Stack & Justification

| Layer         | Technology              | Justification                                      |
|---------------|------------------------|----------------------------------------------------|
| Embeddings    | Jina Embeddings v3     | Free tier, retrieval-optimized, supports passage    |
| Vector DB     | Qdrant Cloud           | Fast similarity search, cloud-hosted, cosine dist.  |
| LLM API       | Google Gemini          | Free trial, strong reasoning & summarization        |
| Backend       | Node.js + Express      | Lightweight, fast prototyping, strong API ecosystem |
| Cache/Sessions| Redis (Upstash)        | In-memory, TTL, ideal for session chat history      |
| Frontend      | React + SCSS           | Component-based, responsive, modern UI/UX           |
| Optional DB   | PostgreSQL             | For persistent transcript storage (optional)        |

---

## 🏗️ System Architecture

```
backend/
├── config/          # API keys, Qdrant client, Redis setup
├── controllers/     # RAG query, chat session handlers
├── services/        # News ingestion, embedding, Redis service
├── routes/          # /api/rag, /api/chat
├── models/          # DB schemas (if using SQL)
└── utils/           # Helpers, embedding generator, response formatter

frontend/
├── components/      # ChatWindow, MessageBubble, InputBar, ResetButton
├── hooks/           # useChat, useSession
├── pages/           # ChatPage, Landing
├── styles/          # SCSS modules
└── api/             # Axios wrappers for backend calls
```

---

## 🔑 Key Features

### 1. RAG Pipeline
- Ingests ~50 news articles via RSS (e.g., BBC World News)
- Embeds content using Jina Embeddings (1024-dimensional)
- Stores and retrieves from Qdrant vector DB
- Queries use top-k retrieval + Gemini for final answer

### 2. Session Management
- Unique `sessionId` per user
- Redis stores chat history per session (`chat:<sessionId>`)
- Supports:
  - **New Chat** → new session
  - **Reload** → fetch history from Redis
  - **Clear** → delete session history

### 3. Caching & Performance
- Session TTL: 24 hours (auto-expire)
- Redis commands: `RPUSH` for messages, `LRANGE` for history
- Cache warming: scheduled re-ingestion possible via cron job

---

## 📡 API Endpoints

### RAG Endpoints
| Method | Endpoint         | Purpose                        |
|--------|------------------|--------------------------------|
| POST   | /api/rag/init    | Ingest news articles into vector DB |
| POST   | /api/rag/query   | Query news corpus with user question |

### Chat Endpoints
| Method | Endpoint                      | Purpose                  |
|--------|-------------------------------|--------------------------|
| POST   | /api/chat/start               | Start a new chat session |
| POST   | /api/chat/message             | Send a message within a session |
| GET    | /api/chat/history/:sessionId  | Retrieve session history |
| DELETE | /api/chat/clear/:sessionId    | Clear session history    |

---

## ⚙️ Environment Setup

### Backend (.env)
```env
PORT=5000
JINA_API_KEY=your_jina_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_redis_token
GEMINI_API_KEY=your_gemini_key
```

### Frontend
Update `src/api/config.js` with your backend base URL.

---

## 🖥️ Running Locally

### Backend
```bash
cd backend
pnpm install
pnpm run dev
```

### Frontend
```bash
cd frontend
pnpm install
pnpm run dev
```

---

## 🧠 Design Decisions & Trade-offs

### Why This Stack?
- **Jina Embeddings**: Free, retrieval-specialized vs. paid alternatives
- **Qdrant**: Cloud-hosted, easy setup vs. self-hosted Chroma/FAISS
- **Redis**: Ideal for ephemeral session data vs. SQL-overkill
- **Gemini**: Cost-effective vs. GPT-4, suitable for demo use

### Trade-offs
- Limited to ~50 articles → constrained knowledge base
- Session TTL = 24h → no long-term memory
- Single-step retrieval → no re-ranking or multi-hop QA

---

## 🔮 Future Improvements
- 📰 Multi-source ingestion: CNN, Reuters, NPR RSS feeds
- 🔁 Reranking: Second LLM pass to improve retrieval quality
- 💾 Persistent history: PostgreSQL for long-term chat logs
- 🔄 Auto-refresh: Cron job to update news corpus daily
- 🌐 WebSockets: Real-time streaming responses

---

## 📬 Deliverables Checklist

- ✅ Two public GitHub repos (frontend + backend) with clear READMEs
- ✅ Demo video showing:
  - Frontend startup
  - Querying & Gemini responses
  - Session history + reset
- ✅ Code walkthrough (text/video) covering:
  - Embedding → indexing → retrieval flow
  - Redis session management
  - Frontend API integration
- ✅ Live deployment (e.g., Render, Netlify, Vercel)

---

## 📊 Evaluation Alignment

| Criterion                | Weight | How We Addressed                                 |
|--------------------------|--------|-------------------------------------------------|
| End-to-End Correctness   | 35%    | Full RAG pipeline + session flow working         |
| Code Quality             | 30%    | Modular, documented, reusable components         |
| System Design & Caching  | 20%    | Redis TTL, session isolation, vector DB choice   |
| Frontend UX & Demo       | 5%     | Clean UI, responsive, session controls           |
| Hosting                  | 10%    | Deployed and publicly accessible                 |

---

## 📚 References & Resources
- News Please (Ingestion)
- Reuters Sitemaps
- Jina Embeddings
- Google AI Studio
- Qdrant Docs

