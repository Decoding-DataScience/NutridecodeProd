import OpenAI from 'openai';
import { getUserPreferences } from './preferences';
import type { UserPreferences } from './preferences';
import type { AnalysisResult } from './openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('OpenAI API key is missing. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Verify OpenAI API connection
export async function verifyOpenAIConnection(): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Test connection" }],
      max_tokens: 5
    });
    return !!response.choices[0]?.message?.content;
  } catch (error) {
    console.error('OpenAI API connection error:', error);
    return false;
  }
}

export interface PreferenceBasedAnalysis extends AnalysisResult {
  preferencesMatch: {
    dietaryCompliance: {
      compliant: boolean;
      violations: string[];
      warnings: string[];
    };
    allergenSafety: {
      safe: boolean;
      detectedAllergens: string[];
      crossContaminationRisks: string[];
    };
    nutritionalAlignment: {
      aligned: boolean;
      concerns: string[];
      recommendations: string[];
    };
    sustainabilityMatch: {
      matches: boolean;
      positiveAspects: string[];
      improvements: string[];
    };
  };
  personalizedRecommendations: string[];
  alternativeProducts?: string[];
}

export async function analyzeWithPreferences(
  analysis: AnalysisResult,
  preferences?: UserPreferences
): Promise<PreferenceBasedAnalysis> {
  try {
    // Verify API connection first
    const isConnected = await verifyOpenAIConnection();
    if (!isConnected) {
      throw new Error('Unable to connect to OpenAI API. Please check your API key and try again.');
    }

    // If preferences not provided, fetch them
    let userPreferences = preferences;
    if (!userPreferences) {
      const fetchedPrefs = await getUserPreferences();
      if (!fetchedPrefs) {
        throw new Error('User preferences not found. Please set up your preferences first.');
      }
      userPreferences = fetchedPrefs;
    }

    // Create a detailed prompt based on user preferences
    const prompt = createPreferenceBasedPrompt(analysis, userPreferences);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a personalized nutrition analysis expert. Analyze food products based on user preferences and provide detailed recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    try {
      const preferenceAnalysis = JSON.parse(content);
      return {
        ...analysis,
        ...preferenceAnalysis
      };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse analysis results. Please try again.');
    }
  } catch (error) {
    console.error('Error in preference-based analysis:', error);
    if (error instanceof Error) {
      // Handle specific OpenAI API errors
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API authentication failed. Please check your API key.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (error.message.includes('billing')) {
        throw new Error('OpenAI API billing issue. Please check your account.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred during analysis. Please try again later.');
  }
}

function createPreferenceBasedPrompt(analysis: AnalysisResult, preferences: UserPreferences | null): string {
  if (!preferences) {
    return JSON.stringify(analysis);
  }

  return `Analyze this food product based on the following user preferences and provide personalized insights:

Product Analysis:
${JSON.stringify(analysis, null, 2)}

User Preferences:
${JSON.stringify(preferences, null, 2)}

Provide a detailed analysis in JSON format with the following structure:
{
  "preferencesMatch": {
    "dietaryCompliance": {
      "compliant": boolean,
      "violations": ["list any violations of dietary restrictions"],
      "warnings": ["list any potential concerns"]
    },
    "allergenSafety": {
      "safe": boolean,
      "detectedAllergens": ["list allergens that match user's alerts"],
      "crossContaminationRisks": ["list potential cross-contamination risks"]
    },
    "nutritionalAlignment": {
      "aligned": boolean,
      "concerns": ["list nutritional concerns based on health goals"],
      "recommendations": ["provide specific recommendations"]
    },
    "sustainabilityMatch": {
      "matches": boolean,
      "positiveAspects": ["list matching sustainability features"],
      "improvements": ["suggest sustainability improvements"]
    }
  },
  "personalizedRecommendations": [
    "List of specific recommendations based on user preferences"
  ],
  "alternativeProducts": [
    "Suggest alternative products if there are significant mismatches"
  ]
}

Focus on:
1. Strict compliance with dietary restrictions
2. Detailed allergen analysis including cross-contamination risks
3. Alignment with health goals and nutritional preferences
4. Sustainability preferences
5. Practical recommendations for alternatives if needed`;
}

export async function getDetailedIngredientAnalysis(
  ingredient: string,
  preferences: UserPreferences | null
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert providing personalized ingredient analysis based on user preferences."
        },
        {
          role: "user",
          content: `Analyze this ingredient: ${ingredient}
          
User Preferences: ${JSON.stringify(preferences, null, 2)}

Provide detailed information about:
1. What it is and its source
2. Nutritional value and health benefits
3. Any concerns based on user's dietary restrictions or allergens
4. How it aligns with user's health goals
5. Sustainability aspects
6. Alternative ingredients if it doesn't match preferences`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || 'No detailed analysis available.';
  } catch (error) {
    console.error('Error analyzing ingredient:', error);
    throw error;
  }
} 