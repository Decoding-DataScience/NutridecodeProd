-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  dietary_restrictions text[] DEFAULT '{}',
  preferred_diets text[] DEFAULT '{}',
  allergen_alerts text[] DEFAULT '{}',
  allergen_sensitivity text DEFAULT 'medium',
  health_goals text[] DEFAULT '{}',
  daily_calorie_target integer DEFAULT 2000,
  macro_preferences jsonb DEFAULT '{"protein": 30, "carbs": 40, "fats": 30}',
  nutrients_to_track text[] DEFAULT '{}',
  nutrients_to_avoid text[] DEFAULT '{}',
  ingredients_to_avoid text[] DEFAULT '{}',
  preferred_ingredients text[] DEFAULT '{}',
  eco_conscious boolean DEFAULT false,
  packaging_preferences text[] DEFAULT '{}',
  notification_preferences jsonb DEFAULT '{"allergen_alerts": true, "health_insights": true, "sustainability_tips": true, "weekly_summary": true}',
  metadata jsonb DEFAULT '{}'
);

-- Add unique constraint
ALTER TABLE public.user_preferences
ADD CONSTRAINT unique_user_preferences UNIQUE (user_id);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
  DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
  DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
  
  -- Create new policies
  CREATE POLICY "Users can view their own preferences"
    ON public.user_preferences FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own preferences"
    ON public.user_preferences FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own preferences"
    ON public.user_preferences FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON public.user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_updated_at 
ON public.user_preferences(updated_at); 