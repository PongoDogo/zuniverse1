import { supabase } from "@/lib/supabaseShared";

const CONTINUE_WATCHING_KEY = "cinetorrio_continue_watching";

// Database interface matching CineVault's user_collection table
export interface WatchlistItemDB {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  release_date: string | null;
  vote_average: number | null;
  genres: string[] | null;
  rating: number | null;
  watched_at: string | null;
  created_at: string;
}

// Legacy interface for compatibility with existing components
export interface WatchlistItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  release_date?: string;
  first_air_date?: string;
  addedAt: number;
  mediaType: "movie" | "tv";
}

export interface ContinueWatchingItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  progress: number;
  currentTime: number;
  duration: number;
  season?: number;
  episode?: number;
  episodeName?: string;
  lastWatched: number;
  startedAt?: number;
}

// Supabase-based watchlist functions
export const getWatchlistFromSupabase = async (userId: string): Promise<WatchlistItemDB[]> => {
  const { data, error } = await supabase
    .from('user_collection')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
  return data || [];
};

export const addToWatchlistSupabase = async (
  userId: string,
  item: {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    genre_ids?: number[];
  },
  mediaType: "movie" | "tv"
): Promise<void> => {
  const { error } = await supabase
    .from('user_collection')
    .upsert({
      user_id: userId,
      tmdb_id: item.id,
      media_type: mediaType,
      title: item.title || item.name || '',
      poster_path: item.poster_path || null,
      backdrop_path: item.backdrop_path || null,
      overview: item.overview || null,
      release_date: item.release_date || item.first_air_date || null,
      vote_average: item.vote_average || null,
      genres: item.genre_ids?.map(String) || null,
    }, {
      onConflict: 'user_id,tmdb_id',
    });

  if (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
};

export const removeFromWatchlistSupabase = async (
  userId: string,
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<void> => {
  const { error } = await supabase
    .from('user_collection')
    .delete()
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId);

  if (error) {
    console.error("Error removing from watchlist:", error);
    throw error;
  }
};

export const isInWatchlistSupabase = async (
  userId: string,
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<boolean> => {
  const { data } = await supabase
    .from('user_collection')
    .select('id')
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId)
    .maybeSingle();

  return !!data;
};

// Convert DB item to legacy format for component compatibility
export const convertDBToLegacy = (item: WatchlistItemDB): WatchlistItem => ({
  id: item.tmdb_id,
  title: item.title,
  name: item.title,
  poster_path: item.poster_path,
  backdrop_path: item.backdrop_path,
  overview: item.overview || "",
  vote_average: item.vote_average || 0,
  vote_count: 0,
  genre_ids: item.genres?.map(g => parseInt(g)).filter(n => !isNaN(n)) || [],
  release_date: item.release_date || undefined,
  addedAt: new Date(item.created_at).getTime(),
  mediaType: item.media_type,
});

// Legacy localStorage functions for fallback (non-authenticated users)
export const getWatchlist = (): WatchlistItem[] => {
  try {
    const data = localStorage.getItem("cinetorrio_watchlist");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addToWatchlist = (item: any, mediaType: "movie" | "tv"): void => {
  const watchlist = getWatchlist();
  if (!watchlist.find((w) => w.id === item.id && w.mediaType === mediaType)) {
    watchlist.unshift({
      ...item,
      mediaType,
      addedAt: Date.now(),
    });
    localStorage.setItem("cinetorrio_watchlist", JSON.stringify(watchlist));
  }
};

export const removeFromWatchlist = (id: number, mediaType: "movie" | "tv"): void => {
  const watchlist = getWatchlist().filter(
    (w) => !(w.id === id && w.mediaType === mediaType)
  );
  localStorage.setItem("cinetorrio_watchlist", JSON.stringify(watchlist));
};

export const isInWatchlist = (id: number, mediaType: "movie" | "tv"): boolean => {
  return getWatchlist().some((w) => w.id === id && w.mediaType === mediaType);
};

// Continue watching functions (localStorage - can be migrated later)
export const getContinueWatching = (): ContinueWatchingItem[] => {
  try {
    const data = localStorage.getItem(CONTINUE_WATCHING_KEY);
    const items = data ? JSON.parse(data) : [];
    return items.sort((a: ContinueWatchingItem, b: ContinueWatchingItem) =>
      b.lastWatched - a.lastWatched
    );
  } catch {
    return [];
  }
};

export const updateContinueWatching = (item: ContinueWatchingItem): void => {
  const continueWatching = getContinueWatching();
  const existingIndex = continueWatching.findIndex(
    (c) =>
      c.id === item.id &&
      c.mediaType === item.mediaType &&
      c.season === item.season &&
      c.episode === item.episode
  );

  if (existingIndex !== -1) {
    const existing = continueWatching[existingIndex];
    continueWatching[existingIndex] = {
      ...existing,
      ...item,
      startedAt: item.startedAt || existing.startedAt,
    };
  } else {
    continueWatching.unshift({
      ...item,
      startedAt: item.startedAt || Date.now(),
    });
  }

  const trimmed = continueWatching.slice(0, 20);
  localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(trimmed));
  window.dispatchEvent(new CustomEvent("continueWatchingUpdated"));
};

export const removeContinueWatching = (
  id: number,
  mediaType: "movie" | "tv",
  season?: number,
  episode?: number
): void => {
  const continueWatching = getContinueWatching().filter(
    (c) =>
      !(
        c.id === id &&
        c.mediaType === mediaType &&
        c.season === season &&
        c.episode === episode
      )
  );
  localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(continueWatching));
  window.dispatchEvent(new CustomEvent("continueWatchingUpdated"));
};

export const getContinueWatchingItem = (
  id: number,
  mediaType: "movie" | "tv",
  season?: number,
  episode?: number
): ContinueWatchingItem | undefined => {
  return getContinueWatching().find(
    (c) =>
      c.id === id &&
      c.mediaType === mediaType &&
      c.season === season &&
      c.episode === episode
  );
};

export const clearContinueWatching = (): void => {
  localStorage.removeItem(CONTINUE_WATCHING_KEY);
  window.dispatchEvent(new CustomEvent("continueWatchingUpdated"));
};

export const markAsComplete = (
  id: number,
  mediaType: "movie" | "tv",
  season?: number,
  episode?: number
): void => {
  removeContinueWatching(id, mediaType, season, episode);
};
