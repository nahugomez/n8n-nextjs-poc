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
  transcription?: string;
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
    return parsedSessions.map((session: { id: string; title: string; createdAt: string; updatedAt: string; messages: Array<{ id: string; content: string; isUser: boolean; isLoading?: boolean; timestamp: string; type?: string; transcription?: string }> }) => ({
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

  // For audio, extract base64 data from data URL
  let processedData = message;
  if (type === 'audio' && message.startsWith('data:audio/webm;base64,')) {
    processedData = message.split(',')[1]; // Extract only the base64 part
  }

  const payload = {
    session_id: sessionId,
    type,
    data: processedData
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

// Audio utility functions
export function base64ToBlob(base64: string, mimeType: string = 'audio/webm'): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}

export function createAudioUrlFromBase64(base64: string): string {
  const blob = base64ToBlob(base64);
  return URL.createObjectURL(blob);
}

export function cleanupAudioUrl(url: string): void {
  URL.revokeObjectURL(url);
}
