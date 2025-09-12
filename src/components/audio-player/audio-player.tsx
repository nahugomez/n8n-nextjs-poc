"use client";

import { Play, Pause, Square } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioData: string; // base64 audio data
  className?: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

export function AudioPlayer({ 
  audioData, 
  className, 
  autoPlay = false,
  onPlay,
  onPause,
  onEnd 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioData) {
      const url = `data:audio/webm;base64,${audioData}`;
      setAudioUrl(url);
      
      // Cleanup previous audio URL
      return () => {
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
      };
    }
  }, [audioData]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      const audio = audioRef.current;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnd = () => {
        setIsPlaying(false);
        onEnd?.();
      };
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnd);
      
      if (autoPlay) {
        audio.play().then(() => {
          setIsPlaying(true);
          onPlay?.();
        });
      }
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnd);
      };
    }
  }, [audioUrl, autoPlay, onPlay, onEnd]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        onPlay?.();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-gray-100 rounded-lg", className)}>
      <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />
      
      <button
        onClick={togglePlay}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        disabled={!audioUrl}
      >
        {isPlaying ? (
          <Square className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
      
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-gray-600 min-w-[35px]">
          {formatTime(currentTime)}
        </span>
        
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 bg-gray-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
          disabled={!audioUrl}
        />
        
        <span className="text-xs text-gray-600 min-w-[35px]">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}