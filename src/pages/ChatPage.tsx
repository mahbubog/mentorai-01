"use client";

import React from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow'; // Assuming ChatWindow exists or will be created

const ChatPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">AI Chat Assistant</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;