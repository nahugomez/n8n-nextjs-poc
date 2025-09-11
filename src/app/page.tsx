"use client";

import { useState, useEffect } from "react";
import { PromptBox } from "@/components/prompt-input/prompt-input";
import { ChatBubble, ChatBubbleMessage, ChatBubbleAvatar } from "@/components/chat-bubble/chat-bubble";
import { MessageLoading } from "@/components/chat-bubble/message-loading";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  isLoading?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);

    const loadingMessage: Message = {
      id: 'loading-' + Date.now(),
      content: '',
      isUser: false,
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    setTimeout(() => {
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: "¡Hola! ¿En qué puedo ayudarte hoy?",
        isUser: false
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-background">
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
  );
}
