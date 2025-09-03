"use client";

import { Button } from "@/components/ui/button";
import {
  MessageSquarePlus,
  History,
  FileText,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationType } from "./ConversationType";
import { supabase } from "@/integrations/supabase/client";

interface Conversation {
  id: string;
  title: string;
  type: 'academic' | 'career';
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversation: string | null;
  conversationType: 'academic' | 'career';
  onNewChat: () => void;
  onConversationSelect: (id: string) => void;
  onTypeChange: (type: 'academic' | 'career') => void;
}

export function Sidebar({ 
  conversations, 
  activeConversation, 
  conversationType,
  onNewChat, 
  onConversationSelect, 
  onTypeChange 
}: SidebarProps) {
  const filteredConversations = conversations.filter(conv => conv.type === conversationType);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-full flex-col bg-muted/40 border-r border-border">
      <div className="p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start mb-4"
          onClick={onNewChat}
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        
        <ConversationType 
          type={conversationType}
          onTypeChange={onTypeChange}
        />
      </div>

      <div className="flex-1 px-4">
        <ScrollArea className="h-full">
          <div className="space-y-2">
            <h3 className="px-2 text-sm font-semibold text-muted-foreground">
              Recent Conversations
            </h3>
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant={activeConversation === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left p-2 h-auto"
                  onClick={() => onConversationSelect(conversation.id)}
                >
                  <div className="flex flex-col items-start w-full">
                    <div className="font-medium text-sm truncate w-full">
                      {conversation.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(conversation.updated_at)}
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No conversations yet. Start a new chat!
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator />
      
      <div className="p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <History className="mr-2 h-4 w-4" />
          History
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <FileText className="mr-2 h-4 w-4" />
          Uploaded Files
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = '/settings'}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = '/help'}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Help & FAQ
        </Button>
        <Separator className="my-2" />
        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = '/';
        }}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}