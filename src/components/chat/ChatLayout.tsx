"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { supabase } from "@/integrations/supabase/client";

interface Conversation {
  id: string;
  title: string;
  type: 'academic' | 'career';
  created_at: string;
  updated_at: string;
}

const ChatLayout = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversationType, setConversationType] = useState<'academic' | 'career'>('academic');

  // Load conversations on component mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error loading conversations:', error);
          return;
        }

        setConversations(data || []);
      } catch (error) {
        console.error('Error in loadConversations:', error);
      }
    };

    loadConversations();
  }, []);

  const handleNewChat = () => {
    setActiveConversation(null);
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setConversationType(conversation.type);
    }
  };

  const handleConversationCreated = (newConversationId: string) => {
    setActiveConversation(newConversationId);
    // Reload conversations to get the new one
    setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error reloading conversations:', error);
          return;
        }

        setConversations(data || []);
      } catch (error) {
        console.error('Error reloading conversations:', error);
      }
    }, 100);
  };

  const handleTypeChange = (type: 'academic' | 'career') => {
    setConversationType(type);
    setActiveConversation(null); // Start new conversation when switching types
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <div className="hidden lg:flex w-80 flex-shrink-0 border-r border-border">
        <Sidebar 
          conversations={conversations}
          activeConversation={activeConversation}
          conversationType={conversationType}
          onNewChat={handleNewChat}
          onConversationSelect={handleConversationSelect}
          onTypeChange={handleTypeChange}
        />
      </div>
      <div className="flex-1 min-w-0">
        <ChatWindow 
          conversationId={activeConversation ?? undefined}
          conversationType={conversationType}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  );
};

export default ChatLayout;