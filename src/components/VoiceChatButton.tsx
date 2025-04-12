import React, { useState, useEffect } from 'react';
import { startRecording, stopRecording, cancelVoiceChat } from '../services/voiceChat';
import { getUserPreferences } from '../services/preferences';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface VoiceChatButtonProps {
  className?: string;
  context?: {
    productName: string;
    ingredients: string[];
    nutritionalInfo: {
      servingSize: string;
      perServing: {
        calories: number;
        protein: number;
        carbs: number;
        fats: {
          total: number;
          saturated: number;
        };
        sugar: number;
        salt: number;
        omega3: number;
      };
    };
  };
}

const VoiceChatButton: React.FC<VoiceChatButtonProps> = ({ className = '', context }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [loadingText, setLoadingText] = useState('Processing...');

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const preferences = await getUserPreferences();
        if (preferences?.preferred_language) {
          setPreferredLanguage(preferences.preferred_language);
          // Set loading text based on language
          switch (preferences.preferred_language) {
            case 'es':
              setLoadingText('Procesando...');
              break;
            case 'fr':
              setLoadingText('Traitement en cours...');
              break;
            case 'de':
              setLoadingText('Verarbeitung...');
              break;
            case 'it':
              setLoadingText('Elaborazione...');
              break;
            case 'pt':
              setLoadingText('Processando...');
              break;
            case 'nl':
              setLoadingText('Verwerken...');
              break;
            case 'pl':
              setLoadingText('Przetwarzanie...');
              break;
            case 'ru':
              setLoadingText('Обработка...');
              break;
            case 'ja':
              setLoadingText('処理中...');
              break;
            case 'ko':
              setLoadingText('처리 중...');
              break;
            case 'zh':
              setLoadingText('处理中...');
              break;
            default:
              setLoadingText('Processing...');
          }
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };
    fetchPreferences();
  }, []);

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      setTranscription('');
      
      await startRecording({
        onTranscriptionUpdate: (text) => {
          setTranscription(text);
        },
        onError: (error) => {
          console.error('Voice chat error:', error);
          setIsRecording(false);
          setIsProcessing(false);
          // Show error message in preferred language
          const errorMessage = preferredLanguage === 'en' 
            ? 'An error occurred. Please try again.' 
            : 'Error. Please try again.';
          toast.error(errorMessage);
        },
        onProcessing: (processing) => {
          setIsProcessing(processing);
        },
        context: context ? {
          role: 'system',
          content: `You are analyzing a food product: ${context.productName}. 
            Ingredients: ${context.ingredients.join(', ')}. 
            Nutritional Information (per serving): 
            - Calories: ${context.nutritionalInfo.perServing.calories}
            - Protein: ${context.nutritionalInfo.perServing.protein}g
            - Carbs: ${context.nutritionalInfo.perServing.carbs}g
            - Total Fats: ${context.nutritionalInfo.perServing.fats.total}g
            - Saturated Fats: ${context.nutritionalInfo.perServing.fats.saturated}g
            - Sugar: ${context.nutritionalInfo.perServing.sugar}g
            - Salt: ${context.nutritionalInfo.perServing.salt}g
            - Omega-3: ${context.nutritionalInfo.perServing.omega3}g
            
            Use this information to provide accurate and detailed responses about the product. Respond in the user's preferred language: ${preferredLanguage}`
        } : undefined
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      // Show error message in preferred language
      const errorMessage = preferredLanguage === 'en' 
        ? 'Failed to start recording. Please check your microphone.' 
        : 'Error. Please check your microphone.';
      toast.error(errorMessage);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    setIsRecording(false);
  };

  const handleCancel = () => {
    cancelVoiceChat();
    setIsRecording(false);
    setIsProcessing(false);
    setTranscription('');
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={isProcessing}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isRecording ? (
          <>
            <FaStop className="w-4 h-4" />
            Stop Recording
          </>
        ) : (
          <>
            <FaMicrophone className="w-4 h-4" />
            Talk to NutriDecode
          </>
        )}
      </button>

      {isProcessing && (
        <div className="mt-4 text-gray-600">
          {loadingText}
        </div>
      )}

      {transcription && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg max-w-md">
          <p className="text-sm text-gray-600">You said:</p>
          <p className="mt-1 text-gray-800">{transcription}</p>
        </div>
      )}

      {(isRecording || isProcessing) && (
        <button
          onClick={handleCancel}
          className="mt-2 text-sm text-red-500 hover:text-red-600"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default VoiceChatButton; 