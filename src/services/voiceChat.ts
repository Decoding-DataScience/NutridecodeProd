import OpenAI from 'openai';
import { textToSpeech, playAudio, stopAudio } from './elevenlabs';
import { getEnvVar } from '../utils/env';

const openai = new OpenAI({
  apiKey: getEnvVar('VITE_OPENAI_API_KEY'),
  dangerouslyAllowBrowser: true
});

// MediaRecorder instance to handle recording
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

interface VoiceChatOptions {
  onTranscriptionUpdate?: (text: string) => void;
  onError?: (error: Error) => void;
  onProcessing?: (isProcessing: boolean) => void;
  context?: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  };
}

// Language detection using OpenAI
async function detectLanguage(text: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a language detection expert. Respond only with the ISO 639-1 language code (e.g., "en" for English, "es" for Spanish, etc.) for the language of the following text.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0,
      max_tokens: 2
    });

    return completion.choices[0]?.message?.content?.toLowerCase() || 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English on error
  }
}

export const startRecording = async (options: VoiceChatOptions = {}) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      try {
        options.onProcessing?.(true);
        
        // Convert audio chunks to file
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const file = new File([audioBlob], 'voice-input.webm', { type: 'audio/webm' });

        // Transcribe audio using OpenAI with auto language detection
        const transcription = await openai.audio.transcriptions.create({
          file,
          model: 'whisper-1',
          response_format: 'verbose_json'
        });

        const detectedLanguage = transcription.language;
        
        if (options.onTranscriptionUpdate) {
          options.onTranscriptionUpdate(transcription.text);
        }

        // Get AI response in the same language
        const response = await chatWithNutriDecode(transcription.text, detectedLanguage, options.context);
        if (response) {
          // Convert AI response to speech using the detected language
          const audioBuffer = await textToSpeech(response);
          await playAudio(audioBuffer);
        }
      } catch (error) {
        console.error('Error processing voice chat:', error);
        if (options.onError && error instanceof Error) {
          options.onError(error);
        }
      } finally {
        options.onProcessing?.(false);
        // Stop and release the media stream
        stream.getTracks().forEach(track => track.stop());
      }
    };

    mediaRecorder.start();
  } catch (error) {
    console.error('Error starting recording:', error);
    if (options.onError && error instanceof Error) {
      options.onError(error);
    }
  }
};

export const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
};

export const cancelVoiceChat = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  stopAudio();
};

export async function chatWithNutriDecode(
  message: string,
  language: string = 'en',
  context?: { role: 'system' | 'user' | 'assistant'; content: string }
): Promise<string> {
  try {
    // Get the system message based on language
    const systemMessages: Record<string, string> = {
      en: 'You are NutriDecode, a helpful AI assistant specializing in nutrition and food analysis. Keep your responses concise and focused on nutrition-related topics.',
      ar: 'أنت NutriDecode، مساعد ذكاء اصطناعي متخصص في التغذية وتحليل الطعام. حافظ على إجاباتك مختصرة وركز على المواضيع المتعلقة بالتغذية.',
      ur: 'آپ NutriDecode ہیں، غذائیت اور خوراک کے تجزیے میں مہارت رکھنے والا ایک مددگار AI اسسٹنٹ۔ اپنے جوابات مختصر اور غذائیت سے متعلق موضوعات پر مرکوز رکھیں۔',
      hi: 'आप NutriDecode हैं, पोषण और खाद्य विश्लेषण में विशेषज्ञता रखने वाला एक सहायक AI सहायक। अपनी प्रतिक्रियाओं को संक्षिप्त और पोषण-संबंधित विषयों पर केंद्रित रखें।',
      ta: 'நீங்கள் NutriDecode, ஊட்டச்சத்து மற்றும் உணவு பகுப்பாய்வில் நிபுணத்துவம் பெற்ற AI உதவியாளர். உங்கள் பதில்களை சுருக்கமாகவும், ஊட்டச்சத்து தொடர்பான தலைப்புகளில் கவனம் செலுத்தவும்.',
      kn: 'ನೀವು NutriDecode, ಪೌಷ್ಟಿಕತೆ ಮತ್ತು ಆಹಾರ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ವಿಶೇಷತೆ ಹೊಂದಿರುವ ಸಹಾಯಕ AI ಸಹಾಯಕ. ನಿಮ್ಮ ಪ್ರತಿಸ್ಪಂದನಲ್ನು ಸಂಕ್ಷಿಪ್ತವಾಗಿ ಮತ್ತು ಪೌಷ್ಟಿಕತೆ-ಸಂಬಂಧಿತ ವಿಷಯಗಳ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿ.',
      te: 'మీరు NutriDecode, పోషణ మరియు ఆహార విశ్లేషణలో ప్రత్యేకత కలిగిన సహాయక AI సహాయకుడు. మీ ప్రతిస్పందనలను సంక్షిప్తంగా మరియు పోషణ-సంబంధిత అంశాలపై దృష్టి సారించండి.',
      ml: 'നിങ്ങൾ NutriDecode ആണ്, പോഷകാഹാരം, ഭക്ഷണ വിശകലനം എന്നിവയിൽ വിദഗ്ധമായ AI അസിസ്റ്റന്റ്. നിങ്ങളുടെ പ്രതിസ്പ്പനങ്ങൾ ചുരുക്കവും പോഷകാഹാരവുമായി ബന്ധപ്പെട്ട വിഷയങ്ങളിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുകയും ചെയ്യുക.',
      bn: 'আপনি NutriDecode, পুষ্টি এবং খাদ্য বিশ্লেষণে বিশেষজ্ঞ একজন সহায়ক AI সহকারী। আপনার প্রতিক্রিয়াগুলি সংক্ষিপ্ত এবং পুষ্টি-সম্পর্কিত বিষয়গুলিতে মনোনিবেশ করুন।',
      es: 'Eres NutriDecode, un asistente de IA especializado en nutrición y análisis de alimentos. Mantén tus respuestas concisas y enfocadas en temas relacionados con la nutrición.',
      fr: 'Vous êtes NutriDecode, un assistant IA spécialisé dans la nutrition et l\'analyse des aliments. Gardez vos réponses concises et concentrées sur les sujets liés à la nutrition.',
      de: 'Sie sind NutriDecode, ein hilfreicher KI-Assistent, der sich auf Ernährung und Lebensmittelanalyse spezialisiert hat. Halten Sie Ihre Antworten prägnant und auf ernährungsbezogene Themen fokussiert.',
      it: 'Sei NutriDecode, un assistente IA specializzato in nutrizione e analisi degli alimenti. Mantieni le tue risposte concise e concentrate su argomenti legati alla nutrizione.',
      pt: 'Você é o NutriDecode, um assistente de IA especializado em nutrição e análise de alimentos. Mantenha suas respostas concisas e focadas em tópicos relacionados à nutrição.',
      nl: 'Je bent NutriDecode, een behulpzame AI-assistent gespecialiseerd in voeding en voedselanalyse. Houd je antwoorden beknopt en gericht op voedingsgerelateerde onderwerpen.',
      pl: 'Jesteś NutriDecode, pomocnym asystentem AI specjalizującym się w żywieniu i analizie żywności. Utrzymuj swoje odpowiedzi zwięzłe i skoncentrowane na tematach związanych z żywieniem.',
      ru: 'Вы NutriDecode, полезный ИИ-ассистент, специализирующийся на питании и анализе продуктов. Держите ваши ответы краткими и сосредоточенными на темах, связанных с питанием.',
      ja: 'あなたはNutriDecodeです。栄養と食品分析を専門とする役立つAIアシスタントです。栄養関連のトピックに焦点を当てた簡潔な回答を心がけてください。',
      ko: '당신은 NutriDecode입니다. 영양과 식품 분석을 전문으로 하는 도움이 되는 AI 어시스턴트입니다. 영양 관련 주제에 초점을 맞춘 간단한 답변을 유지하세요.',
      zh: '你是NutriDecode，一个专注于营养和食品分析的AI助手。保持简洁的回答，专注于与营养相关的话题。',
      tr: 'Sen NutriDecode\'sun, beslenme ve gıda analizi konusunda uzmanlaşmış yardımcı bir AI asistanısın. Yanıtlarını kısa ve beslenmeyle ilgili konulara odaklı tut.',
      vi: 'Bạn là NutriDecode, một trợ lý AI chuyên về dinh dưỡng và phân tích thực phẩm. Giữ câu trả lời ngắn gọn và tập trung vào các chủ đề liên quan đến dinh dưỡng.',
      th: 'คุณคือ NutriDecode ผู้ช่วย AI ที่เชี่ยวชาญด้านโภชนาการและการวิเคราะห์อาหาร รักษาคำตอบให้กระชับและมุ่งเน้นไปที่หัวข้อที่เกี่ยวข้องกับโภชนาการ'
    };

    const systemMessage = systemMessages[language] || systemMessages.en;
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: message }
    ];

    // Add context if provided
    if (context) {
      messages.push(context);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 150
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      throw new Error('No response generated');
    }

    return reply;
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Failed to generate response: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
} 