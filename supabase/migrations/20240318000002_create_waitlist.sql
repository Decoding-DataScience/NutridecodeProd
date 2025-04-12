-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone_number text,
    occupation text,
    dietary_preferences text[] DEFAULT '{}',
    health_goals text[] DEFAULT '{}',
    reason_for_joining text,
    how_did_you_hear text,
    newsletter_opt_in boolean DEFAULT true,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own waitlist entry"
    ON public.waitlist FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own waitlist entry"
    ON public.waitlist FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own waitlist entry"
    ON public.waitlist FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id 
ON public.waitlist(user_id);

CREATE INDEX IF NOT EXISTS idx_waitlist_email 
ON public.waitlist(email);

CREATE INDEX IF NOT EXISTS idx_waitlist_status 
ON public.waitlist(status); 