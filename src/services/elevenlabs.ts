import { getEnvVar } from '../utils/env';

const ELEVENLABS_API_ENDPOINT = 'https://api.elevenlabs.io/v1';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Default multilingual v2 voice
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Keep track of current audio instance
let currentAudio: HTMLAudioElement | null = null;

// Get API key using our secure environment variable handler
const getApiKey = () => getEnvVar('VITE_ELEVENLABS_API_KEY');

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle API response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'Failed to convert text to speech';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail?.message || errorMessage;
    } catch {
      // If parsing fails, use status text
      errorMessage = `${errorMessage}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response;
};

export async function textToSpeech(text: string, retryCount = 0): Promise<ArrayBuffer> {
  try {
    const response = await fetch(`${ELEVENLABS_API_ENDPOINT}/text-to-speech/eleven_multilingual_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': getApiKey(),
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    // Implement retry logic for specific errors
    if (retryCount < MAX_RETRIES && (
      error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('network') ||
        error.message.includes('rate limit')
      )
    )) {
      await delay(RETRY_DELAY * (retryCount + 1));
      return textToSpeech(text, retryCount + 1);
    }
    
    throw new Error(
      error instanceof Error 
        ? `Text-to-speech failed: ${error.message}`
        : 'Failed to convert text to speech'
    );
  }
}

export const playAudio = async (audioBuffer: ArrayBuffer): Promise<HTMLAudioElement> => {
  try {
    // Stop any currently playing audio
    stopAudio();

    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    currentAudio = audio;

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        cleanupAudio(audio, url);
        resolve(audio);
      };
      
      audio.onerror = (error) => {
        cleanupAudio(audio, url);
        reject(error);
      };
      
      audio.play().catch(error => {
        cleanupAudio(audio, url);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error playing audio:', error);
    throw new Error('Failed to play audio: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

const cleanupAudio = (audio: HTMLAudioElement, url: string) => {
  URL.revokeObjectURL(url);
  if (currentAudio === audio) {
    currentAudio = null;
  }
};

export const stopAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    if (currentAudio.src) {
      URL.revokeObjectURL(currentAudio.src);
    }
    currentAudio = null;
  }
};

export const pauseAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
  }
};

export const resumeAudio = () => {
  if (currentAudio) {
    currentAudio.play().catch(error => {
      console.error('Error resuming audio:', error);
      stopAudio();
    });
  }
}; 