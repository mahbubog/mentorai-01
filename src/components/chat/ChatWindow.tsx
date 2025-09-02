"use client";

import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { useState } from "react";
import { Message } from "./ChatMessage";
import { supabase } from "@/integrations/supabase/client";

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("gemini-chat", {
        body: { messages: newMessages },
      });

      if (error) {
        throw new Error(`Function invocation failed: ${error.message}`);
      }
      
      if (data.error) {
        throw new Error(`Gemini API Error: ${data.error}`);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    } catch (err) {
      console.error(err);
      const errorContent = err instanceof Error ? err.message : "An unknown error occurred.";
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `দুঃখিত, একটি ত্রুটি ঘটেছে: ${errorContent}. অনুগ্রহ করে নিশ্চিত করুন আপনার Gemini API কী Supabase-এ সঠিকভাবে সেট করা আছে।`,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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