"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { MicIcon } from "@/components/icons/mic-icon";
import { StopIcon } from "@/components/icons/stop-icon";
import { PlayIcon } from "@/components/icons/play-icon";
import { MessageLoading } from "@/components/chat/chat-bubble/message-loading";

interface AudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendAudio: (audioBase64: string) => void;
  aiAudioBase64?: string;
  aiTranscription?: string;
  userTranscription?: string;
  onPlaybackEnded?: () => void;
}

// Internal Components
interface DialogHeaderProps {
  hasAIAudio: boolean;
  isRecording: boolean;
  isProcessing: boolean;
}

const DialogHeader = ({ hasAIAudio, isRecording, isProcessing }: DialogHeaderProps) => (
  <div className="text-center">
    <h2 className="text-lg font-semibold">
      {hasAIAudio ? "Respuesta de audio" : isProcessing ? "Procesando..." : "Grabar audio"}
    </h2>
    <p className="text-sm text-muted-foreground">
      {hasAIAudio
        ? "Reproduciendo la respuesta generada"
        : isProcessing
          ? "Estamos procesando tu mensaje..."
          : isRecording
            ? "Grabando... Habla ahora"
            : "Haz clic en el micrófono para comenzar a grabar"}
    </p>
  </div>
);

interface AudioRecordingButtonProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const AudioRecordingButton = ({ isRecording, onStartRecording, onStopRecording }: AudioRecordingButtonProps) => (
  <div
    className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
    onClick={isRecording ? onStopRecording : onStartRecording}
  >
    {isRecording ? (
      <div className="w-12 h-12 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
        <StopIcon className="w-6 h-6 text-white" />
      </div>
    ) : (
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
        <MicIcon className="w-8 h-8 text-white" />
      </div>
    )}
  </div>
);

interface AudioPlaybackButtonProps {
  isPlaying: boolean;
  onPlay: () => void;
}

const AudioPlaybackButton = ({ isPlaying, onPlay }: AudioPlaybackButtonProps) => (
  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
    <Button
      variant="ghost"
      size="icon"
      className="w-16 h-16"
      onClick={onPlay}
      disabled={isPlaying}
    >
      {isPlaying ? (
        <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse" />
      ) : (
        <PlayIcon className="w-8 h-8" />
      )}
    </Button>
  </div>
);

interface TranscriptionDisplayProps {
  aiTranscription?: string;
}

const TranscriptionDisplay = ({ aiTranscription }: TranscriptionDisplayProps) => (
  <>

    {aiTranscription && (
      <div className="text-center text-sm text-muted-foreground max-w-xs">
        <p><strong>Respuesta:</strong> {aiTranscription}</p>
      </div>
    )}
  </>
);

export function AudioDialog({ open, onOpenChange, onSendAudio, aiAudioBase64, aiTranscription, userTranscription, onPlaybackEnded }: AudioDialogProps) {
  const [isPlayingAI, setIsPlayingAI] = React.useState(false);
  const aiAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const { isRecording, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const hasAutoPlayedRef = React.useRef<string | null>(null);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo acceder al micrófono');
    }
  };

  const handleStopRecording = async () => {
    const audioBase64 = await stopRecording();
    if (audioBase64) {
      onSendAudio(audioBase64);
      // Show processing state while waiting for AI response
      setIsProcessing(true);
    }
  };

  const playAIAudio = () => {
    if (aiAudioBase64 && aiAudioRef.current) {
      const audioUrl = `data:audio/webm;base64,${aiAudioBase64}`;
      aiAudioRef.current.src = audioUrl;
      aiAudioRef.current.play().catch(console.error);
      setIsPlayingAI(true);
    }
  };

  const handleAIAudioEnded = () => {
    setIsPlayingAI(false);
    setIsProcessing(false);
    // Notify parent so it can clear AI audio and return to mic state
    // (keeping dialog open for next recording)
    // The parent can reset aiAudioBase64/aiTranscription/userTranscription
    onPlaybackEnded?.();
  };

  React.useEffect(() => {
    if (!open) {
      resetRecording();
      setIsPlayingAI(false);
      setIsProcessing(false);
      hasAutoPlayedRef.current = null;
    }
  }, [open, resetRecording]);

  // Auto-play AI audio when it arrives
  React.useEffect(() => {
    if (!open) return;
    if (!aiAudioBase64) return;
    if (hasAutoPlayedRef.current === aiAudioBase64) return;
    setIsProcessing(false);
    hasAutoPlayedRef.current = aiAudioBase64;
    playAIAudio();
  }, [aiAudioBase64, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <DialogHeader
            hasAIAudio={!!aiAudioBase64}
            isRecording={isRecording}
            isProcessing={isProcessing}
          />

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-6">
              <MessageLoading />
              <p className="mt-3 text-sm text-muted-foreground">Procesando respuesta...</p>
            </div>
          ) : aiAudioBase64 ? (
            <AudioPlaybackButton
              isPlaying={isPlayingAI}
              onPlay={playAIAudio}
            />
          ) : (
            <AudioRecordingButton
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
            />
          )}

          <TranscriptionDisplay
            aiTranscription={aiTranscription}
          />

          {/* Hidden audio element for AI audio playback */}
          <audio
            ref={aiAudioRef}
            className="hidden"
            onEnded={handleAIAudioEnded}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}