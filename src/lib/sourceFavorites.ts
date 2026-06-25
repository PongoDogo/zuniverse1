const KEY = "favoriteStreamingSources";

const read = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const write = (list: string[]) => {
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const isSourceFavorite = (id: string): boolean => read().includes(id);

export const toggleSourceFavorite = (id: string): boolean => {
  const list = read();
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
    write(list);
    return false;
  }
  list.push(id);
  write(list);
  return true;
};

export const getFavoriteSources = (): string[] => read();
