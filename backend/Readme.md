# NewsRAG Backend API

A backend service for NewsRag that implements Retrieval-Augmented Generation (RAG) for news articles using vector embeddings and semantic search.


## 🏗️ Architecture

```
├── configs/           # Configuration files
│   ├── embeddings.js  # Jina AI embedding configuration
│   └── qdrant.js      # Qdrant vector database configuration
├── controllers/       # Route controllers
│   ├── ragController.js    # RAG operations (ingest, query)
│   └── chatController.js   # Chat functionality
├── services/          # Business logic services
│   ├── newsService.js      # News fetching and processing
│   ├── redisService.js     # Redis caching service
│   └── chatService.js      # Chat and conversation management
├── routes/            # API route definitions
│   ├── ragRoutes.js        # RAG endpoints
│   └── chatRoutes.js       # Chat endpoints
├── models/            # Data models and schemas
└── utils/             # Utility functions
```

## 🚀 Features

### Core RAG Implementation
- **News Ingestion**: Fetches articles from multiple RSS feeds (BBC, CNN, NPR, Washington Post)
- **Vector Embeddings**: Uses Jina AI's `jina-embeddings-v3` model for high-quality embeddings
- **Vector Storage**: Stores embeddings in Qdrant cloud vector database
- **Semantic Search**: Enables semantic search across news articles
- **Real-time Processing**: Processes articles with detailed logging and error handling

## 🛠️ Technology Stack

### Core Dependencies
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for Node.js
- **Jina AI Provider**: Vector embeddings generation
- **Qdrant**: Vector database for semantic search
- **Redis**: Caching and session management
- **RSS Parser**: News feed parsing
- **OpenAI**: Chat completions and language model

### Development Tools
- **Nodemon**: Development server with hot reload
- **dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing
- **PNPM**: Package manager

## 📡 API Endpoints

### RAG Operations

#### Initialize News Database
```http
POST /api/rag/init
```
Fetches news articles, generates embeddings, and stores them in Qdrant.

**Response:**
```json
{
  "message": "News ingested & stored in Qdrant ✅"
}
```

#### Query News
```http
POST /api/rag/query
```
Performs semantic search on news articles.

**Request Body:**
```json
{
  "query": "your search query here"
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "article_id",
      "score": 0.95,
      "payload": {
        "title": "Article Title",
        "content": "Article content...",
        "link": "https://..."
      }
    }
  ]
}
```

### Chat Operations

#### Start Chat Session
```http
POST /api/chat/start
```
Initializes a new chat session.

#### Send Message
```http
POST /api/chat/message
```
Sends a message and gets AI response with context from news articles.

### Health Check
```http
GET /health
```
Returns server health status.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000

# Jina AI Configuration
JINA_API_KEY=your_jina_api_key_here

# Qdrant Configuration
QDRANT_URL=https://your-qdrant-instance.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key

# Upstash  Redis Configuration 
Upstash_REDIS_URL=your_redis_url
Upstash_REDIS_TOKEN=your_redis_token

# OpenAI Configuration (for chat)
OPENAI_API_KEY=your_openai_api_key
```

### Supported RSS Feeds

The system automatically tries multiple RSS feeds for reliability:
- BBC News World RSS


## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PNPM package manager
- Jina AI API key
- Qdrant cloud instance
- Redis instance 

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Newsrag/backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start development server**
   ```bash
   pnpm run dev
   ```

5. **Initialize the news database**
   ```bash
   curl -X POST http://localhost:5000/api/rag/init
   ```

### Production Deployment

1. **Build and start**
   ```bash
   pnpm start
   ```

2. **Health check**
   ```bash
   curl http://localhost:5000/health
   ```

## 🔧 Usage Examples

### Initialize News Database
```javascript
const response = await fetch('http://localhost:5000/api/rag/init', {
  method: 'POST'
});
const result = await response.json();
console.log(result.message);
```

### Query News Articles
```javascript
const response = await fetch('http://localhost:5000/api/rag/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'artificial intelligence developments'
  })
});
const results = await response.json();
console.log(results.results);
```

## 🎯 Key Implementation Details

### Vector Embeddings
- Uses Jina AI's `jina-embeddings-v3` model
- Generates 1024-dimensional embeddings
- Optimized for retrieval tasks with `retrieval.passage` input type


