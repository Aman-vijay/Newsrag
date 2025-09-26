import React, { useState, useEffect, useRef } from 'react';
import { useChatStream } from '@/hooks';
import { chatApi } from '@/api';
import { SessionControls, MessageBubble, MessageInput, Loader } from '@/components';
import './ChatWindow.scss';

const ChatWindow = ({ sessionId, onSessionError, initialMessage }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { 
    isStreaming, 
    streamError, 
    sendStreamMessage, 
    sendNormalMessage 
  } = useChatStream();

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when sessionId changes
  useEffect(() => {
    if (sessionId) {
      handleLoadHistory();
    }
  }, [sessionId]);

  // Handle initial message from landing page
  useEffect(() => {
    if (sessionId && initialMessage && !hasProcessedInitialMessage) {
      setHasProcessedInitialMessage(true);
      // Small delay to ensure session is ready
      setTimeout(() => {
        handleSendMessage(initialMessage, true);
      }, 500);
    }
  }, [sessionId, initialMessage, hasProcessedInitialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewSession = () => {
    // This should trigger session creation at parent level
    // Navigate to landing page or trigger new session creation
    if (onSessionError) {
      onSessionError('new_session_requested');
    }
  };

  const handleClearHistory = async () => {
    if (!sessionId) return;
    
    try {
      await chatApi.clearChatHistory(sessionId);
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const handleLoadHistory = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const response = await chatApi.getChatHistory(sessionId);
      const history = response.history || [];
      setMessages(history);
      
      // If there's history, don't process initial message
      if (history.length > 0) {
        setHasProcessedInitialMessage(true);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      if (onSessionError) {
        onSessionError('history_load_failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message, useStreaming = true) => {
    if (!sessionId || !message.trim()) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    if (useStreaming) {
      await handleStreamingMessage(message);
    } else {
      await handleNormalMessage(message);
    }
  };

  const handleStreamingMessage = async (message) => {
    // Create placeholder for bot response
    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      type: 'bot',
      content: '',
      timestamp: new Date().toISOString(),
      sources: [],
      isStreaming: true
    };
    setMessages(prev => [...prev, botMessage]);

    try {
      await sendStreamMessage(
        sessionId,
        message,
        // onChunk
        (chunk) => {
          if (chunk.type === 'sources') {
            setMessages(prev => prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, sources: chunk.sources }
                : msg
            ));
          } else if (chunk.type === 'content') {
            setMessages(prev => prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, content: chunk.fullContent }
                : msg
            ));
          }
        },
        // onComplete
        (result) => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId 
              ? { 
                  ...msg, 
                  content: result.content,
                  sources: result.sources,
                  isStreaming: false 
                }
              : msg
          ));
        },
        // onError
        (error) => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId 
              ? { 
                  ...msg, 
                  content: `Sorry, I encountered an error. Please try again.`,
                  isError: true,
                  isStreaming: false 
                }
              : msg
          ));
          console.error('Streaming error:', error);
        }
      );
    } catch (error) {
      console.error('Streaming failed:', error);
    }
  };

  const handleNormalMessage = async (message) => {
    setIsLoading(true);
    
    try {
      const response = await sendNormalMessage(sessionId, message);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.response,
        timestamp: new Date().toISOString(),
        sources: response.sources
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Message sending failed:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if no sessionId
  if (!sessionId) {
    return (
      <div className="chat-window">
        <div className="chat-loading">
          <Loader message="Initializing chat..." />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <SessionControls
        sessionId={sessionId}
        onNewSession={handleNewSession}
        onClearHistory={handleClearHistory}
        onLoadHistory={handleLoadHistory}
        isLoading={isLoading || isStreaming}
      />

      <div className="messages-container">
        {messages.length === 0 && !initialMessage ? (
          <div className="welcome-message">
            <div className="welcome-content">
              <h2>🗞️ Welcome to News Chat!</h2>
              <p>I'm your AI news assistant. Ask me anything about recent news and I'll help you find relevant, up-to-date information.</p>
              
              <div className="welcome-features">
                <div className="feature">
                  <span className="feature-icon">🔍</span>
                  <span>Search through latest news articles</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📰</span>
                  <span>Get sources and references</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">⚡</span>
                  <span>Real-time streaming responses</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message}
              isStreaming={message.isStreaming}
            />
          ))
        )}
        
        {isLoading && !isStreaming && (
          <div className="typing-indicator">
            <div className="bot-avatar-small">🤖</div>
            <div className="typing-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading || isStreaming}
        isStreaming={isStreaming}
      />

      {streamError && (
        <div className="error-toast">
          <span className="toast-icon">⚠️</span>
          <span>{streamError}</span>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;