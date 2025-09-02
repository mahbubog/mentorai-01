"use client";

import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";

export function ChatWindow() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 p-6 overflow-y-auto">
        <ChatMessages />
      </div>
      <div className="p-4 border-t bg-background">
        <ChatInput />
      </div>
    </div>
  );
}