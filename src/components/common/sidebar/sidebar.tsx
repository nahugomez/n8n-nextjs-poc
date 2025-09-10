"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SidebarHeader } from './sidebar-header';
import { SidebarContent } from './sidebar-content';
import { SidebarFooter } from './sidebar-footer';

const ChatSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sample chat data
  const [chats] = useState([
    { id: 1, title: "React Components Discussion", timestamp: "2 hours ago" },
    { id: 2, title: "Next.js App Router Guide", timestamp: "1 day ago" },
    { id: 3, title: "TailwindCSS Best Practices", timestamp: "2 days ago" },
    { id: 4, title: "API Route Implementation", timestamp: "3 days ago" },
    { id: 5, title: "Database Schema Design", timestamp: "1 week ago" },
  ]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const createNewChat = () => {
    // Handle new chat creation
    console.log("Creating new chat...");
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
        chats={chats}
        onCreateNewChat={createNewChat}
      />
      
      <SidebarFooter isCollapsed={isCollapsed} />
    </motion.div>
  );
};

export default ChatSidebar;