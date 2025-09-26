# 📰 NewsRAG Frontend

> A modern, AI-powered news chat interface built with React, Vite, and SCSS


A sophisticated chat interface for the NewsRAG project that enables users to interact with AI-powered news analysis through a beautiful, responsive web application. Features real-time streaming responses, intelligent session management, and modern UI/UX design patterns.

---

## ✨ Key Features

### 🤖 **Intelligent Chat Interface**
- **Real-time Streaming**: Live AI responses with typing indicators
- **Message Threading**: Organized conversation flow with source citations
- **Smart Sessions**: Automatic session management with history persistence
- **Error Handling**: Graceful error states with retry mechanisms

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with fluid layouts
- **Dark/Light Themes**: Automatic theme detection with manual override
- **Smooth Animations**: Micro-interactions and transitions for enhanced UX
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation support

### ⚡ **Performance Optimized**
- **Code Splitting**: Lazy-loaded components for faster initial loads
- **Efficient State Management**: Custom hooks for optimal re-renders
- **Optimized Assets**: Compressed images and minified stylesheets
- **Progressive Enhancement**: Works without JavaScript for core functionality

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Package manager (npm, yarn, or pnpm)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
pnpm install
# or
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API endpoints

# Start development server
pnpm dev
# or
npm run dev
```

### Environment Variables

```bash
# Backend API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_API_URL_PROD=https://your-api-domain.com/api
VITE_IN_PROD=false

# Optional: Analytics & Monitoring
VITE_ANALYTICS_ID=your-analytics-id
```

---

## 🏗️ Project Architecture

```
frontend/
├── 📁 public/                 # Static assets & PWA manifest
│   ├── favicon.ico
│   └── index.html
├── 📁 src/
│   ├── 📁 api/                # API layer & HTTP clients
│   │   ├── chatApi.js         # Chat endpoint handlers
│   │   ├── ragApi.js          # RAG system integration
│   │   └── index.js           # API barrel exports
│   ├── 📁 components/         # Reusable UI components
│   │   ├── 📁 ChatWindow/     # Main chat interface
│   │   ├── 📁 MessageBubble/  # Individual message display
│   │   ├── 📁 MessageInput/   # User input component
│   │   ├── 📁 SessionControls/# Session management UI
│   │   ├── 📁 SourcesList/    # Source citations display
│   │   ├── 📁 Loader/         # Loading states
│   │   └── index.js           # Component exports
│   ├── 📁 hooks/              # Custom React hooks
│   │   ├── useSession.js      # Session state management
│   │   ├── useChatStream.js   # Streaming chat logic
│   │   └── index.js           # Hook exports
│   ├── 📁 pages/              # Page-level components
│   │   ├── 📁 ChatPage/       # Main chat page
│   │   └── index.js           # Page exports
│   ├── 📁 styles/             # Global styles & design system
│   │   ├── _variables.scss    # Design tokens & CSS custom properties
│   │   ├── _mixins.scss       # Reusable SCSS mixins
│   │   ├── _globals.scss      # Global styles & resets
│   │   └── index.scss         # Style entry point
│   ├── 📁 utils/              # Utility functions
│   │   ├── apiHelpers.js      # HTTP request utilities
│   │   ├── config.js          # App configuration
│   │   ├── constants.js       # App constants
│   │   ├── helpers.js         # General helper functions
│   │   └── index.js           # Utility exports
│   ├── App.jsx                # Root application component
│   └── main.jsx               # Application entry point
├── 📄 .env.example            # Environment variables template
├── 📄 vite.config.js          # Vite configuration
├── 📄 package.json            # Dependencies & scripts
└── 📄 README.md               # This file
```

---

## 🎯 Core Components

### 💬 **ChatWindow**
Main chat interface that orchestrates the entire conversation experience.

```jsx
// Handles message streaming, session management, and UI state
<ChatWindow />
```

**Features:**
- Real-time message streaming
- Session persistence
- Error handling with retry logic
- Loading states and animations

### 📝 **MessageBubble**
Individual message display with rich formatting and source citations.

```jsx
// Renders user and AI messages with different styles
<MessageBubble message={message} isStreaming={isStreaming} />
```

**Features:**
- Distinct user/AI styling
- Source link integration
- Streaming text animation
- Error state handling

### ⌨️ **MessageInput**
Advanced input component with smart features and controls.

```jsx
// Handles user input with suggestion pills and streaming toggle
<MessageInput onSendMessage={handleSend} disabled={isLoading} />
```

**Features:**
- Auto-resizing textarea
- Suggested question pills
- Streaming mode toggle
- Character count and validation

---

