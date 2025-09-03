"use client";

import { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sidebar } from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
    <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full bg-background">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="hidden lg:block">
        <Sidebar 
          conversations={conversations}
          activeConversation={activeConversation}
          conversationType={conversationType}
          onNewChat={handleNewChat}
          onConversationSelect={handleConversationSelect}
          onTypeChange={handleTypeChange}
        />
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden lg:flex" />
      <ResizablePanel defaultSize={80}>
        <ChatWindow 
          conversationId={activeConversation}
          conversationType={conversationType}
          onConversationCreated={handleConversationCreated}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChatLayout;