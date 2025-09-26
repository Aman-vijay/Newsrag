import React, { useState, useEffect, useRef } from 'react';
import { useSession, useChatStream } from '@/hooks';
import { chatApi } from '@/api';
import { SessionControls, MessageBubble, MessageInput, Loader } from '@/components';
import './ChatWindow.scss';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { 
    sessionId, 
    isCreatingSession, 
    sessionError, 
    createSession, 
    resetSession 
  } = useSession();
  
  const { 
    isStreaming, 
    streamError, 
    sendStreamMessage, 
    sendNormalMessage 
  } = useChatStream();

  // Initialize session on mount
  useEffect(() => {
    createSession();
  }, [createSession]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewSession = async () => {
    setMessages([]);
    resetSession();
    await createSession();
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
      setMessages(response.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
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
                  content: 'Sorry, I encountered an error. Please try again.',
                  isError: true,
                  isStreaming: false 
                }
              : msg
          ));
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

  // Show loading state while creating session
  if (isCreatingSession) {
    return (
      <div className="chat-window">
        <div className="chat-loading">
          <Loader message="Creating new session..." />
        </div>
      </div>
    );
  }

  // Show error state if session creation failed
  if (sessionError) {
    return (
      <div className="chat-window">
        <div className="chat-error">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <h3>Failed to create session</h3>
            <p>{sessionError}</p>
            <button onClick={createSession} className="retry-button">
              Try Again
            </button>
          </div>
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
        {messages.length === 0 ? (
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

      {(streamError || sessionError) && (
        <div className="error-toast">
          <span className="toast-icon">⚠️</span>
          <span>{streamError || sessionError}</span>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;