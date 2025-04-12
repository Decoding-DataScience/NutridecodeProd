/*
  # Create User Preferences Schema

  1. New Table
    - `user_preferences`
      - Dietary restrictions
      - Allergens
      - Health goals
      - Notification settings
      - Sustainability preferences
*/

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Dietary Preferences
  dietary_restrictions text[] DEFAULT '{}',
  preferred_diets text[] DEFAULT '{}',
  
  -- Allergen Settings
  allergen_alerts text[] DEFAULT '{}',
  allergen_sensitivity text DEFAULT 'medium',
  
  -- Health Goals
  health_goals text[] DEFAULT '{}',
  daily_calorie_target integer,
  macro_preferences jsonb DEFAULT '{
    "protein": 30,
    "carbs": 40,
    "fats": 30
  }',
  
  -- Nutritional Preferences
  nutrients_to_track text[] DEFAULT '{}',
  nutrients_to_avoid text[] DEFAULT '{}',
  
  -- Ingredient Preferences
  ingredients_to_avoid text[] DEFAULT '{}',
  preferred_ingredients text[] DEFAULT '{}',
  
  -- Sustainability Preferences
  eco_conscious boolean DEFAULT false,
  packaging_preferences text[] DEFAULT '{}',
  
  -- Notification Settings
  notification_preferences jsonb DEFAULT '{
    "allergen_alerts": true,
    "health_insights": true,
    "sustainability_tips": true,
    "weekly_summary": true
  }',

  -- Metadata
  metadata jsonb DEFAULT '{}',

  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_updated_at ON user_preferences(updated_at); 