"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { MicIcon } from "@/components/icons/mic-icon";
import { StopIcon } from "@/components/icons/stop-icon";
import { PlayIcon } from "@/components/icons/play-icon";
import { MessageLoading } from "@/components/chat/chat-bubble/message-loading";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/plugins/record";

interface AudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendAudio: (audioBase64: string) => void | Promise<void>;
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
  const { isRecording, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const hasAutoPlayedRef = React.useRef<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const processingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearProcessingTimer = React.useCallback(() => {
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
  }, []);

  // WaveSurfer: Recording (live mic) waveform
  const recordWaveContainerRef = React.useRef<HTMLDivElement | null>(null);
  const recordWSRef = React.useRef<any>(null);
  const recordPluginRef = React.useRef<any>(null);

  // WaveSurfer: AI playback waveform
  const aiWaveContainerRef = React.useRef<HTMLDivElement | null>(null);
  const aiWSRef = React.useRef<any>(null);

  const base64ToBlob = React.useCallback((base64: string, mimeType: string) => {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeType });
  }, []);

  const guessAudioMime = React.useCallback((base64: string): string => {
    if (!base64) return "audio/mpeg";
    // ID3 header -> MP3
    if (base64.startsWith("SUQz")) return "audio/mpeg";
    // EBML header (\x1A E5 DF A3) typical of WebM
    if (base64.startsWith("GkXf")) return "audio/webm";
    // RIFF header -> WAV
    if (base64.startsWith("UklG")) return "audio/wav";
    // OggS header -> OGG
    if (base64.startsWith("T2dnUw")) return "audio/ogg";
    // Fallback
    return "audio/mpeg";
  }, []);

  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      await startRecording();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo acceder al micrófono');
    }
  };

  const handleStopRecording = async () => {
    const audioBase64 = await stopRecording();
    if (audioBase64) {
      // Show processing state while waiting for AI response
      setErrorMessage(null);
      setIsProcessing(true);
      // Start a safety timeout to avoid being stuck in processing forever
      clearProcessingTimer();
      processingTimerRef.current = setTimeout(() => {
        setIsProcessing(false);
        setErrorMessage("No pudimos procesar tu audio. Intenta nuevamente.");
      }, 30000);

      // Call user handler and catch sync/async errors
      try {
        await Promise.resolve(onSendAudio(audioBase64));
      } catch (_err) {
        clearProcessingTimer();
        setIsProcessing(false);
        setErrorMessage("Ocurrió un error procesando tu audio. Intenta nuevamente.");
      }
    }
  };

  const playAIAudio = () => {
    if (aiWSRef.current) {
      aiWSRef.current.play();
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
      setErrorMessage(null);
      clearProcessingTimer();
      // Cleanup WaveSurfer instances
      try { recordPluginRef.current?.stopMic?.(); } catch {}
      recordWSRef.current?.destroy?.();
      recordPluginRef.current = null;
      recordWSRef.current = null;
      aiWSRef.current?.destroy?.();
      aiWSRef.current = null;
    }
  }, [open, resetRecording]);

  // Init/destroy live recording waveform with RecordPlugin
  React.useEffect(() => {
    if (!isRecording) {
      try { recordPluginRef.current?.stopMic?.(); } catch {}
      recordWSRef.current?.destroy?.();
      recordPluginRef.current = null;
      recordWSRef.current = null;
      return;
    }

    if (recordWaveContainerRef.current && !recordWSRef.current) {
      const ws = WaveSurfer.create({
        container: recordWaveContainerRef.current,
        waveColor: "#60a5fa", // blue-400
        progressColor: "#3b82f6", // blue-500
        height: 80,
        cursorWidth: 0,
        interact: false,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
      });

      const record = ws.registerPlugin(
        RecordPlugin.create({
          scrollingWaveform: true,
          renderRecordedAudio: false,
        })
      );

      // Start mic and surface any device errors
      record.startMic().catch((err: unknown) => {
        console.error("RecordPlugin startMic error:", err);
      });

      recordWSRef.current = ws;
      recordPluginRef.current = record;
    }

    return () => {
      // Ensures cleanup if component unmounts while recording
      try { recordPluginRef.current?.stopMic?.(); } catch {}
      recordWSRef.current?.destroy?.();
      recordPluginRef.current = null;
      recordWSRef.current = null;
    };
  }, [isRecording]);

  // Setup AI waveform and auto-play when new audio arrives
  React.useEffect(() => {
    if (!open) return;
    if (!aiAudioBase64) return;
    if (!aiWaveContainerRef.current) return;
    // Clear any pending processing timeout and error
    clearProcessingTimer();
    setErrorMessage(null);
    setIsProcessing(false);

    // Create instance if needed
    if (!aiWSRef.current) {
      const ws = WaveSurfer.create({
        container: aiWaveContainerRef.current,
        waveColor: "#a1a1aa", // zinc-400
        progressColor: "#22c55e", // green-500
        height: 80,
        cursorWidth: 1,
        normalize: true,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
      });
      ws.on("play", () => setIsPlayingAI(true));
      ws.on("pause", () => setIsPlayingAI(false));
      ws.on("finish", handleAIAudioEnded);
      aiWSRef.current = ws;
    } else {
      // Stop any current playback before loading new audio
      aiWSRef.current.stop();
    }

    const ws: any = aiWSRef.current;
    const onReady = () => {
      if (hasAutoPlayedRef.current !== aiAudioBase64) {
        hasAutoPlayedRef.current = aiAudioBase64;
        ws.play();
      }
    };
    ws.once("ready", onReady);

    const mimeType = guessAudioMime(aiAudioBase64);
    const blob = base64ToBlob(aiAudioBase64, mimeType);
    ws.loadBlob(blob);

    return () => {
      ws.un("ready", onReady);
    };
  }, [aiAudioBase64, open, base64ToBlob, guessAudioMime]);

  // Destroy AI waveform if audio is cleared while dialog stays open
  React.useEffect(() => {
    if (!open) return;
    if (!aiAudioBase64 && aiWSRef.current) {
      aiWSRef.current.destroy?.();
      aiWSRef.current = null;
    }
  }, [aiAudioBase64, open]);

  const handleRetry = React.useCallback(() => {
    clearProcessingTimer();
    setErrorMessage(null);
    setIsProcessing(false);
    setIsPlayingAI(false);
    hasAutoPlayedRef.current = null;
    aiWSRef.current?.destroy?.();
    aiWSRef.current = null;
  }, [clearProcessingTimer]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <DialogHeader
            hasAIAudio={!!aiAudioBase64}
            isRecording={isRecording}
            isProcessing={isProcessing}
          />

          {/* Waveforms */}
          {isRecording && !aiAudioBase64 && (
            <div className="w-full">
              <div ref={recordWaveContainerRef} className="w-full h-20 rounded-md bg-muted overflow-hidden" />
            </div>
          )}

          {aiAudioBase64 && (
            <div className="w-full">
              <div ref={aiWaveContainerRef} className="w-full h-20 rounded-md bg-muted overflow-hidden" />
            </div>
          )}

          {errorMessage ? (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-sm text-red-600">{errorMessage}</p>
              <Button className="mt-3" variant="outline" onClick={handleRetry}>Intentar de nuevo</Button>
            </div>
          ) : isProcessing ? (
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
        </div>
      </DialogContent>
    </Dialog>
  );
}