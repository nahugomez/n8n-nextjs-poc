"use client";

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarHeader({ isCollapsed, onToggle }: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-sidebar-border">
      <div className="flex items-center justify-between">
        {/* Logo/Icon */}
        <div className="flex items-center">
          {isCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="w-8 h-8 bg-sidebar-accent hover:bg-sidebar-accent/80"
            >
              <Image
                src="/logos/isotipo.svg"
                alt="App Logo"
                width={20}
                height={20}
                className="text-sidebar-foreground"
              />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Image
                src="/logos/isotipo.svg"
                alt="App Logo"
                width={24}
                height={24}
                className="text-sidebar-foreground"
              />
              <span className="text-sidebar-foreground font-semibold text-sm">
                Civix
              </span>
            </div>
          )}
        </div>
        
        {/* Collapse button - only show when expanded */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="p-2 hover:bg-sidebar-accent"
              >
                <ChevronLeft className="w-4 h-4 text-sidebar-foreground/70" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}