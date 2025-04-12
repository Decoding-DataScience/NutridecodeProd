import React, { useState, useCallback, useEffect } from 'react';
import { Volume2, Loader2, Pause, Play, StopCircle, RotateCcw } from 'lucide-react';
import { textToSpeech, playAudio, pauseAudio, resumeAudio, stopAudio } from '../services/elevenlabs';
import toast from 'react-hot-toast';

interface VoiceoverButtonProps {
  text: string;
  className?: string;
}

const VoiceoverButton: React.FC<VoiceoverButtonProps> = ({ text, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<ArrayBuffer | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handleVoiceover = useCallback(async () => {
    if (isPlaying && !isPaused) return;

    try {
      if (isPaused) {
        resumeAudio();
        setIsPaused(false);
        return;
      }

      setIsLoading(true);
      setIsPlaying(true);

      let buffer = audioBuffer;
      if (!buffer) {
        toast.loading('Converting text to speech...', {
          id: 'tts-loading',
          duration: 10000
        });

        buffer = await textToSpeech(text);
        setAudioBuffer(buffer);
        toast.dismiss('tts-loading');
      }

      toast.loading('Playing audio...', {
        id: 'tts-playing',
        duration: 30000
      });

      await playAudio(buffer);
      toast.dismiss('tts-playing');
      handleStop();
    } catch (error) {
      console.error('Voiceover error:', error);
      toast.dismiss('tts-loading');
      toast.dismiss('tts-playing');
      toast.error(error instanceof Error ? error.message : 'Failed to play voiceover');
      handleStop();
    } finally {
      setIsLoading(false);
    }
  }, [text, isPlaying, isPaused, audioBuffer]);

  const handlePause = useCallback(() => {
    if (!isPlaying || isLoading) return;
    pauseAudio();
    setIsPaused(true);
    toast.success('Audio paused');
  }, [isPlaying, isLoading]);

  const handleStop = useCallback(() => {
    stopAudio();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const handleRestart = useCallback(() => {
    if (audioBuffer) {
      stopAudio();
      setIsPlaying(true);
      setIsPaused(false);
      playAudio(audioBuffer).catch((error) => {
        console.error('Error restarting audio:', error);
        toast.error('Failed to restart audio');
        handleStop();
      });
    }
  }, [audioBuffer]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleVoiceover}
        disabled={isLoading}
        className={`inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl ${
          isLoading ? 'opacity-75 cursor-not-allowed' : ''
        } ${className}`}
        title={isPaused ? "Resume speech" : "Listen to analysis"}
      >
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Converting...</span>
          </div>
        ) : isPaused ? (
          <div className="flex items-center">
            <Play className="h-5 w-5 mr-2" />
            <span>Resume</span>
          </div>
        ) : (
          <div className="flex items-center">
            <Volume2 className="h-5 w-5 mr-2" />
            <span>Talk to NutriDecode</span>
          </div>
        )}
      </button>

      {isPlaying && !isLoading && (
        <div className="flex items-center gap-2">
          {!isPaused ? (
            <button
              onClick={handlePause}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Pause speech"
            >
              <Pause className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleRestart}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Restart speech"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleStop}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            title="Stop speech"
          >
            <StopCircle className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceoverButton; 