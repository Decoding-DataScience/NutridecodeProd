import OpenAI from 'openai';
import { textToSpeech, playAudio } from './elevenlabs';
import toast from 'react-hot-toast';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult[];
  [index: number]: SpeechRecognitionResult[];
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

let recognition: SpeechRecognition | null = null;

function initializeSpeechRecognition(): SpeechRecognition | null {
  if ('webkitSpeechRecognition' in window) {
    return new (window as any).webkitSpeechRecognition() as SpeechRecognition;
  } else if ('SpeechRecognition' in window) {
    return new (window as any).SpeechRecognition() as SpeechRecognition;
  }
  console.error('Speech recognition not supported');
  return null;
}

export const startVoiceChat = (onTranscript: (text: string) => void) => {
  if (!recognition) {
    recognition = initializeSpeechRecognition();
    if (!recognition) return;
  }

  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const results = event.results;
    let finalTranscript = '';
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result[0]) {
        finalTranscript += result[0].transcript;
      }
    }
    
    onTranscript(finalTranscript);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error);
  };

  recognition.start();
};

export const stopVoiceChat = () => {
  recognition?.stop();
};

export const processVoiceInput = async (text: string): Promise<void> => {
  try {
    // Here you would typically send the text to your backend for processing
    // For now, we'll just use a simple response
    const response = `I heard you say: ${text}`;
    
    // Convert the response to speech using ElevenLabs
    await textToSpeech(response);
  } catch (error) {
    console.error('Error processing voice input:', error);
    throw error;
  }
};

export async function chatWithNutriDecode(message: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are NutriDecode, a friendly and knowledgeable nutrition assistant. Keep responses concise and focused on nutrition, health, and food-related topics."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const reply = response.choices[0]?.message?.content;
    if (!reply) {
      throw new Error('No response generated');
    }

    return reply;
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Failed to generate response: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function speakResponse(text: string): Promise<void> {
  try {
    const audioBuffer = await textToSpeech(text);
    await playAudio(audioBuffer);
  } catch (error) {
    console.error('Speech error:', error);
    throw error;
  }
} 