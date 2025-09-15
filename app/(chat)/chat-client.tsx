"use client";

import { useState, useEffect, useRef } from "react";
import { PromptBox } from "@/components/chat/prompt-input/prompt-input";
import { ChatBubble, ChatBubbleMessage, ChatBubbleAvatar } from "@/components/chat/chat-bubble/chat-bubble";
import { MessageLoading } from "@/components/chat/chat-bubble/message-loading";
import ChatSidebar from "@/components/common/sidebar/sidebar";
import { ChatSession, ChatMessage, N8NResponse } from "@/features/chat/types";
import {
  getChatSessions,
  saveChatSessions,
  getCurrentSessionId,
  setCurrentSessionId,
  createNewSession
} from "@/lib/client-storage";
import { sendToN8NWebhook } from "@/features/chat/server/actions";
import { AudioDialog } from "@/components/chat/audio-dialog/audio-dialog";
import { MarkdownMessage } from "@/components/chat/markdown-message";

const ChatClient = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [audioDialogOpen, setAudioDialogOpen] = useState(false);
  const [aiAudioResponse, setAiAudioResponse] = useState<{base64: string; transcription: string; userTranscription: string} | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (base64Audio: string) => {
    if (audioRef.current) {
      const audioUrl = `data:audio/webm;base64,${base64Audio}`;
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    const loadedSessions = getChatSessions();
    setSessions(loadedSessions);

    const currentSessionId = getCurrentSessionId();
    if (currentSessionId) {
      const session = loadedSessions.find(s => s.id === currentSessionId);
      if (session) {
        setCurrentSession(session);
      } else if (loadedSessions.length > 0) {
        setCurrentSession(loadedSessions[0]);
        setCurrentSessionId(loadedSessions[0].id);
      }
    } else if (loadedSessions.length > 0) {
      setCurrentSession(loadedSessions[0]);
      setCurrentSessionId(loadedSessions[0].id);
    }
  }, []);

  const handleSendMessage = (content: string) => {
    sendMessage(content, 'message');
  };

  const handleSendAudio = (audioBase64: string) => {
    // Return the promise so AudioDialog can await/catch errors
    return sendMessage(audioBase64, 'audio');
  };

  const sendMessage = (content: string, type: 'message' | 'audio'): Promise<void> => {
    let targetSession = currentSession;
    let shouldUpdateSessionsList = false;

    // If no current session exists, create a new one
    if (!targetSession) {
      targetSession = createNewSession();
      setCurrentSession(targetSession);
      setCurrentSessionId(targetSession.id);

      // Add the new session to the sessions list
      const updatedSessions = [targetSession, ...sessions];
      setSessions(updatedSessions);
      saveChatSessions(updatedSessions);
      shouldUpdateSessionsList = true;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: type === 'audio' ? 'Mensaje de audio (transcripción pendiente)' : content,
      isUser: true,
      timestamp: new Date(),
      type: type === 'message' ? 'text' : type,
      ...(type === 'audio' && { audioBase64: content })
    };

    const updatedSession = {
      ...targetSession,
      messages: [...targetSession.messages, userMessage],
      updatedAt: new Date()
    };

    setCurrentSession(updatedSession);
    updateSessions(updatedSession, shouldUpdateSessionsList);

    const loadingMessage: ChatMessage = {
      id: 'loading-' + Date.now(),
      content: '',
      isUser: false,
      isLoading: true,
      timestamp: new Date()
    };

    const sessionWithLoading = {
      ...updatedSession,
      messages: [...updatedSession.messages, loadingMessage]
    };

    setCurrentSession(sessionWithLoading);
    updateSessions(sessionWithLoading, shouldUpdateSessionsList);

    // Call n8n webhook to get AI response and propagate errors to callers
    return sendToN8NWebhook(targetSession.id, content, type)
      .then((n8nResponse: N8NResponse) => {
        const sessionWithoutLoading = {
          ...sessionWithLoading,
          messages: sessionWithLoading.messages.filter(msg => !msg.isLoading)
        };

        const responseType = String(n8nResponse.response.type ?? '')
          .trim()
          .replace(/^['"]+|['"]+$/g, '')
          .toLowerCase();

        if (responseType === 'audio') {
          // For audio responses, show the audio dialog instead of adding to chat
          setAiAudioResponse({
            base64: n8nResponse.response.data,
            transcription: n8nResponse.response.transcription || '',
            userTranscription: n8nResponse.response.userTranscription || ''
          });
          setAudioDialogOpen(true);

          // Add transcriptions to chat instead of audio files
          const userMessageIndex = sessionWithoutLoading.messages.findIndex(msg => msg.isUser && msg.type === 'audio');
          if (userMessageIndex !== -1 && n8nResponse.response.userTranscription) {
            // Update user message with transcription
            sessionWithoutLoading.messages[userMessageIndex] = {
              ...sessionWithoutLoading.messages[userMessageIndex],
              content: n8nResponse.response.userTranscription
            };
          }

          const aiMessage: ChatMessage = {
            id: Date.now().toString(),
            content: n8nResponse.response.transcription || 'Respuesta de audio',
            isUser: false,
            timestamp: new Date(),
            type: 'text', // Store as text since audio is handled in dialog
            isAudioTranscription: true
          };

          const finalSession = {
            ...sessionWithoutLoading,
            messages: [...sessionWithoutLoading.messages, aiMessage],
            updatedAt: new Date()
          };

          setCurrentSession(finalSession);
          updateSessions(finalSession, shouldUpdateSessionsList);
        } else {
          // For text responses, add normally to chat
          const aiMessage: ChatMessage = {
            id: Date.now().toString(),
            content: n8nResponse.response.data,
            isUser: false,
            timestamp: new Date(),
            type: 'text'
          };

          const finalSession = {
            ...sessionWithoutLoading,
            messages: [...sessionWithoutLoading.messages, aiMessage],
            updatedAt: new Date()
          };

          setCurrentSession(finalSession);
          updateSessions(finalSession, shouldUpdateSessionsList);
        }
      })
      .catch((error) => {
        console.error('Error calling n8n webhook:', error);

        // Remove loading message and show error
        const sessionWithoutLoading = {
          ...sessionWithLoading,
          messages: sessionWithLoading.messages.filter(msg => !msg.isLoading)
        };

        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          content: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.",
          isUser: false,
          timestamp: new Date()
        };

        const finalSession = {
          ...sessionWithoutLoading,
          messages: [...sessionWithoutLoading.messages, errorMessage],
          updatedAt: new Date()
        };

        setCurrentSession(finalSession);
        updateSessions(finalSession, shouldUpdateSessionsList);
        // Rethrow so upstream (AudioDialog) can handle UI state
        throw error;
      });
  };

  const updateSessions = (updatedSession: ChatSession, isNewSession: boolean = false) => {
    let updatedSessions;

    if (isNewSession) {
      // For new sessions, add it to the beginning of the list
      updatedSessions = [updatedSession, ...sessions];
    } else {
      // For existing sessions, update the session in the list
      updatedSessions = sessions.map(s =>
        s.id === updatedSession.id ? updatedSession : s
      );
    }

    setSessions(updatedSessions);
    saveChatSessions(updatedSessions);
  };

  const handleSessionSelect = (sessionId: string) => {
    if (sessionId === '') {
      // Clear current session for new chat
      setCurrentSession(null);
      setCurrentSessionId('');
    } else {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
        setCurrentSessionId(sessionId);
      }
    }
  };

  const handleSessionDelete = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    saveChatSessions(updatedSessions);

    // If the deleted session was the current one, clear the current session
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      setCurrentSessionId('');
    }
  };

  const messages = currentSession?.messages || [];

  return (
    <div className="flex w-full h-screen bg-background">
      <ChatSidebar
        sessions={sessions}
        onSessionSelect={handleSessionSelect}
        onSessionDelete={handleSessionDelete}
      />

      <div className="flex-1 flex flex-col">
        {messages.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-2xl mx-auto space-y-4">
                {messages.map((message) => (
                  <ChatBubble key={message.id} variant={message.isUser ? "sent" : "received"}>
                    {!message.isUser && (
                      <ChatBubbleAvatar fallback="AI" />
                    )}
                    <ChatBubbleMessage
                      variant={message.isUser ? "sent" : "received"}
                      isLoading={message.isLoading}
                    >
                      {message.isLoading ? null : (
                        <>
                          <MarkdownMessage content={message.content} />
                          {((message.type === 'audio' && message.audioBase64) || message.isAudioTranscription) && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <em>Transcripción de audio</em>
                            </div>
                          )}
                        </>
                      )}
                    </ChatBubbleMessage>
                    {message.isUser && (
                      <ChatBubbleAvatar fallback="Tú" />
                    )}
                  </ChatBubble>
                ))}
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="max-w-2xl mx-auto">
                <PromptBox
                  onSubmit={handleSendMessage}
                  onSendAudio={handleSendAudio}
                  onOpenAudioDialog={() => setAudioDialogOpen(true)}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
              <p className="text-3xl text-foreground mb-10">
                ¿En qué puedo ayudarte?
              </p>
              <PromptBox
                onSubmit={handleSendMessage}
                onSendAudio={handleSendAudio}
                onOpenAudioDialog={() => setAudioDialogOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Hidden audio element for playback */}
        <audio ref={audioRef} className="hidden" />

        {/* Unified Audio Dialog (always mounted) */}
        <AudioDialog
          open={audioDialogOpen}
          onOpenChange={(open) => {
            setAudioDialogOpen(open);
            if (!open) setAiAudioResponse(null);
          }}
          onSendAudio={handleSendAudio}
          aiAudioBase64={aiAudioResponse?.base64}
          aiTranscription={aiAudioResponse?.transcription}
          userTranscription={aiAudioResponse?.userTranscription}
          onPlaybackEnded={() => {
            // Clear AI audio/transcriptions so dialog returns to mic state
            setAiAudioResponse(null);
          }}
        />
      </div>
    </div>
  );
};

export default ChatClient;