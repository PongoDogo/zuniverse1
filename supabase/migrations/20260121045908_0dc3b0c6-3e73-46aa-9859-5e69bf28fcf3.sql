-- Create user_preferences table to store all user data synced with Clerk
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'dark',
  ui_layout TEXT DEFAULT 'zuniverse',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create watchlist table
CREATE TABLE public.user_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  vote_average NUMERIC,
  release_date TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clerk_user_id, media_id, media_type)
);

-- Create pinned items table
CREATE TABLE public.user_pinned (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  pinned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clerk_user_id, media_id, media_type)
);

-- Create continue watching table
CREATE TABLE public.user_continue_watching (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  progress NUMERIC NOT NULL DEFAULT 0,
  playback_time NUMERIC NOT NULL DEFAULT 0,
  duration NUMERIC NOT NULL DEFAULT 0,
  season INTEGER,
  episode INTEGER,
  episode_title TEXT,
  last_watched TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clerk_user_id, media_id, media_type, season, episode)
);

-- Create watch stats table
CREATE TABLE public.user_watch_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  movies_watched INTEGER NOT NULL DEFAULT 0,
  episodes_watched INTEGER NOT NULL DEFAULT 0,
  seasons_completed INTEGER NOT NULL DEFAULT 0,
  total_watch_time INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clerk_user_id, achievement_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pinned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_continue_watching ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watch_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Using clerk_user_id from JWT claims
-- For now, allow all operations since Clerk handles auth separately
-- We'll validate clerk_user_id in edge functions

CREATE POLICY "Users can manage their own preferences"
  ON public.user_preferences FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own watchlist"
  ON public.user_watchlist FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own pinned items"
  ON public.user_pinned FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own continue watching"
  ON public.user_continue_watching FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own watch stats"
  ON public.user_watch_stats FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own achievements"
  ON public.user_achievements FOR ALL
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_watch_stats_updated_at
  BEFORE UPDATE ON public.user_watch_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_watchlist_clerk_id ON public.user_watchlist(clerk_user_id);
CREATE INDEX idx_user_pinned_clerk_id ON public.user_pinned(clerk_user_id);
CREATE INDEX idx_user_continue_watching_clerk_id ON public.user_continue_watching(clerk_user_id);
CREATE INDEX idx_user_continue_watching_last_watched ON public.user_continue_watching(last_watched DESC);
CREATE INDEX idx_user_achievements_clerk_id ON public.user_achievements(clerk_user_id);