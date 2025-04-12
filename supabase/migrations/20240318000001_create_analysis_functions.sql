-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own analyses" ON public.food_analyses;
  DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.food_analyses;
  DROP POLICY IF EXISTS "Users can update their own analyses" ON public.food_analyses;
  DROP POLICY IF EXISTS "Users can delete their own analyses" ON public.food_analyses;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist yet, that's fine
    NULL;
END $$;

-- Create food_analyses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.food_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  image_url text,
  product_name text NOT NULL,
  ingredients_list text[] DEFAULT '{}',
  preservatives text[] DEFAULT '{}',
  additives text[] DEFAULT '{}',
  antioxidants text[] DEFAULT '{}',
  stabilizers text[] DEFAULT '{}',
  declared_allergens text[] DEFAULT '{}',
  may_contain_allergens text[] DEFAULT '{}',
  serving_size text,
  nutritional_info jsonb DEFAULT '{}',
  health_score integer,
  health_claims text[] DEFAULT '{}',
  packaging_materials text[] DEFAULT '{}',
  recycling_info text,
  sustainability_claims text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.food_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
  -- Create policies
  CREATE POLICY "Users can view their own analyses"
    ON public.food_analyses FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own analyses"
    ON public.food_analyses FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own analyses"
    ON public.food_analyses FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own analyses"
    ON public.food_analyses FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN
    -- Policies already exist, that's fine
    NULL;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
  CREATE INDEX IF NOT EXISTS idx_food_analyses_user_id 
  ON public.food_analyses(user_id);

  CREATE INDEX IF NOT EXISTS idx_food_analyses_created_at 
  ON public.food_analyses(created_at);

  CREATE INDEX IF NOT EXISTS idx_food_analyses_product_name 
  ON public.food_analyses(product_name);
EXCEPTION
  WHEN duplicate_object THEN
    -- Indexes already exist, that's fine
    NULL;
END $$;

-- Create or replace function for force deleting analysis
CREATE OR REPLACE FUNCTION public.force_delete_analysis(p_analysis_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user owns the analysis
  IF NOT EXISTS (
    SELECT 1 
    FROM public.food_analyses 
    WHERE id = p_analysis_id 
    AND user_id = p_user_id
  ) THEN
    RETURN false;
  END IF;

  -- Force delete the analysis
  DELETE FROM public.food_analyses 
  WHERE id = p_analysis_id 
  AND user_id = p_user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$; 