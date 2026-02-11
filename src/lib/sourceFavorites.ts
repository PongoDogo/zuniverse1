// Source favorites - remember user's preferred streaming sources

const SOURCE_FAVORITES_KEY = "cinetorrio_source_favorites";
const MAX_FAVORITES = 5;

export const getSourceFavorites = (): string[] => {
  try {
    const data = localStorage.getItem(SOURCE_FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const isSourceFavorite = (sourceId: string): boolean => {
  return getSourceFavorites().includes(sourceId);
};

export const toggleSourceFavorite = (sourceId: string): boolean => {
  const favorites = getSourceFavorites();
  const index = favorites.indexOf(sourceId);
  if (index >= 0) {
    favorites.splice(index, 1);
    localStorage.setItem(SOURCE_FAVORITES_KEY, JSON.stringify(favorites));
    return false;
  } else {
    if (favorites.length >= MAX_FAVORITES) favorites.pop();
    favorites.unshift(sourceId);
    localStorage.setItem(SOURCE_FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  }
};
