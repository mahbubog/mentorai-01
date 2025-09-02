"use client";

import { Button } from "@/components/ui/button";
import {
  MessageSquarePlus,
  Book,
  Briefcase,
  History,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <div className="flex h-full flex-col p-4 bg-muted/40 border-r">
      <div className="flex-1 space-y-2">
        <Button variant="outline" className="w-full justify-start">
          <MessageSquarePlus className="mr-2" />
          New Chat
        </Button>
        <Separator className="my-4" />
        <h3 className="px-4 text-sm font-semibold text-muted-foreground">Assistants</h3>
        <Button variant="ghost" className="w-full justify-start">
          <Book className="mr-2" />
          Academic Assistant
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Briefcase className="mr-2" />
          Career Assistant
        </Button>
        <Separator className="my-4" />
        <h3 className="px-4 text-sm font-semibold text-muted-foreground">Library</h3>
        <Button variant="ghost" className="w-full justify-start">
          <History className="mr-2" />
          History
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <FileText className="mr-2" />
          Uploaded Files
        </Button>
      </div>
      <div className="mt-auto space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <HelpCircle className="mr-2" />
          Help & FAQ
        </Button>
        <Separator />
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600">
          <LogOut className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}