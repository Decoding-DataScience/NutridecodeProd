/*
  # Create Analysis Storage Schema

  1. New Tables
    - `food_analyses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `additives` (text[])
      - `allergens` (text[])
      - `health_concerns` (text[])
      - `health_recommendations` (text[])
      - `calories` (numeric)
      - `protein` (numeric)
      - `carbs` (numeric)
      - `fats` (numeric)
      - `sugar` (numeric)
      - `packaging` (text)
      - `sustainability` (text)
      - `eco_recommendations` (text[])

  2. Security
    - Enable RLS on `food_analyses` table
    - Add policies for authenticated users to:
      - Insert their own analyses
      - Read their own analyses
*/

-- Create food analyses table
CREATE TABLE IF NOT EXISTS food_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  additives text[],
  allergens text[],
  health_concerns text[],
  health_recommendations text[],
  calories numeric,
  protein numeric,
  carbs numeric,
  fats numeric,
  sugar numeric,
  packaging text,
  sustainability text,
  eco_recommendations text[],
  
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE food_analyses ENABLE ROW LEVEL SECURITY;

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