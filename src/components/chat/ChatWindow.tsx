"use client";

import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { useState } from "react";
import { Message } from "./ChatMessage";

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `This is a simulated response to: "${content}"`,
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 p-6 overflow-y-auto">
        <ChatMessages messages={messages} />
      </div>
      <div className="p-4 border-t bg-background">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}