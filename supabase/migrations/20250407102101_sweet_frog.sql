/*
  # Update food analyses table schema
  
  1. Changes
    - Add new columns for detailed food analysis data
    - Add indexes for improved query performance
  
  2. New Columns
    - Product details (name)
    - Ingredients (list, preservatives, antioxidants, stabilizers)
    - Allergens (declared, may contain)
    - Nutritional info (serving size, vitamins, minerals)
    - Health claims
    - Packaging (materials, recycling, sustainability, certifications)
    - Alternative suggestions
*/

-- Add new columns to food_analyses table
ALTER TABLE food_analyses
ADD COLUMN IF NOT EXISTS product_name text,
ADD COLUMN IF NOT EXISTS ingredients_list text[],
ADD COLUMN IF NOT EXISTS preservatives text[],
ADD COLUMN IF NOT EXISTS antioxidants text[],
ADD COLUMN IF NOT EXISTS stabilizers text[],
ADD COLUMN IF NOT EXISTS declared_allergens text[],
ADD COLUMN IF NOT EXISTS may_contain_allergens text[],
ADD COLUMN IF NOT EXISTS serving_size text,
ADD COLUMN IF NOT EXISTS vitamins jsonb,
ADD COLUMN IF NOT EXISTS minerals jsonb,
ADD COLUMN IF NOT EXISTS health_claims text[],
ADD COLUMN IF NOT EXISTS packaging_materials text[],
ADD COLUMN IF NOT EXISTS recycling_info text,
ADD COLUMN IF NOT EXISTS sustainability_claims text[],
ADD COLUMN IF NOT EXISTS certifications text[],
ADD COLUMN IF NOT EXISTS healthier_alternatives text[],
ADD COLUMN IF NOT EXISTS sustainable_alternatives text[];

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can insert their own analyses" ON food_analyses;
  DROP POLICY IF EXISTS "Users can view their own analyses" ON food_analyses;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Users can insert their own analyses"
  ON food_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analyses"
  ON food_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicates
ALTER TABLE food_analyses
ADD CONSTRAINT unique_user_product_analysis UNIQUE (user_id, product_name, created_at);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_food_analyses_user_id ON food_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_food_analyses_created_at ON food_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_food_analyses_product_name ON food_analyses(product_name);