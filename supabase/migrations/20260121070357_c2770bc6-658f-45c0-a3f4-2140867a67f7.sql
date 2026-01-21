-- Fix security vulnerability: Replace clerk_user_id header-based RLS with Supabase native auth.uid()
-- This eliminates the critical CLIENT_SIDE_AUTH bypass vulnerability

-- Step 1: Create a secure function that uses Supabase's native auth.uid()
-- This replaces the insecure get_clerk_user_id() that trusted client headers
CREATE OR REPLACE FUNCTION public.get_authenticated_user_id()
RETURNS TEXT AS $$
BEGIN
  -- Use Supabase's native auth.uid() which is cryptographically verified
  -- This cannot be spoofed by clients
  RETURN (SELECT auth.uid()::text);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 2: Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE with auth.uid()

-- user_watchlist policies
DROP POLICY IF EXISTS "Users can delete from their own watchlist" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can insert to their own watchlist" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can update their own watchlist" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can view their own watchlist" ON public.user_watchlist;

CREATE POLICY "Users can view their own watchlist"
ON public.user_watchlist FOR SELECT
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can insert to their own watchlist"
ON public.user_watchlist FOR INSERT
WITH CHECK (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own watchlist"
ON public.user_watchlist FOR UPDATE
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can delete from their own watchlist"
ON public.user_watchlist FOR DELETE
USING (clerk_user_id = auth.uid()::text);

-- user_pinned policies
DROP POLICY IF EXISTS "Users can delete from their own pinned items" ON public.user_pinned;
DROP POLICY IF EXISTS "Users can insert to their own pinned items" ON public.user_pinned;
DROP POLICY IF EXISTS "Users can update their own pinned items" ON public.user_pinned;
DROP POLICY IF EXISTS "Users can view their own pinned items" ON public.user_pinned;

CREATE POLICY "Users can view their own pinned items"
ON public.user_pinned FOR SELECT
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can insert to their own pinned items"
ON public.user_pinned FOR INSERT
WITH CHECK (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own pinned items"
ON public.user_pinned FOR UPDATE
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can delete from their own pinned items"
ON public.user_pinned FOR DELETE
USING (clerk_user_id = auth.uid()::text);

-- user_continue_watching policies
DROP POLICY IF EXISTS "Users can delete from their own continue watching" ON public.user_continue_watching;
DROP POLICY IF EXISTS "Users can insert to their own continue watching" ON public.user_continue_watching;
DROP POLICY IF EXISTS "Users can update their own continue watching" ON public.user_continue_watching;
DROP POLICY IF EXISTS "Users can view their own continue watching" ON public.user_continue_watching;

CREATE POLICY "Users can view their own continue watching"
ON public.user_continue_watching FOR SELECT
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can insert to their own continue watching"
ON public.user_continue_watching FOR INSERT
WITH CHECK (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own continue watching"
ON public.user_continue_watching FOR UPDATE
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can delete from their own continue watching"
ON public.user_continue_watching FOR DELETE
USING (clerk_user_id = auth.uid()::text);

-- user_preferences policies
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;

CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences FOR UPDATE
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences FOR DELETE
USING (clerk_user_id = auth.uid()::text);

-- user_watch_stats policies
DROP POLICY IF EXISTS "Users can delete from their own watch stats" ON public.user_watch_stats;
DROP POLICY IF EXISTS "Users can insert to their own watch stats" ON public.user_watch_stats;
DROP POLICY IF EXISTS "Users can update their own watch stats" ON public.user_watch_stats;
DROP POLICY IF EXISTS "Users can view their own watch stats" ON public.user_watch_stats;

CREATE POLICY "Users can view their own watch stats"
ON public.user_watch_stats FOR SELECT
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can insert to their own watch stats"
ON public.user_watch_stats FOR INSERT
WITH CHECK (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own watch stats"
ON public.user_watch_stats FOR UPDATE
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can delete from their own watch stats"
ON public.user_watch_stats FOR DELETE
USING (clerk_user_id = auth.uid()::text);

-- user_achievements policies
DROP POLICY IF EXISTS "Users can delete from their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert to their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can update their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;

CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can insert to their own achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own achievements"
ON public.user_achievements FOR UPDATE
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can delete from their own achievements"
ON public.user_achievements FOR DELETE
USING (clerk_user_id = auth.uid()::text);