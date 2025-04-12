import React, { useState, useEffect } from 'react';
import { X, Mic, Square, Loader2 } from 'lucide-react';
import { startVoiceChat, stopVoiceChat } from '../services/voiceChat';
import toast from 'react-hot-toast';

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
}

const VoiceChatModal: React.FC<VoiceChatModalProps> = ({ isOpen, onClose, context }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsRecording(false);
      setTranscript('');
    }
  }, [isOpen]);

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      await startVoiceChat((text) => {
        setTranscript(text);
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      await stopVoiceChat();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toast.error('Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Talk to NutriDecode</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Context */}
          {context && (
            <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
              <p>I can help you understand more about {context}. Just start speaking!</p>
            </div>
          )}

          {/* Transcript */}
          <div className="min-h-[100px] bg-gray-50 rounded-lg p-4">
            {transcript ? (
              <p className="text-gray-700">{transcript}</p>
            ) : (
              <p className="text-gray-500 italic">
                {isRecording ? "I'm listening..." : "Click the microphone to start speaking"}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            {isProcessing ? (
              <div className="p-4 bg-blue-100 rounded-full">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : isRecording ? (
              <button
                onClick={handleStopRecording}
                className="p-4 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
              >
                <Square className="w-8 h-8 text-red-600" />
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                className="p-4 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
              >
                <Mic className="w-8 h-8 text-blue-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatModal; 