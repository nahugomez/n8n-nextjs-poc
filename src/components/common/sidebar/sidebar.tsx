"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ChevronLeft, 
  MessageSquare,
  Menu
} from 'lucide-react';

// Avatar component (simplified version of shadcn/ui avatar)
const Avatar = ({ children, className = "" }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarFallback = ({ children, className = "" }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-900 ${className}`}>
    {children}
  </div>
);

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
      width: 280,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    collapsed: {
      width: 64,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
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
      className="h-screen bg-slate-900 border-r border-slate-700 flex flex-col relative"
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {/* Logo/Icon */}
          <div className="flex items-center">
            {isCollapsed ? (
              <button
                onClick={toggleSidebar}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-300" />
              </button>
            ) : (
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-slate-400 rounded-sm" />
              </div>
            )}
          </div>
          
          {/* Collapse button - only show when expanded */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content - Scrollable middle section */}
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
              <button
                onClick={createNewChat}
                className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center"
                title="New Chat"
              >
                <Plus className="w-5 h-5 text-slate-300" />
              </button>
              
              {/* Chat List */}
              <div className="space-y-2">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    className="w-full p-3 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
                    title={chat.title}
                  >
                    <MessageSquare className="w-5 h-5 text-slate-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            // Expanded content
            <motion.div
              key="expanded"
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="p-4 space-y-4"
            >
              {/* New Chat Button */}
              <button
                onClick={createNewChat}
                className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-3"
              >
                <Plus className="w-5 h-5 text-slate-300" />
                <span className="text-slate-300 font-medium">New Chat</span>
              </button>

              {/* Chat List */}
              <div className="space-y-2">
                <h3 className="text-slate-400 text-sm font-medium px-2 mb-2">Recent Chats</h3>
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    className="w-full p-3 hover:bg-slate-700 rounded-lg transition-colors text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-300 text-sm font-medium truncate">
                          {chat.title}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {chat.timestamp}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4">
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.div
              key="collapsed-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  N
                </AvatarFallback>
              </Avatar>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-footer"
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex items-center gap-3"
            >
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  N
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 text-sm font-medium truncate">
                  Nahuel Gómez Suárez
                </p>
                <p className="text-slate-500 text-xs">
                  Online
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChatSidebar;