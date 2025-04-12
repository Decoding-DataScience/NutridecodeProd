-- Drop existing table if it exists
DROP TABLE IF EXISTS public.waitlist;

-- Create waitlist table with proper structure
CREATE TABLE public.waitlist (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users,
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

-- Add unique constraint on email
ALTER TABLE public.waitlist ADD CONSTRAINT waitlist_email_unique UNIQUE (email);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own waitlist entry" ON public.waitlist;
    DROP POLICY IF EXISTS "Users can insert their own waitlist entry" ON public.waitlist;
    DROP POLICY IF EXISTS "Users can update their own waitlist entry" ON public.waitlist;
    DROP POLICY IF EXISTS "Anyone can insert waitlist entry" ON public.waitlist;

    -- Create new policies
    CREATE POLICY "Users can view their own waitlist entry"
        ON public.waitlist FOR SELECT
        USING (auth.uid() = user_id OR auth.uid() IS NULL);

    CREATE POLICY "Anyone can insert waitlist entry"
        ON public.waitlist FOR INSERT
        WITH CHECK (true);

    CREATE POLICY "Users can update their own waitlist entry"
        ON public.waitlist FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON public.waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);

-- Grant permissions
GRANT ALL ON public.waitlist TO authenticated;
GRANT ALL ON public.waitlist TO anon;
GRANT ALL ON public.waitlist TO service_role;

-- Create function to handle waitlist entry
CREATE OR REPLACE FUNCTION handle_waitlist_entry()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating timestamp
DROP TRIGGER IF EXISTS update_waitlist_timestamp ON public.waitlist;
CREATE TRIGGER update_waitlist_timestamp
    BEFORE UPDATE ON public.waitlist
    FOR EACH ROW
    EXECUTE FUNCTION handle_waitlist_entry(); 