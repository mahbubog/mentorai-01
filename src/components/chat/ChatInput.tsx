"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Mic, Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue, selectedFiles);
      setInputValue("");
      setSelectedFiles([]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-background px-2 py-1 rounded text-sm">
              <span className="truncate max-w-[200px]">{file.name}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeFile(index)}
                className="h-4 w-4 p-0"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="relative">
        <Textarea
          placeholder="Type your message here..."
          className="pr-32 py-3 min-h-[48px] resize-none"
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <label>
                <Button variant="ghost" size="icon" disabled={isLoading} asChild>
                  <span>
                    <Paperclip />
                    <span className="sr-only">Attach file</span>
                  </span>
                </Button>
                <input
                  type="file"
                  multiple
                  accept="image/*,text/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </TooltipTrigger>
            <TooltipContent>
              <p>Attach file</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <Mic />
                <span className="sr-only">Use microphone</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Use microphone</p>
            </TooltipContent>
          </Tooltip>
          <Button size="icon" onClick={handleSend} disabled={!inputValue.trim() || isLoading}>
            <Send />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
}