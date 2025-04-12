-- Add metadata column to food_analyses table
ALTER TABLE food_analyses
ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Create index for metadata temperature field
CREATE INDEX IF NOT EXISTS idx_food_analyses_metadata_temperature 
ON food_analyses USING gin ((metadata->'temperature'));

-- Create index for metadata timestamp
CREATE INDEX IF NOT EXISTS idx_food_analyses_metadata_timestamp 
ON food_analyses USING gin ((metadata->'timestamp'));