-- Create a function to get clerk_user_id from request headers
-- This function reads from a custom header that the client will set
CREATE OR REPLACE FUNCTION public.get_clerk_user_id()
RETURNS TEXT AS $$
DECLARE
  header_value TEXT;
BEGIN
  -- Try to get clerk_user_id from request header
  header_value := current_setting('request.headers', true)::json->>'x-clerk-user-id';
  RETURN header_value;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can manage their own watchlist" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can manage their own pinned items" ON public.user_pinned;
DROP POLICY IF EXISTS "Users can manage their own continue watching" ON public.user_continue_watching;
DROP POLICY IF EXISTS "Users can manage their own watch stats" ON public.user_watch_stats;
DROP POLICY IF EXISTS "Users can manage their own achievements" ON public.user_achievements;

-- Create secure RLS policies that validate clerk_user_id
-- user_preferences policies
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can delete their own preferences"
  ON public.user_preferences FOR DELETE
  USING (clerk_user_id = public.get_clerk_user_id());

-- user_watchlist policies
CREATE POLICY "Users can view their own watchlist"
  ON public.user_watchlist FOR SELECT
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can insert to their own watchlist"
  ON public.user_watchlist FOR INSERT
  WITH CHECK (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can update their own watchlist"
  ON public.user_watchlist FOR UPDATE
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can delete from their own watchlist"
  ON public.user_watchlist FOR DELETE
  USING (clerk_user_id = public.get_clerk_user_id());

-- user_pinned policies
CREATE POLICY "Users can view their own pinned items"
  ON public.user_pinned FOR SELECT
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can insert to their own pinned items"
  ON public.user_pinned FOR INSERT
  WITH CHECK (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can update their own pinned items"
  ON public.user_pinned FOR UPDATE
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can delete from their own pinned items"
  ON public.user_pinned FOR DELETE
  USING (clerk_user_id = public.get_clerk_user_id());

-- user_continue_watching policies
CREATE POLICY "Users can view their own continue watching"
  ON public.user_continue_watching FOR SELECT
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can insert to their own continue watching"
  ON public.user_continue_watching FOR INSERT
  WITH CHECK (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can update their own continue watching"
  ON public.user_continue_watching FOR UPDATE
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can delete from their own continue watching"
  ON public.user_continue_watching FOR DELETE
  USING (clerk_user_id = public.get_clerk_user_id());

-- user_watch_stats policies
CREATE POLICY "Users can view their own watch stats"
  ON public.user_watch_stats FOR SELECT
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can insert to their own watch stats"
  ON public.user_watch_stats FOR INSERT
  WITH CHECK (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can update their own watch stats"
  ON public.user_watch_stats FOR UPDATE
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can delete from their own watch stats"
  ON public.user_watch_stats FOR DELETE
  USING (clerk_user_id = public.get_clerk_user_id());

-- user_achievements policies
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can insert to their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can update their own achievements"
  ON public.user_achievements FOR UPDATE
  USING (clerk_user_id = public.get_clerk_user_id());

CREATE POLICY "Users can delete from their own achievements"
  ON public.user_achievements FOR DELETE
  USING (clerk_user_id = public.get_clerk_user_id());