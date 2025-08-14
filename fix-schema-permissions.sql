-- Fix schema-level permissions for service role
-- Run this in your Supabase SQL Editor

-- Grant all privileges on the public schema to the service role
GRANT ALL ON SCHEMA public TO service_role;

-- Grant all privileges on all tables in public schema to service role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant all privileges on all sequences in public schema to service role  
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Set default privileges for future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- Specifically grant permissions on the tables we need
GRANT ALL PRIVILEGES ON mesocycles TO service_role;
GRANT ALL PRIVILEGES ON weeks TO service_role;
GRANT ALL PRIVILEGES ON workouts TO service_role;
GRANT ALL PRIVILEGES ON exercises TO service_role;
GRANT ALL PRIVILEGES ON sets TO service_role;

-- Check current permissions
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasinsert,
    hasupdate,
    hasdelete,
    hasselect
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('mesocycles', 'weeks', 'workouts', 'exercises', 'sets');

-- Show current role permissions
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
    AND table_name IN ('mesocycles', 'weeks', 'workouts', 'exercises', 'sets')
    AND grantee = 'service_role';
