"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SidebarFooterProps {
  isCollapsed: boolean;
}

export function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  return (
    <div className="border-t border-sidebar-border p-4">
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
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
                N
              </AvatarFallback>
            </Avatar>
          </motion.div>
        ) : (
          <motion.div
            key="expanded-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <Avatar>
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
                N
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-sm font-medium truncate">
                Nahuel Gómez Suárez
              </p>
              <p className="text-sidebar-foreground/50 text-xs">
                Online
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}