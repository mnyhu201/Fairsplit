-- Fix for RLS policies to allow public access to user profiles
-- Run this in your Supabase SQL editor

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all active users" ON public.users;

-- Create new policies that allow public access to active users
CREATE POLICY "Public can view active users" ON public.users
    FOR SELECT USING (is_active = true);

-- Users can view their own profile (even if inactive)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Keep existing policies for other operations
-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile (soft delete)
CREATE POLICY "Users can delete own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id); 