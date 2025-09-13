"use server";

import { revalidatePath } from "next/cache";
import { ChatSession, ChatMessage, N8NResponse } from "../types";

// In a real application, this would be replaced with database operations
// For now, we'll keep the localStorage logic but move it to server-side patterns

export async function getChatSessions(): Promise<ChatSession[]> {
  // This would be replaced with database calls in a real app
  // For now, we return empty array since localStorage isn't available server-side
  return [];
}

export async function saveChatSessions(sessions: ChatSession[]): Promise<void> {
  // This would be replaced with database operations
  // Server-side storage implementation would go here
}

export async function createNewSession(): Promise<ChatSession> {
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

export async function getCurrentSessionId(): Promise<string | null> {
  // Server-side session management would go here
  return null;
}

export async function setCurrentSessionId(sessionId: string): Promise<void> {
  // Server-side session management would go here
}

export async function sendToN8NWebhook(
  sessionId: string,
  message: string,
  type: 'message' | 'audio' = 'message'
): Promise<N8NResponse> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('N8N webhook URL is not configured');
  }

  const payload = {
    session_id: sessionId,
    type,
    data: type === 'audio' ? message : message
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}