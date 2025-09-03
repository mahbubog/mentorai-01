"use client";

import { useState, useEffect } from "react";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "./ChatMessage";

interface ChatWindowProps {
  conversationId?: string;
  conversationType?: 'academic' | 'career';
  onConversationCreated?: (id: string) => void;
}

const ChatWindow = ({ conversationId, conversationType = 'academic', onConversationCreated }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          role: msg.is_user ? 'user' : 'assistant',
          content: msg.content,
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error in loadMessages:', error);
      }
    };

    loadMessages();
  }, [conversationId]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          const formattedMessage: Message = {
            id: newMessage.id,
            role: newMessage.is_user ? 'user' : 'assistant',
            content: newMessage.content,
          };

          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            if (prev.some(msg => msg.id === formattedMessage.id)) {
              return prev;
            }
            return [...prev, formattedMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSendMessage = async (messageContent: string) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      console.log('Sending message to gemini-chat function...');
      
      // Get auth session
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        throw new Error('Please log in to send messages');
      }

      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { 
          message: messageContent,
          conversationId,
          conversationType
        },
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

      // If a new conversation was created, notify parent
      if (data.conversationId && data.conversationId !== conversationId) {
        onConversationCreated?.(data.conversationId);
      }

    } catch (error: any) {
      console.error('Error in handleSendMessage:', error);
      
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