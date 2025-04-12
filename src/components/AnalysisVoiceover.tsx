import React, { useState, useCallback } from 'react';
import { Volume2, Loader2, Pause, Play, StopCircle } from 'lucide-react';
import { textToSpeech, playAudio, pauseAudio, resumeAudio, stopAudio } from '../services/elevenlabs';
import { generateAnalysisSummary } from '../services/openai';
import type { AnalysisResult } from '../services/openai';
import toast from 'react-hot-toast';

interface AnalysisVoiceoverProps {
  analysis: AnalysisResult | {
    type: 'ingredient';
    name: string;
    details: string;
    productName: string;
    ingredients: {
      list: string[];
      preservatives: string[];
      additives: string[];
      antioxidants: string[];
      stabilizers: string[];
    };
  };
  className?: string;
}

const AnalysisVoiceover: React.FC<AnalysisVoiceoverProps> = ({ analysis, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Voiceover error:', error);
    setError(errorMessage);
    toast.error(errorMessage);
    handleStop();
  };

  const handleVoiceover = useCallback(async () => {
    if (isPlaying && !isPaused) return;
    setError(null);

    try {
      if (isPaused) {
        resumeAudio();
        setIsPaused(false);
        return;
      }

      setIsLoading(true);
      setIsPlaying(true);

      // Generate summary based on analysis type
      toast.loading('Generating analysis summary...', {
        id: 'summary-loading',
        duration: 10000
      });

      let summary;
      if ('type' in analysis && analysis.type === 'ingredient') {
        summary = `Analysis for ${analysis.name}. ${analysis.details}`;
      } else {
        summary = await generateAnalysisSummary(analysis as AnalysisResult);
      }
      
      toast.dismiss('summary-loading');

      // Convert to speech
      toast.loading('Converting to speech...', {
        id: 'tts-loading',
        duration: 10000
      });

      const audioBuffer = await textToSpeech(summary);
      toast.dismiss('tts-loading');

      // Play audio
      toast.loading('Playing analysis...', {
        id: 'tts-playing',
        duration: 30000
      });

      await playAudio(audioBuffer);

      toast.dismiss('tts-playing');
      toast.success('Analysis playback completed');
      handleStop();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      toast.dismiss('summary-loading');
      toast.dismiss('tts-loading');
      toast.dismiss('tts-playing');
    }
  }, [analysis, isPlaying, isPaused]);

  const handlePause = useCallback(() => {
    if (!isPlaying || isLoading) return;
    try {
      pauseAudio();
      setIsPaused(true);
      toast.success('Audio paused');
    } catch (error) {
      handleError(error);
    }
  }, [isPlaying, isLoading]);

  const handleStop = useCallback(() => {
    try {
      stopAudio();
      setIsPlaying(false);
      setIsPaused(false);
      setError(null);
    } catch (error) {
      handleError(error);
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleVoiceover}
        disabled={isLoading}
        className={`inline-flex items-center justify-center px-6 py-3 rounded-lg ${
          error
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700'
        } transition-all shadow-lg hover:shadow-xl ${
          isLoading ? 'opacity-75 cursor-not-allowed' : ''
        } ${className}`}
        title={isPaused ? "Resume analysis" : "Listen to analysis"}
      >
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Processing...</span>
          </div>
        ) : isPaused ? (
          <div className="flex items-center">
            <Play className="h-5 w-5 mr-2" />
            <span>Resume</span>
          </div>
        ) : (
          <div className="flex items-center">
            <Volume2 className="h-5 w-5 mr-2" />
            <span>Listen to Analysis</span>
          </div>
        )}
      </button>

      {isPlaying && !isLoading && (
        <>
          {!isPaused && (
            <button
              onClick={handlePause}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Pause analysis"
            >
              <Pause className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleStop}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            title="Stop analysis"
          >
            <StopCircle className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default AnalysisVoiceover; 