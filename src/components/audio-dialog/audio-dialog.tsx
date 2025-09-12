"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AIVoiceInput } from "@/components/ai-voice-input/ai-voice-input";
import { useState } from "react";

export interface AudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAudioRecorded: (audioData: string, duration: number) => void;
}

export function AudioDialog({ open, onOpenChange, onAudioRecorded }: AudioDialogProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const handleRecordingStart = () => {
    setIsRecording(true);
    setRecordedAudio(null);
    setRecordingDuration(0);
  };

  const handleRecordingStop = (duration: number, audioBlob?: Blob) => {
    setIsRecording(false);
    setRecordingDuration(duration);
    
    if (audioBlob) {
      // Convert blob to base64 for n8n webhook
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        setRecordedAudio(base64Audio);
        onAudioRecorded(base64Audio, duration);
      };
      reader.readAsDataURL(audioBlob);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setIsRecording(false);
    setRecordedAudio(null);
    setRecordingDuration(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isRecording}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {isRecording ? "Grabando audio..." : "Grabar audio"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center p-6">
          <AIVoiceInput
            onStart={handleRecordingStart}
            onStop={handleRecordingStop}
            demoMode={false}
            className="w-full"
          />
          
          {recordedAudio && (
            <div className="mt-4 text-sm text-green-600">
              Audio grabado correctamente ({Math.round(recordingDuration)} segundos)
            </div>
          )}
          
          {!isRecording && recordedAudio && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}