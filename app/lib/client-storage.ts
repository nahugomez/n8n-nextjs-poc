"use client";

import { ChatSession, ChatMessage } from "@/features/chat/types";

export function getChatSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];

  try {
    const sessions = localStorage.getItem('chatSessions');
    if (!sessions) return [];

    const parsedSessions = JSON.parse(sessions);

    // Convert string dates back to Date objects
    return parsedSessions.map((session: { createdAt: string; updatedAt: string; messages: Array<{ timestamp: string }> }) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: session.messages.map((message) => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }))
    }));
  } catch {
    return [];
  }
}

export function saveChatSessions(sessions: ChatSession[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save chat sessions:', error);
  }
}

export function createNewSession(): ChatSession {
  const sessionId = crypto.randomUUID();
  const now = new Date();

  return {
    id: sessionId,
    title: 'Nueva conversación',
    createdAt: now,
    updatedAt: now,
    messages: []
  };
}

export function getCurrentSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('currentSessionId');
  } catch {
    return null;
  }
}

export function setCurrentSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('currentSessionId', sessionId);
  } catch (error) {
    console.error('Failed to set current session ID:', error);
  }
}