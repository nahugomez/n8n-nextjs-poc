"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ChatListItem } from './chat-list-item';

import { ChatSession } from '@/features/chat/types';

interface SidebarContentProps {
  isCollapsed: boolean;
  sessions: ChatSession[];
  onCreateNewChat: () => void;
  onSessionSelect?: (sessionId: string) => void;
  onSessionDelete?: (sessionId: string) => void;
}

export function SidebarContent({ 
  isCollapsed, 
  sessions, 
  onCreateNewChat, 
  onSessionSelect,
  onSessionDelete
}: SidebarContentProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          // Collapsed content
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-4"
          >
            {/* New Chat Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateNewChat}
              className="w-full p-3 bg-sidebar-accent hover:bg-sidebar-accent/80"
              title="New Chat"
            >
              <Plus className="w-5 h-5 text-sidebar-foreground" />
            </Button>
            
            {/* Chat List */}
            <div className="space-y-2">
              {sessions.map((session) => (
                <ChatListItem
                  key={session.id}
                  session={session}
                  isCollapsed={isCollapsed}
                  onClick={() => onSessionSelect?.(session.id)}
                  onDelete={onSessionDelete}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          // Expanded content
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-4"
          >
            {/* New Chat Button */}
            <Button
              variant="ghost"
              onClick={onCreateNewChat}
              className="w-full p-3 bg-sidebar-accent hover:bg-sidebar-accent/80 justify-start"
            >
              <Plus className="w-5 h-5 text-sidebar-foreground" />
              <span className="text-sidebar-foreground font-medium">New Chat</span>
            </Button>

            {/* Chat List */}
            <div className="space-y-2">
              <h3 className="text-sidebar-foreground/70 text-sm font-medium px-2 mb-2">
                Conversaciones recientes
              </h3>
              {sessions.map((session) => (
                <ChatListItem
                  key={session.id}
                  session={session}
                  isCollapsed={isCollapsed}
                  onClick={() => onSessionSelect?.(session.id)}
                  onDelete={onSessionDelete}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}