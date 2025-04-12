import React, { useState, useCallback } from 'react';
import { Mic, Loader2, MessageSquare } from 'lucide-react';
import { chatWithNutriDecode, speakResponse } from '../services/voiceChat';
import toast from 'react-hot-toast';

interface VoiceChatButtonProps {
  className?: string;
}

const VoiceChatButton: React.FC<VoiceChatButtonProps> = ({ className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceChat = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Voice input is not supported in your browser');
      return;
    }

    try {
      setIsListening(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);

        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          // Here you would normally send the audioBlob to ElevenLabs for transcription
          // For now, we'll simulate with a fixed question
          const simulatedQuestion = "What are healthy alternatives to processed snacks?";
          
          toast.loading('Processing your question...', { id: 'processing' });
          const response = await chatWithNutriDecode(simulatedQuestion);
          toast.dismiss('processing');

          toast.loading('Generating voice response...', { id: 'speaking' });
          await speakResponse(response);
          toast.dismiss('speaking');
          toast.success('Response complete');
        } catch (error) {
          console.error('Voice chat error:', error);
          toast.error('Failed to process voice chat');
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      toast.success('Listening... (Click again to stop)');

      // Stop recording after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }
      }, 5000);
    } catch (error) {
      console.error('Voice chat error:', error);
      toast.error('Failed to start voice chat');
      setIsListening(false);
    }
  }, []);

  return (
    <button
      onClick={handleVoiceChat}
      disabled={isProcessing}
      className={`inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl ${
        isProcessing ? 'opacity-75 cursor-not-allowed' : ''
      } ${className}`}
      title="Start voice chat"
    >
      {isProcessing ? (
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Processing...</span>
        </div>
      ) : isListening ? (
        <div className="flex items-center">
          <Mic className="h-5 w-5 animate-pulse mr-2" />
          <span>Listening...</span>
        </div>
      ) : (
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          <span>Chat with NutriDecode</span>
        </div>
      )}
    </button>
  );
};

export default VoiceChatButton; 