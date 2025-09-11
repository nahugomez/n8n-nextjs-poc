"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SidebarHeader } from './sidebar-header';
import { SidebarContent } from './sidebar-content';
import { SidebarFooter } from './sidebar-footer';
import { ChatSession, getChatSessions, createNewSession, saveChatSessions, setCurrentSessionId } from '@/lib/utils';

interface ChatSidebarProps {
  sessions?: ChatSession[];
  onSessionSelect?: (sessionId: string) => void;
  onSessionDelete?: (sessionId: string) => void;
}

const ChatSidebar = ({ sessions = [], onSessionSelect, onSessionDelete }: ChatSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const createNewChat = () => {
    // Clear current session without creating a new one
    // The session will be created when the user sends the first message
    if (onSessionSelect) {
      onSessionSelect(''); // Empty string indicates no active session
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    
    if (onSessionSelect) {
      onSessionSelect(sessionId);
    }
  };

  const sidebarVariants = {
    expanded: {
      width: 280
    },
    collapsed: {
      width: 64
    }
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    },
    collapsed: {
      opacity: 0,
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <motion.div
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col relative"
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <SidebarHeader 
        isCollapsed={isCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      <SidebarContent
        isCollapsed={isCollapsed}
        sessions={sessions}
        onCreateNewChat={createNewChat}
        onSessionSelect={handleSessionSelect}
        onSessionDelete={onSessionDelete}
      />
      
      <SidebarFooter isCollapsed={isCollapsed} />
    </motion.div>
  );
};

export default ChatSidebar;