-- Create user_collection table to sync watched items with CineVault
CREATE TABLE public.user_collection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  overview TEXT,
  release_date TEXT,
  vote_average NUMERIC,
  genres TEXT[],
  rating NUMERIC,
  watched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tmdb_id, media_type)
);

-- Enable RLS
ALTER TABLE public.user_collection ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_collection
CREATE POLICY "Users can view their own collection"
ON public.user_collection
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own collection"
ON public.user_collection
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collection"
ON public.user_collection
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own collection"
ON public.user_collection
FOR DELETE
USING (auth.uid() = user_id);