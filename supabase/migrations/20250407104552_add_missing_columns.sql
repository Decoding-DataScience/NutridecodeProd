-- Add missing columns to food_analyses table
ALTER TABLE food_analyses
ADD COLUMN IF NOT EXISTS nutritional_info jsonb,
ADD COLUMN IF NOT EXISTS ingredients_analysis jsonb,
ADD COLUMN IF NOT EXISTS health_score integer,
ADD COLUMN IF NOT EXISTS analysis_summary text,
ADD COLUMN IF NOT EXISTS ingredient_categories jsonb,
ADD COLUMN IF NOT EXISTS nutrition_facts jsonb,
ADD COLUMN IF NOT EXISTS serving_size text,
ADD COLUMN IF NOT EXISTS manufacturer text,
ADD COLUMN IF NOT EXISTS brand_name text,
ADD COLUMN IF NOT EXISTS product_category text,
ADD COLUMN IF NOT EXISTS dietary_info jsonb,
ADD COLUMN IF NOT EXISTS environmental_impact jsonb,
ADD COLUMN IF NOT EXISTS packaging_info jsonb,
ADD COLUMN IF NOT EXISTS storage_instructions text,
ADD COLUMN IF NOT EXISTS expiration_date text,
ADD COLUMN IF NOT EXISTS barcode text,
ADD COLUMN IF NOT EXISTS country_of_origin text,
ADD COLUMN IF NOT EXISTS certifications text[];

-- Create indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_food_analyses_nutritional_info ON food_analyses USING gin (nutritional_info);
CREATE INDEX IF NOT EXISTS idx_food_analyses_ingredients_analysis ON food_analyses USING gin (ingredients_analysis);
CREATE INDEX IF NOT EXISTS idx_food_analyses_health_score ON food_analyses(health_score);
CREATE INDEX IF NOT EXISTS idx_food_analyses_product_category ON food_analyses(product_category);

-- Add comments for documentation
COMMENT ON COLUMN food_analyses.nutritional_info IS 'Detailed nutritional information in JSON format';
COMMENT ON COLUMN food_analyses.ingredients_analysis IS 'Analysis results of ingredients in JSON format';
COMMENT ON COLUMN food_analyses.health_score IS 'Overall health score from 0-100';
COMMENT ON COLUMN food_analyses.nutrition_facts IS 'Structured nutrition facts panel data';
COMMENT ON COLUMN food_analyses.dietary_info IS 'Dietary restrictions and certifications';
COMMENT ON COLUMN food_analyses.environmental_impact IS 'Environmental impact assessment'; 