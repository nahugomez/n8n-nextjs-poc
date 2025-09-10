"use client";

import { MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Chat {
  id: number;
  title: string;
  timestamp: string;
}

interface ChatListItemProps {
  chat: Chat;
  isCollapsed: boolean;
  onClick?: () => void;
}

export function ChatListItem({ chat, isCollapsed, onClick }: ChatListItemProps) {
  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className="w-full p-3 hover:bg-sidebar-accent"
        title={chat.title}
      >
        <MessageSquare className="w-5 h-5 text-sidebar-foreground/70" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="w-full p-3 hover:bg-sidebar-accent justify-start h-auto"
    >
      <div className="flex items-start gap-3">
        <MessageSquare className="w-4 h-4 text-sidebar-foreground/70 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sidebar-foreground text-sm font-medium truncate">
            {chat.title}
          </p>
          <p className="text-sidebar-foreground/50 text-xs mt-1">
            {chat.timestamp}
          </p>
        </div>
      </div>
    </Button>
  );
}