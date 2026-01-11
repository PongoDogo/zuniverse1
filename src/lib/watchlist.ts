import { Movie } from "./tmdb";

const WATCHLIST_KEY = "zuniverse_watchlist";
const CONTINUE_WATCHING_KEY = "zuniverse_continue_watching";

export interface WatchlistItem extends Movie {
  addedAt: number;
  mediaType: "movie" | "tv";
}

export interface ContinueWatchingItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  progress: number; // percentage 0-100
  currentTime: number; // seconds watched
  duration: number; // total duration in seconds
  season?: number;
  episode?: number;
  episodeName?: string;
  lastWatched: number;
  startedAt?: number; // when user started watching this session
}

// Watchlist functions
export const getWatchlist = (): WatchlistItem[] => {
  try {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addToWatchlist = (item: Movie, mediaType: "movie" | "tv"): void => {
  const watchlist = getWatchlist();
  if (!watchlist.find((w) => w.id === item.id && w.mediaType === mediaType)) {
    watchlist.unshift({
      ...item,
      mediaType,
      addedAt: Date.now(),
    });
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }
};

export const removeFromWatchlist = (id: number, mediaType: "movie" | "tv"): void => {
  const watchlist = getWatchlist().filter(
    (w) => !(w.id === id && w.mediaType === mediaType)
  );
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
};

export const isInWatchlist = (id: number, mediaType: "movie" | "tv"): boolean => {
  return getWatchlist().some((w) => w.id === id && w.mediaType === mediaType);
};

// Continue watching functions
export const getContinueWatching = (): ContinueWatchingItem[] => {
  try {
    const data = localStorage.getItem(CONTINUE_WATCHING_KEY);
    const items = data ? JSON.parse(data) : [];
    // Sort by last watched, most recent first
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
    // Preserve startedAt if not provided, merge with existing
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

  // Keep only last 20 items
  const trimmed = continueWatching.slice(0, 20);
  localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(trimmed));
  
  // Dispatch event for real-time updates
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
