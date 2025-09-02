"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Mic, Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ChatInput() {
  return (
    <div className="relative">
      <Textarea
        placeholder="Type your message here..."
        className="pr-32 py-3 min-h-[48px] resize-none"
        rows={1}
      />
      <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Paperclip />
              <span className="sr-only">Attach file</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Attach file</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Mic />
              <span className="sr-only">Use microphone</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Use microphone</p>
          </TooltipContent>
        </Tooltip>
        <Button size="icon">
          <Send />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  );
}