import OpenAI from 'openai';
import type { UserPreferences } from './preferences';
import { getEnvVar } from '../utils/env';

// Rate limiting configuration
const RATE_LIMIT = {
  tokensPerMin: 10000,
  maxRetries: 3,
  initialRetryDelay: 1000,
};

// Token usage tracking
let tokenUsage = {
  tokens: 0,
  resetTime: Date.now(),
};

// Reset token usage every minute
setInterval(() => {
  tokenUsage.tokens = 0;
  tokenUsage.resetTime = Date.now();
}, 60000);

// Sleep function for retry delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Estimate tokens in a message (rough estimation)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

const openai = new OpenAI({
  apiKey: getEnvVar('VITE_OPENAI_API_KEY'),
  dangerouslyAllowBrowser: true
});

async function makeOpenAIRequest<T>(
  requestFn: () => Promise<T>,
  estimatedTokens: number
): Promise<T> {
  let retryCount = 0;
  let delay = RATE_LIMIT.initialRetryDelay;

  while (true) {
    try {
      // Check if adding these tokens would exceed the rate limit
      if (tokenUsage.tokens + estimatedTokens > RATE_LIMIT.tokensPerMin) {
        const timeUntilReset = 60000 - (Date.now() - tokenUsage.resetTime);
        if (timeUntilReset > 0) {
          await sleep(timeUntilReset);
        }
        tokenUsage.tokens = 0;
        tokenUsage.resetTime = Date.now();
      }

      const result = await requestFn();
      tokenUsage.tokens += estimatedTokens;
      return result;

    } catch (error: any) {
      if (error?.response?.status === 429 && retryCount < RATE_LIMIT.maxRetries) {
        retryCount++;
        await sleep(delay);
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}

export interface AnalysisMetadata {
  timestamp: string;
  temperature: number;
  model: string;
  queryType: string;
  processingTimeMs: number;
  error?: string;
  warning?: string;
}

export interface AnalysisResult {
  type?: 'product' | 'ingredient';
  name?: string;
  details?: string;
  productName: string;
  ingredients: {
    list: string[];
    preservatives: string[];
    additives: string[];
    antioxidants: string[];
    stabilizers: string[];
  };
  preferences?: {
    allergens?: string[];
    dietaryRestrictions?: string[];
    healthGoals?: string[];
  };
  allergens: {
    declared: string[];
    mayContain: string[];
  };
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
    per100g: {
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
  healthClaims: string[];
  packaging: {
    materials: string[];
    recyclingInfo: string;
    sustainabilityClaims: string[];
    certifications: string[];
  };
  storage: {
    instructions: string[];
    bestBefore: string;
  };
  manufacturer: {
    name: string;
    address: string;
    contact: string;
  };
}

export async function analyzeFoodLabel(imageBase64: string): Promise<AnalysisResult> {
  const startTime = Date.now();
  const temperature = 0.1;
  const model = "gpt-4o";
  
  try {
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Estimate tokens for the request (image analysis typically uses more tokens)
    const estimatedTokens = 2000; // Conservative estimate for vision API

    const response = await makeOpenAIRequest(
      () => openai.chat.completions.create({
        model,
        temperature,
        messages: [
          {
            role: "system",
            content: `You are a food label analysis expert. Analyze the food label image and extract ONLY information that is explicitly stated on the label. Be extremely precise and thorough in your analysis. Format the response as a JSON object with the following structure:
            {
              "productName": "exact product name from label",
              "ingredients": {
                "list": ["all ingredients with exact percentages as shown (e.g., 'Rapeseed oil (78%)')"],
                "preservatives": ["identified preservatives with E-numbers and full names"],
                "additives": ["identified additives with full names"],
                "antioxidants": ["identified antioxidants with full chemical names"],
                "stabilizers": ["identified stabilizers"]
              },
              "allergens": {
                "declared": ["explicitly declared allergens in CAPS"],
                "mayContain": ["may contain warnings"]
              },
              "nutritionalInfo": {
                "servingSize": "stated serving size with exact measurements",
                "perServing": {
                  "calories": number,
                  "protein": number,
                  "carbs": number,
                  "fats": {
                    "total": number,
                    "saturated": number
                  },
                  "sugar": number,
                  "salt": number,
                  "omega3": number
                },
                "per100g": {
                  "calories": number,
                  "protein": number,
                  "carbs": number,
                  "fats": {
                    "total": number,
                    "saturated": number
                  },
                  "sugar": number,
                  "salt": number,
                  "omega3": number
                }
              },
              "healthClaims": ["all health-related claims exactly as written"],
              "packaging": {
                "materials": ["packaging materials with specifications"],
                "recyclingInfo": "complete recycling instructions",
                "sustainabilityClaims": ["all sustainability claims exactly as written"],
                "certifications": ["all certification marks and symbols shown"]
              },
              "storage": {
                "instructions": ["storage instructions exactly as written"],
                "bestBefore": "exact date format as shown"
              },
              "manufacturer": {
                "name": "company name",
                "address": "full address as shown",
                "contact": "contact information if provided"
              }
            }
            IMPORTANT: 
            1. Capture ALL ingredients with their exact percentages when shown
            2. Identify and classify preservatives, additives, and antioxidants
            3. Maintain exact wording and numerical values as shown on the label
            4. Include all percentages, measurements, and units exactly as displayed
            5. Capture all certification marks, symbols, and recycling information
            6. Note any specific dietary certifications (e.g., vegetarian, vegan)
            7. Extract all health claims and sustainability statements verbatim`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high"
                }
              },
              {
                type: "text",
                text: "Analyze this food label and provide only the information that is explicitly shown on the packaging."
              }
            ]
          }
        ],
        max_tokens: 4096,
        response_format: { type: "json_object" }
      }),
      estimatedTokens
    );

    try {
      const content = response.choices[0].message.content;
      if (!content) {
        console.error('Empty response content from OpenAI');
        throw new Error('Empty response from OpenAI');
      }
      console.log('OpenAI Response:', content);
      
      const analysisResult = JSON.parse(content);
      console.log('Parsed Analysis Result:', analysisResult);
      
      const processingTimeMs = Date.now() - startTime;

      // Add metadata to the result
      const result = {
        ...analysisResult,
        metadata: {
          timestamp: new Date().toISOString(),
          temperature,
          model,
          queryType: "food-label-analysis",
          processingTimeMs,
        }
      } as AnalysisResult;

      console.log('Final Result:', result);
      return result;
    } catch (parseError: unknown) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Response content:', response.choices[0]?.message?.content);
      throw new Error('Failed to parse analysis results: ' + (parseError instanceof Error ? parseError.message : String(parseError)));
    }
  } catch (error) {
    console.error('Error analyzing food label:', error);
    
    const metadata: AnalysisMetadata = {
      timestamp: new Date().toISOString(),
      temperature,
      model,
      queryType: "food-label-analysis",
      processingTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        metadata.error = 'Authentication failed. Please check your API key.';
      } else if (error.message.includes('timeout')) {
        metadata.error = 'Request timed out. Please try again.';
      } else if (error.message.includes('rate limit')) {
        metadata.error = 'Too many requests. Please wait a moment and try again.';
      }
    }
    
    throw new Error(JSON.stringify({ metadata }));
  }
}

export function validateImage(imageBase64: string): boolean {
  try {
    // Check if it's a valid base64 image string
    if (!imageBase64.startsWith('data:image/')) {
      console.error('Invalid image format: not a data URL');
      return false;
    }

    // Extract the actual base64 data
    const base64Data = imageBase64.split(',')[1];
    if (!base64Data) {
      console.error('Invalid image format: no base64 data');
      return false;
    }

    // Check file size (10MB limit)
    const sizeInBytes = (base64Data.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB > 10) {
      console.error('Image too large:', sizeInMB.toFixed(2), 'MB');
      return false;
    }

    // Check if it's one of the supported formats
    const mimeType = imageBase64.split(';')[0].split(':')[1];
    const supportedFormats = ['image/jpeg', 'image/png', 'image/heif'];
    if (!supportedFormats.includes(mimeType)) {
      console.error('Unsupported image format:', mimeType);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating image:', error);
    return false;
  }
}

export async function generateAnalysisSummary(analysis: AnalysisResult): Promise<string> {
  try {
    const prompt = `Create a concise, conversational summary of this food analysis that would sound natural when spoken:
    ${JSON.stringify(analysis, null, 2)}`;
    
    const systemPrompt = "You are a nutrition expert summarizing food product analysis. Create clear, concise summaries that are easy to understand when spoken aloud. Focus on the most important health aspects and any concerns.";
    
    const estimatedTokenCount = estimateTokens(prompt) + estimateTokens(systemPrompt) + 500; // Extra tokens for safety

    const response = await makeOpenAIRequest(
      () => openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
      estimatedTokenCount
    );

    const summary = response.choices[0]?.message?.content;
    if (!summary) {
      throw new Error('Failed to generate summary');
    }

    return summary;
  } catch (error) {
    console.error('Error generating analysis summary:', error);
    throw new Error('Failed to generate analysis summary: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function analyzeIngredientWithAI(
  ingredient: string,
  userPreferences: UserPreferences | null
): Promise<{
  category: 'allergen' | 'dietary_restriction' | 'health_concern' | 'healthy' | 'neutral';
  explanation: string;
}> {
  try {
    const prompt = `Analyze this ingredient: ${ingredient}
    User preferences: ${JSON.stringify(userPreferences, null, 2)}
    
    Categorize the ingredient into one of these categories:
    - allergen: if it matches or contains any user allergens
    - dietary_restriction: if it conflicts with dietary restrictions
    - health_concern: if it conflicts with health goals
    - healthy: if it's generally healthy or supports health goals
    - neutral: if none of the above apply
    
    Return JSON format:
    {
      "category": "category_name",
      "explanation": "brief explanation"
    }`;

    const systemPrompt = "You are a nutrition expert analyzing food ingredients. Categorize ingredients based on user preferences and return JSON response.";
    
    const estimatedTokenCount = estimateTokens(prompt) + estimateTokens(systemPrompt) + 200; // Extra tokens for safety

    const response = await makeOpenAIRequest(
      () => openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      }),
      estimatedTokenCount
    );

    return JSON.parse(response.choices[0]?.message?.content || '{"category": "neutral", "explanation": "No analysis available"}');
  } catch (error) {
    console.error('Error analyzing ingredient:', error);
    return {
      category: 'neutral',
      explanation: 'Analysis failed, defaulting to neutral'
    };
  }
}

export async function analyzeNutrientWithAI(
  nutrient: string,
  value: number,
  userPreferences: UserPreferences | null
): Promise<{
  category: 'exceeds_limit' | 'high' | 'optimal' | 'low';
  explanation: string;
}> {
  try {
    const prompt = `Analyze this nutrient: ${nutrient} with value: ${value}
    User health goals: ${JSON.stringify(userPreferences?.health_goals, null, 2)}
    
    Categorize the nutrient value into one of these categories:
    - exceeds_limit: if it significantly exceeds healthy limits or conflicts with health goals
    - high: if it's higher than recommended but not concerning
    - optimal: if it's within healthy range
    - low: if it's lower than recommended
    
    Return JSON format:
    {
      "category": "category_name",
      "explanation": "brief explanation"
    }`;

    const systemPrompt = "You are a nutrition expert analyzing nutrient values. Categorize nutrients based on user health goals and return JSON response.";
    
    const estimatedTokenCount = estimateTokens(prompt) + estimateTokens(systemPrompt) + 200; // Extra tokens for safety

    const response = await makeOpenAIRequest(
      () => openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      }),
      estimatedTokenCount
    );

    return JSON.parse(response.choices[0]?.message?.content || '{"category": "optimal", "explanation": "No analysis available"}');
  } catch (error) {
    console.error('Error analyzing nutrient:', error);
    return {
      category: 'optimal',
      explanation: 'Analysis failed, defaulting to optimal'
    };
  }
}