"use client";

import { useState, useEffect } from "react";
import { PromptBox } from "@/components/prompt-input/prompt-input";
import { ChatBubble, ChatBubbleMessage, ChatBubbleAvatar } from "@/components/chat-bubble/chat-bubble";
import { MessageLoading } from "@/components/chat-bubble/message-loading";
import ChatSidebar from "@/components/common/sidebar/sidebar";
import { 
  ChatSession, 
  ChatMessage, 
  getChatSessions, 
  saveChatSessions, 
  getCurrentSessionId, 
  setCurrentSessionId,
  createNewSession,
  sendToN8NWebhook,
  N8NResponse
} from "@/lib/utils";

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

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
      content,
      isUser: true,
      timestamp: new Date()
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

    // Call n8n webhook to get AI response
    sendToN8NWebhook(targetSession.id, content)
      .then((n8nResponse: N8NResponse) => {
        const sessionWithoutLoading = {
          ...sessionWithLoading,
          messages: sessionWithLoading.messages.filter(msg => !msg.isLoading)
        };

        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          content: n8nResponse.response.data,
          isUser: false,
          timestamp: new Date()
        };

        const finalSession = {
          ...sessionWithoutLoading,
          messages: [...sessionWithoutLoading.messages, aiMessage],
          updatedAt: new Date()
        };

        setCurrentSession(finalSession);
        updateSessions(finalSession, shouldUpdateSessionsList);
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
                      {message.isLoading ? null : message.content}
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
                <PromptBox onSubmit={handleSendMessage} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
              <p className="text-3xl text-foreground mb-10">
                ¿En qué puedo ayudarte?
              </p>
              <PromptBox onSubmit={handleSendMessage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
