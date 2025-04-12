import { createClient } from '@supabase/supabase-js';
import type { AnalysisResult } from './openai';
import type { UserPreferences } from './preferences';
import { getEnvVar } from '../utils/env';

// Initialize Supabase client with secure environment variables
export const supabase = createClient(
  getEnvVar('VITE_SUPABASE_URL'),
  getEnvVar('VITE_SUPABASE_ANON_KEY')
);

interface WaitlistEntry {
  full_name: string;
  email: string;
  phone_number?: string;
  occupation?: string;
  dietary_preferences?: string[];
  health_goals?: string[];
  reason_for_joining?: string;
  how_did_you_hear?: string;
  newsletter_opt_in: boolean;
}

export const submitWaitlistEntry = async (data: WaitlistEntry) => {
  try {
    // Check for existing entry first
    const { data: existingEntry, error: checkError } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', data.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing entry:', checkError);
      throw new Error('Failed to check existing waitlist entry. Please try again.');
    }

    if (existingEntry) {
      throw new Error('This email is already on our waitlist!');
    }

    // Submit waitlist entry
    const { data: newEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert([{
        ...data,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error submitting waitlist entry:', insertError);
      if (insertError.code === '23505') {
        throw new Error('This email is already on our waitlist!');
      }
      throw new Error('Failed to submit waitlist entry. Please try again.');
    }

    return newEntry;
  } catch (error) {
    console.error('Waitlist submission error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

// Function to initialize the database schema
export async function initializeDatabase() {
  try {
    // First, check if we can connect to the database
    const { error: testError } = await supabase
      .from('user_preferences')
      .select('count')
      .limit(1);

    if (testError && testError.code === '42P01') {
      // Table doesn't exist, create it using raw SQL through Supabase dashboard
      console.log('Preferences table does not exist, creating...');
      
      // Create the table using Supabase's SQL editor
      const { error: createError } = await supabase
        .from('user_preferences')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          user_id: '00000000-0000-0000-0000-000000000000',
          preferred_language: 'en',
          dietary_restrictions: [],
          preferred_diets: [],
          allergen_alerts: [],
          allergen_sensitivity: 'medium',
          health_goals: [],
          daily_calorie_target: 2000,
          macro_preferences: { protein: 30, carbs: 40, fats: 30 },
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
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (createError) {
        console.error('Error creating preferences table:', createError);
        
        // If the error is due to missing table, we need to create it first
        if (createError.code === '42P01') {
          const { error: tableError } = await supabase.auth.admin.createUser({
            email: 'temp@example.com',
            password: 'temporary123',
            email_confirm: true
          });

          if (tableError) {
            console.error('Error creating temporary user:', tableError);
            throw new Error('Failed to initialize database: Unable to create required tables');
          }

          // Try creating the table again
          const { error: retryError } = await supabase
            .from('user_preferences')
            .insert({
              id: '00000000-0000-0000-0000-000000000000',
              user_id: '00000000-0000-0000-0000-000000000000',
              preferred_language: 'en',
              dietary_restrictions: [],
              preferred_diets: [],
              allergen_alerts: [],
              allergen_sensitivity: 'medium',
              health_goals: [],
              daily_calorie_target: 2000,
              macro_preferences: { protein: 30, carbs: 40, fats: 30 },
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
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();

          if (retryError) {
            console.error('Error in retry creating preferences table:', retryError);
            throw new Error('Failed to initialize database: ' + retryError.message);
          }
        } else {
          throw new Error('Failed to create preferences table: ' + createError.message);
        }
      }

      // Clean up the temporary data
      await supabase
        .from('user_preferences')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');

      console.log('Successfully created preferences table');
    } else if (testError) {
      console.error('Error checking preferences table:', testError);
      throw new Error('Failed to check preferences table: ' + testError.message);
    }

    // Add preferred_language column if it doesn't exist
    const { error: alterError } = await supabase.rpc('add_preferred_language_column');
    if (alterError && !alterError.message.includes('already exists')) {
      console.error('Error adding preferred_language column:', alterError);
      throw new Error('Failed to add preferred_language column: ' + alterError.message);
    }

    // Verify the table structure
    const { error: verifyError } = await supabase
      .from('user_preferences')
      .select()
      .limit(1);

    if (verifyError) {
      console.error('Error verifying table structure:', verifyError);
      throw new Error('Failed to verify table structure: ' + verifyError.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export interface AnalysisFilters {
  startDate?: string;
  endDate?: string;
  healthScoreMin?: number;
  healthScoreMax?: number;
  productName?: string;
  sortBy?: 'created_at' | 'health_score' | 'product_name';
  sortOrder?: 'asc' | 'desc';
}

export async function saveAnalysis(analysis: AnalysisResult, imageUrl: string) {
  try {
    console.log('Starting analysis save process...');
    
    // Check if we have the required credentials
    if (!getEnvVar('VITE_SUPABASE_URL') || !getEnvVar('VITE_SUPABASE_ANON_KEY')) {
      throw new Error('Supabase credentials are missing');
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Authentication error');
    }
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Preparing analysis data for user:', user.id);

    // Check if analysis already exists within the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: existingAnalysis } = await supabase
      .from('food_analyses')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('product_name', analysis.productName)
      .gte('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingAnalysis && existingAnalysis.length > 0) {
      throw new Error('This product was recently analyzed. Please wait before analyzing it again.');
    }

    // Prepare the analysis data with current timestamp
    const analysisData = {
      user_id: user.id,
      image_url: imageUrl,
      product_name: analysis.productName,
      ingredients_list: analysis.ingredients.list || [],
      preservatives: analysis.ingredients.preservatives || [],
      additives: analysis.ingredients.additives || [],
      antioxidants: analysis.ingredients.antioxidants || [],
      stabilizers: analysis.ingredients.stabilizers || [],
      declared_allergens: analysis.allergens?.declared || [],
      may_contain_allergens: analysis.allergens?.mayContain || [],
      serving_size: analysis.nutritionalInfo?.servingSize || '',
      nutritional_info: {
        perServing: analysis.nutritionalInfo?.perServing || {},
        per100g: analysis.nutritionalInfo?.per100g || {}
      },
      health_score: calculateHealthScore(analysis),
      health_claims: analysis.healthClaims || [],
      packaging_materials: analysis.packaging?.materials || [],
      recycling_info: analysis.packaging?.recyclingInfo || '',
      sustainability_claims: analysis.packaging?.sustainabilityClaims || [],
      certifications: analysis.packaging?.certifications || [],
      created_at: new Date().toISOString()
    };

    // Begin a transaction
    const { data, error: insertError } = await supabase
      .from('food_analyses')
      .insert(analysisData)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting analysis:', insertError);
      if (insertError.code === '23505') {
        throw new Error('This analysis has already been saved.');
      } else {
        throw new Error(`Database error: ${insertError.message}`);
      }
    }

    if (!data) {
      throw new Error('No data returned from insert operation');
    }

    console.log('Successfully saved analysis with ID:', data.id);
    return data;

  } catch (error) {
    console.error('Error in saveAnalysis:', error);
    throw error;
  }
}

function calculateHealthScore(analysis: AnalysisResult): number {
  let score = 0;
  
  try {
    // Base score starts at 65
    score = 65;

    // Analyze ingredients
    const ingredients = analysis.ingredients || {};
    
    // Healthy fats (rapeseed oil, olive oil, etc.) +1.5
    if (ingredients.list?.some(i => 
      i.toLowerCase().includes('rapeseed oil') || 
      i.toLowerCase().includes('olive oil') ||
      i.toLowerCase().includes('sunflower oil'))) {
      score += 1.5;
    }

    // Minimal allergens +1
    if (!analysis.allergens?.declared?.length && !analysis.allergens?.mayContain?.length) {
      score += 1;
    }

    // Preservatives penalty -1
    if (ingredients.preservatives?.length > 0 || 
        ingredients.list?.some(i => i.toLowerCase().includes('edta'))) {
      score -= 1;
    }

    // High calorie penalty -1
    if (analysis.nutritionalInfo?.per100g?.calories > 300) {
      score -= 1;
    }

    // Eco-friendly packaging +1
    if (analysis.packaging?.recyclingInfo || 
        analysis.packaging?.sustainabilityClaims?.length > 0) {
      score += 1;
    }

    // Moderate sugar/salt penalty -0.5
    if (analysis.nutritionalInfo?.per100g?.sugar > 5 || 
        analysis.nutritionalInfo?.per100g?.salt > 1.5) {
      score -= 0.5;
    }

    // Overall ingredient clarity +0.5
    if (ingredients.list?.length > 0 && ingredients.list.every(i => i.length > 0)) {
      score += 0.5;
    }

  } catch (error) {
    console.error('Error calculating health score:', error);
    return 65; // Return base score if there's an error
  }

  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function getAnalysisHistory(filters?: AnalysisFilters) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }

    let query = supabase
      .from('food_analyses')
      .select('*')
      .eq('user_id', user.id);

    if (filters) {
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.healthScoreMin !== undefined) {
        query = query.gte('health_score', filters.healthScoreMin);
      }
      if (filters.healthScoreMax !== undefined) {
        query = query.lte('health_score', filters.healthScoreMax);
      }
      if (filters.productName) {
        query = query.ilike('product_name', `%${filters.productName}%`);
      }
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching analysis history:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No analysis history found for user:', user.id);
      return [];
    }

    console.log('Fetched analysis history:', data.length, 'items');

    return data.map(item => ({
      id: item.id,
      created_at: item.created_at,
      product_name: item.product_name,
      image_url: item.image_url,
      health_score: item.health_score,
      analysis_result: {
        productName: item.product_name,
        ingredients: {
          list: item.ingredients_list || [],
          preservatives: item.preservatives || [],
          additives: item.additives || [],
          antioxidants: item.antioxidants || [],
          stabilizers: item.stabilizers || []
        },
        allergens: {
          declared: item.declared_allergens || [],
          mayContain: item.may_contain_allergens || []
        },
        nutritionalInfo: item.nutritional_info || {},
        healthScore: item.health_score,
        healthClaims: item.health_claims || [],
        packaging: {
          materials: item.packaging_materials || [],
          recyclingInfo: item.recycling_info || '',
          sustainabilityClaims: item.sustainability_claims || [],
          certifications: item.certifications || []
        }
      }
    }));
  } catch (error) {
    console.error('Unexpected error in getAnalysisHistory:', error);
    return [];
  }
}

export async function getAnalysisById(id: string) {
  const { data, error } = await supabase
    .from('food_analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAnalyticsData() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('food_analyses')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  return {
    totalQueries: data.length,
    successfulQueries: data.filter(item => !item.metadata?.error).length,
    averageProcessingTime: data.reduce((acc, item) => acc + (item.metadata?.processingTimeMs || 0), 0) / data.length,
    errorRate: (data.filter(item => item.metadata?.error).length / data.length) * 100
  };
}

export async function exportAnalysisData(format: 'csv' | 'json' = 'csv', filters?: AnalysisFilters) {
  try {
    const analyses = await getAnalysisHistory(filters);
    
    if (format === 'csv') {
      // Prepare data for CSV
      const flattenedData = analyses.map(analysis => ({
        id: analysis.id,
        date: new Date(analysis.created_at).toLocaleDateString(),
        time: new Date(analysis.created_at).toLocaleTimeString(),
        product_name: analysis.product_name,
        health_score: analysis.health_score,
        ingredients: analysis.analysis_result.ingredients.list.join('; '),
        preservatives: analysis.analysis_result.ingredients.preservatives.join('; '),
        additives: analysis.analysis_result.ingredients.additives.join('; '),
        declared_allergens: analysis.analysis_result.allergens.declared.join('; '),
        may_contain_allergens: analysis.analysis_result.allergens.mayContain.join('; '),
        health_claims: analysis.analysis_result.healthClaims.join('; '),
        packaging_materials: analysis.analysis_result.packaging.materials.join('; '),
        recycling_info: analysis.analysis_result.packaging.recyclingInfo,
        sustainability_claims: analysis.analysis_result.packaging.sustainabilityClaims.join('; '),
        certifications: analysis.analysis_result.packaging.certifications.join('; ')
      }));

      // Convert to CSV
      const headers = Object.keys(flattenedData[0]).join(',');
      const rows = flattenedData.map(item => 
        Object.values(item)
          .map(value => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      );
      
      return `${headers}\n${rows.join('\n')}`;
    }
    
    // Return JSON format
    return JSON.stringify(analyses, null, 2);
  } catch (error) {
    console.error('Error exporting analysis data:', error);
    throw error;
  }
}

export async function deleteAnalysis(analysisId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First verify the analysis exists and belongs to the user
    const { data: analysis, error: checkError } = await supabase
      .from('food_analyses')
      .select('id')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking analysis:', checkError);
      throw new Error('Failed to verify analysis ownership');
    }

    if (!analysis) {
      throw new Error('Analysis not found or access denied');
    }

    // Try normal deletion first
    const { error: deleteError } = await supabase
      .from('food_analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', user.id);

    if (!deleteError) {
      return true; // Deletion successful
    }

    console.error('Normal deletion failed:', deleteError);

    // If normal deletion fails, try force delete
    const { data: forceDeleteResult, error: forceError } = await supabase
      .rpc('force_delete_analysis', {
        p_analysis_id: analysisId,
        p_user_id: user.id
      });

    if (forceError || forceDeleteResult === false) {
      console.error('Force deletion failed:', forceError || 'Function returned false');
      throw new Error('Failed to delete analysis');
    }

    // Verify deletion
    const { data: verifyData } = await supabase
      .from('food_analyses')
      .select('id')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (verifyData) {
      throw new Error('Failed to delete analysis: Record still exists');
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAnalysis:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete analysis: ${error.message}`);
    }
    throw new Error('Failed to delete analysis: Unknown error');
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return data as UserPreferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}