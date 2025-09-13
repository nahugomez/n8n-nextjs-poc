import { useCallback, useRef, useState } from "react";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  resetRecording: () => void;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!mediaRecorderRef.current || !isRecording) {
      return null;
    }

    return new Promise((resolve) => {
      const currentMediaRecorder = mediaRecorderRef.current;
      if (!currentMediaRecorder) {
        resolve(null);
        return;
      }

      currentMediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64Data = base64data.split(',')[1];

          // Stop all audio tracks
          if (currentMediaRecorder.stream) {
            currentMediaRecorder.stream.getTracks().forEach(track => track.stop());
          }

          resolve(base64Data);
        };
        reader.readAsDataURL(audioBlob);
      };

      currentMediaRecorder.stop();
      setIsRecording(false);
    });
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setIsRecording(false);
    audioChunksRef.current = [];
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    resetRecording
  };
};