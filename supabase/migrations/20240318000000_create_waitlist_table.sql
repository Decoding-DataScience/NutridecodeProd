-- Create the waitlist table if it doesn't exist
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    occupation TEXT,
    dietary_preferences TEXT[],
    health_goals TEXT[],
    reason_for_joining TEXT,
    how_did_you_hear TEXT,
    newsletter_opt_in BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    dietary_restrictions TEXT[],
    health_goals TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a function to create the waitlist table
CREATE OR REPLACE FUNCTION create_waitlist_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create the waitlist table if it doesn't exist
    CREATE TABLE IF NOT EXISTS waitlist (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone_number TEXT,
        occupation TEXT,
        dietary_preferences TEXT[],
        health_goals TEXT[],
        reason_for_joining TEXT,
        how_did_you_hear TEXT,
        newsletter_opt_in BOOLEAN DEFAULT true,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create the user_preferences table if it doesn't exist
    CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE,
        dietary_restrictions TEXT[],
        health_goals TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
END;
$$; 