"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// SVG Icons
const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

const StopIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="6" y="6" width="12" height="12" rx="1"></rect>
  </svg>
);

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 5.25L12 18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.75 12L12 5.25L5.25 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface AudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendAudio: (audioBase64: string) => void;
  aiAudioBase64?: string;
  aiTranscription?: string;
  userTranscription?: string;
}

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <XIcon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export function AudioDialog({ open, onOpenChange, onSendAudio, aiAudioBase64, aiTranscription, userTranscription }: AudioDialogProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordedAudio, setRecordedAudio] = React.useState<string | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [isPlayingAI, setIsPlayingAI] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const aiAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setRecordedAudio(base64data);
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecordedAudio = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(console.error);
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
  };

  const handleSend = () => {
    if (recordedAudio) {
      // Extract base64 data from data URL (remove "data:audio/webm;base64," prefix)
      const base64Data = recordedAudio.split(',')[1];
      onSendAudio(base64Data);
      resetRecording();
      // Dialog remains open to receive AI response
    }
  };

  const resetRecording = () => {
    setIsRecording(false);
    setRecordedAudio(null);
    setAudioBlob(null);
    setIsPlayingAI(false);
    audioChunksRef.current = [];
  };

  React.useEffect(() => {
    if (!open) {
      resetRecording();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {aiAudioBase64 ? "Respuesta de audio" : "Grabar audio"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {aiAudioBase64
                ? "Escucha la respuesta y cierra el diálogo"
                : isRecording
                  ? "Grabando... Habla ahora"
                  : recordedAudio
                    ? "Audio grabado. Haz clic para reproducir"
                    : "Haz clic en el micrófono para comenzar a grabar"}
            </p>
          </div>

          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
               onClick={aiAudioBase64 ? undefined : (isRecording ? stopRecording : startRecording)}>
            {aiAudioBase64 ? (
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16"
                onClick={playAIAudio}
                disabled={isPlayingAI}
              >
                {isPlayingAI ? (
                  <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse" />
                ) : (
                  <PlayIcon className="w-8 h-8" />
                )}
              </Button>
            ) : isRecording ? (
              <div className="w-12 h-12 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <StopIcon className="w-6 h-6 text-white" />
              </div>
            ) : recordedAudio ? (
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16"
                onClick={playRecordedAudio}
              >
                <PlayIcon className="w-8 h-8" />
              </Button>
            ) : (
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                <MicIcon className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* Transcription display */}
          {userTranscription && (
            <div className="text-center text-sm text-muted-foreground max-w-xs">
              <p><strong>Tu mensaje:</strong> {userTranscription}</p>
            </div>
          )}
          
          {aiTranscription && (
            <div className="text-center text-sm text-muted-foreground max-w-xs">
              <p><strong>Respuesta:</strong> {aiTranscription}</p>
            </div>
          )}

          <div className="flex gap-2">
            {aiAudioBase64 ? (
              <Button
                onClick={() => onOpenChange(false)}
                className="gap-2"
              >
                Cerrar
              </Button>
            ) : recordedAudio ? (
              <>
                <Button
                  onClick={resetRecording}
                  variant="outline"
                  className="gap-2"
                >
                  <XIcon className="w-4 h-4" />
                  Regrabar
                </Button>
                <Button
                  onClick={handleSend}
                  className="gap-2"
                >
                  <SendIcon className="w-4 h-4" />
                  Enviar
                </Button>
              </>
            ) : null}
          </div>

          {/* Hidden audio elements for playback */}
          <audio ref={audioRef} className="hidden" />
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