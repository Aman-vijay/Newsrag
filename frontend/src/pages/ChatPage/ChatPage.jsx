// src/pages/ChatPage/ChatPage.jsx
import React from 'react';
import { ChatWindow } from '@/components';
import './ChatPage.scss';

const ChatPage = () => {
  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;