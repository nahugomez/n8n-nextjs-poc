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

export interface N8NResponse {
  response: {
    type: 'message' | 'audio';
    data: string;
    transcription?: string;
    userTranscription?: string;
  };
}