import { supabase, initializeDatabase } from './supabase';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_language: string;
  dietary_restrictions: string[];
  preferred_diets: string[];
  allergen_alerts: string[];
  allergen_sensitivity: 'low' | 'medium' | 'high';
  health_goals: string[];
  daily_calorie_target: number | null;
  macro_preferences: {
    protein: number;
    carbs: number;
    fats: number;
  };
  nutrients_to_track: string[];
  nutrients_to_avoid: string[];
  ingredients_to_avoid: string[];
  preferred_ingredients: string[];
  eco_conscious: boolean;
  packaging_preferences: string[];
  notification_preferences: {
    allergen_alerts: boolean;
    health_insights: boolean;
    sustainability_tips: boolean;
    weekly_summary: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const defaultPreferences: Partial<UserPreferences> = {
  preferred_language: 'en',
  dietary_restrictions: [],
  preferred_diets: [],
  allergen_alerts: [],
  allergen_sensitivity: 'medium',
  health_goals: [],
  daily_calorie_target: 2000,
  macro_preferences: {
    protein: 30,
    carbs: 40,
    fats: 30
  },
  nutrients_to_track: [],
  nutrients_to_avoid: [],
  ingredients_to_avoid: [],
  preferred_ingredients: [],
  eco_conscious: false,
  packaging_preferences: [],
  notification_preferences: {
    allergen_alerts: true,
    health_insights: true,
    sustainability_tips: true,
    weekly_summary: true
  }
};

async function ensureInitialized() {
  if (isInitialized) return;

  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        await initializeDatabase();
        isInitialized = true;
      } catch (error) {
        console.error('Database initialization failed:', error);
        throw new Error('Failed to initialize preferences system. Please try again.');
      } finally {
        initializationPromise = null;
      }
    })();
  }

  await initializationPromise;
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    await ensureInitialized();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error in getUserPreferences:', authError);
      throw new Error('Authentication error: Please sign in again');
    }
    
    if (!user) {
      console.log('No authenticated user found');
      throw new Error('Please sign in to access your preferences');
    }

    // First check if user has existing preferences
    const { data: existingPrefs, error: fetchError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching preferences:', fetchError);
      // Check for specific database errors
      if (fetchError.code === '42P01') {
        // Table doesn't exist, try to reinitialize
        isInitialized = false;
        return await getUserPreferences(); // Retry once
      }
      throw new Error(`Failed to fetch preferences: ${fetchError.message}`);
    }

    if (!existingPrefs) {
      // Create default preferences for new user
      return await createDefaultPreferences(user.id);
    }

    return existingPrefs;
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred. Please try again later');
  }
}

async function createDefaultPreferences(userId: string): Promise<UserPreferences> {
  try {
    const defaultPrefs = {
      ...defaultPreferences,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newPrefs, error: createError } = await supabase
      .from('user_preferences')
      .insert(defaultPrefs)
      .select()
      .single();

    if (createError) {
      console.error('Error creating default preferences:', createError);
      if (createError.code === '23505') {
        // Handle unique constraint violation
        const { data: existingPrefs, error: fetchError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError) {
          throw new Error('Failed to fetch existing preferences');
        }

        return existingPrefs;
      }
      throw new Error('Failed to create default preferences. Please try again');
    }

    if (!newPrefs) {
      throw new Error('Failed to initialize preferences. Please try again');
    }

    return newPrefs;
  } catch (error) {
    console.error('Error in createDefaultPreferences:', error);
    throw error;
  }
}

export async function updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      throw new Error('Authentication error');
    }
    
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Ensure we have the current preferences first
    const currentPrefs = await getUserPreferences();
    
    if (!currentPrefs) {
      throw new Error('No existing preferences found');
    }

    // Merge current preferences with updates
    const updatedPrefs = {
      ...currentPrefs,
      ...preferences,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    // Update the preferences
    const { data, error: updateError } = await supabase
      .from('user_preferences')
      .update(updatedPrefs)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating preferences:', updateError);
      throw new Error('Failed to update preferences');
    }

    if (!data) {
      throw new Error('No data returned after update');
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserPreferences:', error);
    throw error;
  }
}

export const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Kosher',
  'Halal',
  'Nut-Free',
  'Low-Carb',
  'Keto',
  'Paleo'
];

export const COMMON_ALLERGENS = [
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree Nuts',
  'Peanuts',
  'Wheat',
  'Soybeans'
];

export const HEALTH_GOALS = [
  'Weight Loss',
  'Weight Gain',
  'Muscle Building',
  'Heart Health',
  'Better Sleep',
  'More Energy',
  'Digestive Health',
  'Blood Sugar Control'
];

export const NUTRIENTS_TO_TRACK = [
  'Protein',
  'Fiber',
  'Vitamin D',
  'Calcium',
  'Iron',
  'Potassium',
  'Omega-3',
  'Antioxidants'
];

export const PACKAGING_PREFERENCES = [
  'Recyclable',
  'Biodegradable',
  'Minimal Packaging',
  'Plastic-Free',
  'Reusable Container'
]; 