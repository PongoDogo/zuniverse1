// Favorites reorder utility
import { FavoriteItem, getFavorites } from "./favorites";

const FAVORITES_KEY = "cinetorrio_favorites";

export const reorderFavorites = (fromIndex: number, toIndex: number): FavoriteItem[] => {
  const items = getFavorites();
  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  return items;
};
