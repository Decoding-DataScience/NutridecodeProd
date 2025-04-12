-- Add health_score column to food_analyses table
ALTER TABLE food_analyses
ADD COLUMN IF NOT EXISTS health_score integer;

-- Create index for health_score
CREATE INDEX IF NOT EXISTS idx_food_analyses_health_score ON food_analyses(health_score);

-- Comment on column
COMMENT ON COLUMN food_analyses.health_score IS 'Health score from 0-100 based on ingredient analysis'; 