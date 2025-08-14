-- Fix database permissions for progressive week creation
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS for development
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;  
ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE sets DISABLE ROW LEVEL SECURITY;
ALTER TABLE mesocycles DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create policies that allow service role access
-- (Uncomment these if you prefer to keep RLS enabled)

/*
-- Enable RLS first
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;  
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesocycles ENABLE ROW LEVEL SECURITY;

-- Create policies for service role
CREATE POLICY "Service role can do everything on mesocycles" ON mesocycles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on weeks" ON weeks
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on workouts" ON workouts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on exercises" ON exercises
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on sets" ON sets
  FOR ALL USING (auth.role() = 'service_role');
*/

-- Check if the service role key is working
SELECT current_user, current_setting('role');
