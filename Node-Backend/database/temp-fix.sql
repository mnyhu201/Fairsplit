-- TEMPORARY FIX: Disable RLS for testing
-- WARNING: Only use this for testing, re-enable for production

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Test query should now work
SELECT 
    id,
    username,
    fullname,
    is_active
FROM public.users 
WHERE username = 'testuser' AND is_active = true; 