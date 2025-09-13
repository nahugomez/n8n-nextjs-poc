"use client";

import { MessageSquare, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ChatSession } from '@/features/chat/types';

interface ChatListItemProps {
  session: ChatSession;
  isCollapsed: boolean;
  onClick?: () => void;
  onDelete?: (sessionId: string) => void;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  
  return date.toLocaleDateString('es-ES');
}

export function ChatListItem({ session, isCollapsed, onClick, onDelete }: ChatListItemProps) {
  if (isCollapsed) {
    return (
      <div className="relative group">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className="w-full p-3 hover:bg-sidebar-accent"
          title={session.title}
        >
          <MessageSquare className="w-5 h-5 text-sidebar-foreground/70" />
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(session.id);
            }}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            title="Eliminar chat"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative group flex items-center">
      <Button
        variant="ghost"
        onClick={onClick}
        className="w-full p-3 hover:bg-sidebar-accent justify-start h-auto flex-1"
      >
        <div className="flex items-start gap-3">
          <MessageSquare className="w-4 h-4 text-sidebar-foreground/70 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sidebar-foreground text-sm font-medium truncate">
              {session.title}
            </p>
            <p className="text-sidebar-foreground/50 text-xs mt-1">
              {formatTimestamp(session.updatedAt)}
            </p>
          </div>
        </div>
      </Button>
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(session.id);
          }}
          className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 flex-shrink-0"
          title="Eliminar chat"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}