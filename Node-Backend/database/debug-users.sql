-- Debug script to check users and RLS policies
-- Run this in your Supabase SQL editor

-- 1. Check if the users table exists and has data
SELECT 
    'Table Info' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users
FROM public.users;

-- 2. Show all users (if you have admin access)
SELECT 
    id,
    username,
    fullname,
    amount,
    is_active,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- 3. Check RLS policies on the users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- 4. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 5. Test a specific username lookup (replace 'testuser' with the actual username you're testing)
SELECT 
    id,
    username,
    fullname,
    is_active
FROM public.users 
WHERE username = 'testuser' AND is_active = true; 