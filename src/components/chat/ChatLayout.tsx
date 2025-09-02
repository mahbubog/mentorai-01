"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";

const ChatLayout = () => {
  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full bg-background">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="hidden lg:block">
        <Sidebar />
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden lg:flex" />
      <ResizablePanel defaultSize={80}>
        <ChatWindow />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChatLayout;