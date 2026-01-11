// User preferences, profiles, achievements, pinned favorites, and notifications

export type Theme = "dark" | "light" | "cinematic";

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  theme: Theme;
  createdAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  titleEl?: string;
  description: string;
  descriptionEl?: string;
  icon: string;
  unlockedAt: number;
  progress?: number;
  target?: number;
}

export interface PinnedItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  pinnedAt: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  mediaId?: number;
  mediaType?: "movie" | "tv";
  read: boolean;
  createdAt: number;
}

const PREFERENCES_KEY = "zuniverse_preferences";
const PROFILES_KEY = "zuniverse_profiles";
const ACTIVE_PROFILE_KEY = "zuniverse_active_profile";
const ACHIEVEMENTS_KEY = "zuniverse_achievements";
const PINNED_KEY = "zuniverse_pinned";
const NOTIFICATIONS_KEY = "zuniverse_notifications";
const WATCH_STATS_KEY = "zuniverse_watch_stats";

const DEFAULT_AVATARS = [
  "🎬", "🎭", "🎪", "🎯", "🎲", "🎮", "🎸", "🎤", "🎧", "🎹",
  "🦊", "🐱", "🐶", "🦁", "🐼", "🦄", "🐲", "🦅", "🐺", "🦋"
];

// Theme management
export const getTheme = (): Theme => {
  try {
    const prefs = localStorage.getItem(PREFERENCES_KEY);
    if (prefs) {
      const parsed = JSON.parse(prefs);
      return parsed.theme || "dark";
    }
  } catch {}
  return "dark";
};

export const setTheme = (theme: Theme): void => {
  try {
    const prefs = localStorage.getItem(PREFERENCES_KEY);
    const parsed = prefs ? JSON.parse(prefs) : {};
    parsed.theme = theme;
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(parsed));
    applyTheme(theme);
  } catch {}
};

export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.classList.remove("dark", "light", "cinematic");
  root.classList.add(theme);
  root.setAttribute("data-theme", theme);
};

// Profile management
export const getProfiles = (): UserProfile[] => {
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const createProfile = (name: string, avatar?: string): UserProfile => {
  const profiles = getProfiles();
  const newProfile: UserProfile = {
    id: crypto.randomUUID(),
    name,
    avatar: avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
    theme: "dark",
    createdAt: Date.now(),
  };
  profiles.push(newProfile);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  return newProfile;
};

export const updateProfile = (id: string, updates: Partial<UserProfile>): void => {
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === id);
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...updates };
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }
};

export const deleteProfile = (id: string): void => {
  const profiles = getProfiles().filter(p => p.id !== id);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

export const getActiveProfile = (): UserProfile | null => {
  try {
    const id = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (id) {
      const profiles = getProfiles();
      return profiles.find(p => p.id === id) || null;
    }
  } catch {}
  return null;
};

export const setActiveProfile = (id: string): void => {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  const profile = getProfiles().find(p => p.id === id);
  if (profile) {
    applyTheme(profile.theme);
  }
};

export const getDefaultAvatars = (): string[] => DEFAULT_AVATARS;

// Watch stats for achievements
export interface WatchStats {
  episodesWatched: number;
  moviesWatched: number;
  seasonsCompleted: number;
  totalWatchTime: number; // in minutes
  seriesCompleted: number[];
  lastUpdated: number;
}

export const getWatchStats = (): WatchStats => {
  try {
    const data = localStorage.getItem(WATCH_STATS_KEY);
    return data ? JSON.parse(data) : {
      episodesWatched: 0,
      moviesWatched: 0,
      seasonsCompleted: 0,
      totalWatchTime: 0,
      seriesCompleted: [],
      lastUpdated: Date.now(),
    };
  } catch {
    return {
      episodesWatched: 0,
      moviesWatched: 0,
      seasonsCompleted: 0,
      totalWatchTime: 0,
      seriesCompleted: [],
      lastUpdated: Date.now(),
    };
  }
};

export const updateWatchStats = (update: Partial<WatchStats>): void => {
  const stats = getWatchStats();
  const newStats = { ...stats, ...update, lastUpdated: Date.now() };
  localStorage.setItem(WATCH_STATS_KEY, JSON.stringify(newStats));
  checkAchievements(newStats);
};

export const incrementEpisodesWatched = (): void => {
  const stats = getWatchStats();
  stats.episodesWatched += 1;
  stats.lastUpdated = Date.now();
  localStorage.setItem(WATCH_STATS_KEY, JSON.stringify(stats));
  checkAchievements(stats);
};

export const incrementMoviesWatched = (): void => {
  const stats = getWatchStats();
  stats.moviesWatched += 1;
  stats.lastUpdated = Date.now();
  localStorage.setItem(WATCH_STATS_KEY, JSON.stringify(stats));
  checkAchievements(stats);
};

export const addWatchTime = (minutes: number): void => {
  const stats = getWatchStats();
  stats.totalWatchTime += minutes;
  stats.lastUpdated = Date.now();
  localStorage.setItem(WATCH_STATS_KEY, JSON.stringify(stats));
  checkAchievements(stats);
};

export const incrementSeasonsCompleted = (): void => {
  const stats = getWatchStats();
  stats.seasonsCompleted += 1;
  stats.lastUpdated = Date.now();
  localStorage.setItem(WATCH_STATS_KEY, JSON.stringify(stats));
  checkAchievements(stats);
};

// Achievements
export const getAchievements = (): Achievement[] => {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const unlockAchievement = (achievement: Omit<Achievement, "unlockedAt">): boolean => {
  const achievements = getAchievements();
  if (achievements.some(a => a.id === achievement.id)) {
    return false; // Already unlocked
  }
  achievements.push({ ...achievement, unlockedAt: Date.now() });
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  
  // Dispatch event for UI notification
  window.dispatchEvent(new CustomEvent("achievementUnlocked", { 
    detail: { ...achievement, unlockedAt: Date.now() } 
  }));
  
  return true;
};

export const ACHIEVEMENT_DEFINITIONS = [
  { 
    id: "first_watch", 
    title: "First Steps", 
    titleEl: "Πρώτα Βήματα",
    description: "Watched your first content", 
    descriptionEl: "Είδατε το πρώτο σας περιεχόμενο",
    icon: "🎬", 
    threshold: 1, 
    stat: "moviesWatched" 
  },
  { 
    id: "movie_lover", 
    title: "Movie Lover", 
    titleEl: "Λάτρης Ταινιών",
    description: "Watched 10 movies", 
    descriptionEl: "Είδατε 10 ταινίες",
    icon: "🎥", 
    threshold: 10, 
    stat: "moviesWatched" 
  },
  { 
    id: "film_buff", 
    title: "Film Buff", 
    titleEl: "Κινηματογραφόφιλος",
    description: "Watched 25 movies", 
    descriptionEl: "Είδατε 25 ταινίες",
    icon: "🎞️", 
    threshold: 25, 
    stat: "moviesWatched" 
  },
  { 
    id: "binge_watcher", 
    title: "Binge Watcher", 
    titleEl: "Binge Watcher",
    description: "Watched 50 episodes", 
    descriptionEl: "Είδατε 50 επεισόδια",
    icon: "📺", 
    threshold: 50, 
    stat: "episodesWatched" 
  },
  { 
    id: "series_master", 
    title: "Series Master", 
    titleEl: "Μετρ των Σειρών",
    description: "Watched 100 episodes", 
    descriptionEl: "Είδατε 100 επεισόδια",
    icon: "🏆", 
    threshold: 100, 
    stat: "episodesWatched" 
  },
  { 
    id: "tv_addict", 
    title: "TV Addict", 
    titleEl: "Εθισμένος στην TV",
    description: "Watched 200 episodes", 
    descriptionEl: "Είδατε 200 επεισόδια",
    icon: "📡", 
    threshold: 200, 
    stat: "episodesWatched" 
  },
  { 
    id: "season_finisher", 
    title: "Season Finisher", 
    titleEl: "Ολοκληρωτής Σεζόν",
    description: "Completed 5 seasons", 
    descriptionEl: "Ολοκληρώσατε 5 σεζόν",
    icon: "🎭", 
    threshold: 5, 
    stat: "seasonsCompleted" 
  },
  { 
    id: "marathon_runner", 
    title: "Marathon Runner", 
    titleEl: "Μαραθωνοδρόμος",
    description: "Watched for 24 hours total", 
    descriptionEl: "Είδατε συνολικά 24 ώρες",
    icon: "⏱️", 
    threshold: 1440, 
    stat: "totalWatchTime" 
  },
  { 
    id: "time_traveler", 
    title: "Time Traveler", 
    titleEl: "Ταξιδιώτης του Χρόνου",
    description: "Watched for 100 hours total", 
    descriptionEl: "Είδατε συνολικά 100 ώρες",
    icon: "⌛", 
    threshold: 6000, 
    stat: "totalWatchTime" 
  },
  { 
    id: "first_episode", 
    title: "Episode One", 
    titleEl: "Επεισόδιο Ένα",
    description: "Watched your first episode", 
    descriptionEl: "Είδατε το πρώτο σας επεισόδιο",
    icon: "🎯", 
    threshold: 1, 
    stat: "episodesWatched" 
  },
];

const checkAchievements = (stats: WatchStats): void => {
  ACHIEVEMENT_DEFINITIONS.forEach(def => {
    const statValue = stats[def.stat as keyof WatchStats] as number;
    if (statValue >= def.threshold) {
      unlockAchievement({
        id: def.id,
        title: def.title,
        titleEl: def.titleEl,
        description: def.description,
        descriptionEl: def.descriptionEl,
        icon: def.icon,
        progress: statValue,
        target: def.threshold,
      });
    }
  });
};

export const getAchievementProgress = (): { 
  unlocked: Achievement[], 
  inProgress: { id: string, title: string, titleEl?: string, icon: string, progress: number, target: number }[] 
} => {
  const achievements = getAchievements();
  const stats = getWatchStats();
  const unlockedIds = new Set(achievements.map(a => a.id));
  
  const inProgress = ACHIEVEMENT_DEFINITIONS
    .filter(def => !unlockedIds.has(def.id))
    .map(def => ({
      id: def.id,
      title: def.title,
      titleEl: def.titleEl,
      icon: def.icon,
      progress: (stats[def.stat as keyof WatchStats] as number) || 0,
      target: def.threshold,
    }))
    .filter(a => a.progress > 0 || a.target <= 1) // Show first-time achievements
    .sort((a, b) => (b.progress / b.target) - (a.progress / a.target))
    .slice(0, 4);
  
  return { unlocked: achievements, inProgress };
};

// Pinned favorites
export const getPinnedItems = (): PinnedItem[] => {
  try {
    const data = localStorage.getItem(PINNED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const pinItem = (item: Omit<PinnedItem, "pinnedAt">): void => {
  const pinned = getPinnedItems();
  if (!pinned.some(p => p.id === item.id && p.mediaType === item.mediaType)) {
    pinned.unshift({ ...item, pinnedAt: Date.now() });
    // Keep max 5 pinned items
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinned.slice(0, 5)));
  }
};

export const unpinItem = (id: number, mediaType: "movie" | "tv"): void => {
  const pinned = getPinnedItems().filter(p => !(p.id === id && p.mediaType === mediaType));
  localStorage.setItem(PINNED_KEY, JSON.stringify(pinned));
};

export const isPinned = (id: number, mediaType: "movie" | "tv"): boolean => {
  return getPinnedItems().some(p => p.id === id && p.mediaType === mediaType);
};

// Notifications
export const getNotifications = (): Notification[] => {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications = data ? JSON.parse(data) : [];
    // Only keep notifications from last 7 days
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return notifications.filter((n: Notification) => n.createdAt > weekAgo);
  } catch {
    return [];
  }
};

export const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">): void => {
  const notifications = getNotifications();
  notifications.unshift({
    ...notification,
    id: crypto.randomUUID(),
    read: false,
    createdAt: Date.now(),
  });
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 20)));
};

export const markNotificationRead = (id: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
};

export const markAllNotificationsRead = (): void => {
  const notifications = getNotifications().map(n => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const getUnreadCount = (): number => {
  return getNotifications().filter(n => !n.read).length;
};

export const clearNotifications = (): void => {
  localStorage.removeItem(NOTIFICATIONS_KEY);
};
