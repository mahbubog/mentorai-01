import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";

export const ChatPreview = () => {
  return (
    <Card className="mt-12 max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl shadow-primary/10">
      <div className="p-4">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              AI Mentor Chat
            </p>
          </div>
        </div>
        <div className="space-y-4 p-4">
          <div className="flex items-start gap-3 justify-start">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 rounded-lg p-3 text-sm max-w-xs">
              <p>How do I prepare for a software engineering interview?</p>
            </div>
          </div>
          <div className="flex items-start gap-3 justify-end">
            <div className="bg-primary text-primary-foreground rounded-lg p-3 text-sm max-w-xs">
              <p>
                Great question! Here's a comprehensive guide to help you
                prepare...
              </p>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shrink-0">
              <Bot size={20} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};