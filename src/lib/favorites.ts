// Local-only Favorites storage (not synced with CineVault)

const FAVORITES_KEY = "cinetorrio_favorites";

export interface FavoriteItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  release_date?: string;
  first_air_date?: string;
  addedAt: number;
}

export const getFavorites = (): FavoriteItem[] => {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addToFavorites = (
  item: {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string;
    vote_average?: number;
    vote_count?: number;
    genre_ids?: number[];
    release_date?: string;
    first_air_date?: string;
  },
  mediaType: "movie" | "tv"
): void => {
  const favorites = getFavorites();
  const exists = favorites.some((f) => f.id === item.id && f.mediaType === mediaType);
  
  if (!exists) {
    favorites.unshift({
      id: item.id,
      mediaType,
      title: item.title || item.name || "Unknown",
      name: item.name || item.title,
      poster_path: item.poster_path || null,
      backdrop_path: item.backdrop_path || null,
      overview: item.overview,
      vote_average: item.vote_average,
      vote_count: item.vote_count,
      genre_ids: item.genre_ids,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      addedAt: Date.now(),
    });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
};

export const removeFromFavorites = (id: number, mediaType: "movie" | "tv"): void => {
  const favorites = getFavorites().filter(
    (f) => !(f.id === id && f.mediaType === mediaType)
  );
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const isInFavorites = (id: number, mediaType: "movie" | "tv"): boolean => {
  return getFavorites().some((f) => f.id === id && f.mediaType === mediaType);
};

export const clearFavorites = (): void => {
  localStorage.removeItem(FAVORITES_KEY);
};
