import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks';
import { MessageInput, Loader, ErrorDisplay } from '@/components';
import './LandingPage.scss';

const LandingPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const { sessionId, isCreatingSession: isCreating, createSession } = useSession();

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    setError(null);

    try {
      // Create new session using the centralized hook
      const newSessionId = await createSession();
      
      // Navigate to chat page with the message
      navigate(`/chat/${newSessionId}`, { 
        state: { initialMessage: message }
      });
    } catch (err) {
      setError(err.message);
      console.error('Failed to create session:', err);
    }
  };

  const handleExistingSession = () => {
    if (sessionId) {
      navigate(`/chat/${sessionId}`);
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1>🗞️ News Chat Assistant</h1>
            <p>Get instant answers about the latest news with AI-powered search and analysis</p>
            
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">🔍</span>
                <h3>Smart Search</h3>
                <p>Search through thousands of news articles instantly</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">📰</span>
                <h3>Source Citations</h3>
                <p>Get reliable sources and references for every answer</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">⚡</span>
                <h3>Real-time Updates</h3>
                <p>Streaming responses for the latest information</p>
              </div>
            </div>
          </div>
        </div>

        <div className="chat-starter">
          <div className="starter-content">
            <h2>Start your news conversation</h2>
            <p>Ask me anything about recent news, current events, or trending topics</p>
            
            {sessionId && (
              <div className="existing-session">
                <p>You have an existing chat session</p>
                <button 
                  onClick={handleExistingSession}
                  className="continue-button"
                >
                  Continue Previous Chat
                </button>
              </div>
            )}

            <div className="message-input-container">
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={isCreating}
                placeholder="Ask me about the latest news..."
                showStreamingToggle={false}
              />
            </div>

            {isCreating && (
              <div className="creating-session">
                <Loader message="Creating your chat session..." />
              </div>
            )}

            {error && (
              <div className="error-message">
                <ErrorDisplay 
                  error={error}
                  title="Session Creation Failed"
                  onDismiss={() => setError(null)}
                  type="error"
                />
              </div>
            )}
          </div>
        </div>

        <div className="examples-section">
          <h3>Try asking about:</h3>
          <div className="example-queries">
            <button 
              className="example-button"
              onClick={() => handleSendMessage("What are the latest tech news today?")}
              disabled={isCreating}
            >
              "What are the latest tech news today?"
            </button>
            <button 
              className="example-button"
              onClick={() => handleSendMessage("Tell me about recent climate change developments")}
              disabled={isCreating}
            >
              "Tell me about recent climate change developments"
            </button>
            <button 
              className="example-button"
              onClick={() => handleSendMessage("What's happening in the stock market?")}
              disabled={isCreating}
            >
              "What's happening in the stock market?"
            </button>
            <button 
              className="example-button"
              onClick={() => handleSendMessage("Latest sports news and scores")}
              disabled={isCreating}
            >
              "Latest sports news and scores"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;