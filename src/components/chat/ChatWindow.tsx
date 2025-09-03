"use client";

import { useState, useEffect } from "react";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "./ChatMessage";
import { nanoid } from "nanoid";

interface ChatWindowProps {
  conversationId?: string;
  conversationType?: 'academic' | 'career';
  onConversationCreated?: (id: string) => void;
}

const ChatWindow = ({ conversationId, conversationType = 'academic', onConversationCreated }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load messages from localStorage when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const savedMessages = localStorage.getItem(`chat_${conversationId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading messages from localStorage:', error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      localStorage.setItem(`chat_${conversationId}`, JSON.stringify(messages));
    }
  }, [messages, conversationId]);

  const handleSendMessage = async (messageContent: string, files?: File[]) => {
    if (isLoading) return;

    // Create a unique conversation ID if not exists
    const currentConversationId = conversationId || nanoid();
    
    // Add user message immediately to UI
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: messageContent,
    };

    // Add thinking message immediately
    const thinkingMessage: Message = {
      id: 'thinking',
      role: 'assistant',
      content: 'thinking...',
    };

    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setIsLoading(true);

    try {
      console.log('Sending message to gemini-chat function...');
      
      // Get auth session
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        throw new Error('Please log in to send messages');
      }

      // Prepare request body
      const requestBody: any = {
        message: messageContent,
        conversationId: currentConversationId,
        conversationType,
        chatHistory: messages.filter(m => m.id !== 'thinking')
      };

      // Handle file uploads if any
      if (files && files.length > 0) {
        const filePromises = files.map(async (file) => {
          const reader = new FileReader();
          return new Promise((resolve) => {
            reader.onload = () => {
              resolve({
                name: file.name,
                type: file.type,
                content: reader.result
              });
            };
            reader.readAsDataURL(file);
          });
        });
        
        const fileContents = await Promise.all(filePromises);
        requestBody.files = fileContents;
      }

      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: requestBody,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (data?.error) {
        console.error('AI API error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.content) {
        console.error('No content in response:', data);
        throw new Error('No response content received from AI');
      }

      // Replace thinking message with actual AI response
      setMessages(prev => {
        const newMessages = prev.filter(m => m.id !== 'thinking');
        const aiMessage: Message = {
          id: nanoid(),
          role: 'assistant',
          content: data.content,
        };
        return [...newMessages, aiMessage];
      });

      // If a new conversation was created, notify parent
      if (data.conversationId && data.conversationId !== conversationId) {
        onConversationCreated?.(data.conversationId);
      }

    } catch (error: any) {
      console.error('Error in handleSendMessage:', error);
      
      // Remove thinking message on error
      setMessages(prev => prev.filter(m => m.id !== 'thinking'));
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-hidden">
        <ChatMessages messages={messages} />
      </div>
      <div className="p-4 border-t border-border bg-card">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export { ChatWindow };
export default ChatWindow;