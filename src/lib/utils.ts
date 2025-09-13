import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  isLoading?: boolean;
  timestamp: Date;
  type?: 'text' | 'audio';
  audioBase64?: string;
  transcription?: string;
  isAudioTranscription?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function getChatSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const sessions = localStorage.getItem('chatSessions');
    if (!sessions) return [];
    
    const parsedSessions = JSON.parse(sessions);
    
    // Convert string dates back to Date objects
    return parsedSessions.map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: session.messages.map((message: any) => ({
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
  const sessionId = generateSessionId();
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

export interface N8NResponse {
  response: {
    type: 'message' | 'audio';
    data: string;
    transcription?: string;
    userTranscription?: string;
  };
}

export async function sendToN8NWebhook(
  sessionId: string,
  message: string,
  type: 'message' | 'audio' = 'message'
): Promise<N8NResponse> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    throw new Error('N8N webhook URL is not configured');
  }

  const payload = {
    session_id: sessionId,
    type,
    data: type === 'audio' ? message : message // For audio, message should be base64
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
