import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { createAuthenticatedClient, setClerkUserId } from "@/lib/supabaseWithAuth";
import { toast } from "sonner";

interface UserData {
  watchlist: WatchlistItemDB[];
  pinned: PinnedItemDB[];
  continueWatching: ContinueWatchingItemDB[];
  watchStats: WatchStatsDB;
  achievements: AchievementDB[];
  preferences: UserPreferencesDB | null;
}

export interface WatchlistItemDB {
  id: string;
  clerk_user_id: string;
  media_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  vote_average: number | null;
  release_date: string | null;
  added_at: string;
}

export interface PinnedItemDB {
  id: string;
  clerk_user_id: string;
  media_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  pinned_at: string;
}

export interface ContinueWatchingItemDB {
  id: string;
  clerk_user_id: string;
  media_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  progress: number;
  playback_time: number;
  duration: number;
  season: number | null;
  episode: number | null;
  episode_title: string | null;
  last_watched: string;
}

export interface WatchStatsDB {
  movies_watched: number;
  episodes_watched: number;
  seasons_completed: number;
  total_watch_time: number;
}

export interface AchievementDB {
  id: string;
  clerk_user_id: string;
  achievement_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  unlocked_at: string;
}

export interface UserPreferencesDB {
  id: string;
  clerk_user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  theme: string;
  ui_layout: string;
  language: string;
}

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  userId: string | null;
  userData: UserData | null;
  syncInProgress: boolean;
  // Watchlist
  addToWatchlist: (item: { mediaId: number; mediaType: "movie" | "tv"; title: string; posterPath: string | null; voteAverage?: number; releaseDate?: string }) => Promise<void>;
  removeFromWatchlist: (mediaId: number, mediaType: "movie" | "tv") => Promise<void>;
  isInWatchlist: (mediaId: number, mediaType: "movie" | "tv") => boolean;
  // Pinned
  pinItem: (item: { mediaId: number; mediaType: "movie" | "tv"; title: string; posterPath: string | null }) => Promise<void>;
  unpinItem: (mediaId: number, mediaType: "movie" | "tv") => Promise<void>;
  isPinned: (mediaId: number, mediaType: "movie" | "tv") => boolean;
  // Continue Watching
  updateContinueWatching: (item: { mediaId: number; mediaType: "movie" | "tv"; title: string; posterPath: string | null; progress: number; playbackTime: number; duration: number; season?: number; episode?: number; episodeTitle?: string }) => Promise<void>;
  removeContinueWatching: (mediaId: number, mediaType: "movie" | "tv", season?: number, episode?: number) => Promise<void>;
  getContinueWatchingItem: (mediaId: number, mediaType: "movie" | "tv", season?: number, episode?: number) => ContinueWatchingItemDB | undefined;
  // Stats
  incrementMoviesWatched: () => Promise<void>;
  incrementEpisodesWatched: () => Promise<void>;
  incrementSeasonsCompleted: () => Promise<void>;
  addWatchTime: (minutes: number) => Promise<void>;
  // Achievements
  unlockAchievement: (achievement: { id: string; title: string; description?: string; icon?: string }) => Promise<void>;
  // Preferences
  updatePreferences: (prefs: { theme?: string; uiLayout?: string; language?: string }) => Promise<void>;
  // Refresh
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useClerkAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);

  const userId = user?.id || null;

  // Create authenticated supabase client that updates when userId changes
  const supabase = useMemo(() => {
    setClerkUserId(userId);
    return createAuthenticatedClient(userId);
  }, [userId]);

  // Fetch all user data
  const fetchUserData = async () => {
    if (!userId) {
      setUserData(null);
      return;
    }

    try {
      const [watchlistRes, pinnedRes, continueRes, statsRes, achievementsRes, prefsRes] = await Promise.all([
        supabase.from("user_watchlist").select("*").eq("clerk_user_id", userId),
        supabase.from("user_pinned").select("*").eq("clerk_user_id", userId),
        supabase.from("user_continue_watching").select("*").eq("clerk_user_id", userId).order("last_watched", { ascending: false }),
        supabase.from("user_watch_stats").select("*").eq("clerk_user_id", userId).single(),
        supabase.from("user_achievements").select("*").eq("clerk_user_id", userId),
        supabase.from("user_preferences").select("*").eq("clerk_user_id", userId).single(),
      ]);

      setUserData({
        watchlist: (watchlistRes.data || []) as WatchlistItemDB[],
        pinned: (pinnedRes.data || []) as PinnedItemDB[],
        continueWatching: (continueRes.data || []) as ContinueWatchingItemDB[],
        watchStats: (statsRes.data || { movies_watched: 0, episodes_watched: 0, seasons_completed: 0, total_watch_time: 0 }) as WatchStatsDB,
        achievements: (achievementsRes.data || []) as AchievementDB[],
        preferences: prefsRes.data as UserPreferencesDB | null,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Initialize user in database
  const initializeUser = async () => {
    if (!userId || !user) return;

    setSyncInProgress(true);
    try {
      // Check if user exists
      const { data: existingPrefs } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("clerk_user_id", userId)
        .single();

      if (!existingPrefs) {
        // Create user preferences
        await supabase.from("user_preferences").insert({
          clerk_user_id: userId,
          email: user.primaryEmailAddress?.emailAddress || null,
          display_name: user.fullName || user.firstName || null,
          avatar_url: user.imageUrl || null,
        });

        // Create watch stats
        await supabase.from("user_watch_stats").insert({
          clerk_user_id: userId,
        });
      }

      await fetchUserData();
    } catch (error) {
      console.error("Error initializing user:", error);
    } finally {
      setSyncInProgress(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && userId) {
      initializeUser();
    } else {
      setUserData(null);
    }
  }, [isSignedIn, userId]);

  // Watchlist functions
  const addToWatchlist = async (item: { mediaId: number; mediaType: "movie" | "tv"; title: string; posterPath: string | null; voteAverage?: number; releaseDate?: string }) => {
    if (!userId) return;

    try {
      await supabase.from("user_watchlist").upsert({
        clerk_user_id: userId,
        media_id: item.mediaId,
        media_type: item.mediaType,
        title: item.title,
        poster_path: item.posterPath,
        vote_average: item.voteAverage || null,
        release_date: item.releaseDate || null,
      }, { onConflict: "clerk_user_id,media_id,media_type" });

      await fetchUserData();
      toast.success("Added to watchlist");
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      toast.error("Failed to add to watchlist");
    }
  };

  const removeFromWatchlist = async (mediaId: number, mediaType: "movie" | "tv") => {
    if (!userId) return;

    try {
      await supabase.from("user_watchlist")
        .delete()
        .eq("clerk_user_id", userId)
        .eq("media_id", mediaId)
        .eq("media_type", mediaType);

      await fetchUserData();
      toast.success("Removed from watchlist");
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  };

  const isInWatchlist = (mediaId: number, mediaType: "movie" | "tv"): boolean => {
    return userData?.watchlist.some(w => w.media_id === mediaId && w.media_type === mediaType) || false;
  };

  // Pinned functions
  const pinItem = async (item: { mediaId: number; mediaType: "movie" | "tv"; title: string; posterPath: string | null }) => {
    if (!userId) return;

    // Max 5 pinned items
    if ((userData?.pinned.length || 0) >= 5) {
      toast.error("Maximum 5 pinned items allowed");
      return;
    }

    try {
      await supabase.from("user_pinned").upsert({
        clerk_user_id: userId,
        media_id: item.mediaId,
        media_type: item.mediaType,
        title: item.title,
        poster_path: item.posterPath,
      }, { onConflict: "clerk_user_id,media_id,media_type" });

      await fetchUserData();
      toast.success("Pinned to favorites");
    } catch (error) {
      console.error("Error pinning item:", error);
    }
  };

  const unpinItem = async (mediaId: number, mediaType: "movie" | "tv") => {
    if (!userId) return;

    try {
      await supabase.from("user_pinned")
        .delete()
        .eq("clerk_user_id", userId)
        .eq("media_id", mediaId)
        .eq("media_type", mediaType);

      await fetchUserData();
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Error unpinning item:", error);
    }
  };

  const isPinned = (mediaId: number, mediaType: "movie" | "tv"): boolean => {
    return userData?.pinned.some(p => p.media_id === mediaId && p.media_type === mediaType) || false;
  };

  // Continue Watching functions
  const updateContinueWatching = async (item: { mediaId: number; mediaType: "movie" | "tv"; title: string; posterPath: string | null; progress: number; playbackTime: number; duration: number; season?: number; episode?: number; episodeTitle?: string }) => {
    if (!userId) return;

    try {
      await supabase.from("user_continue_watching").upsert({
        clerk_user_id: userId,
        media_id: item.mediaId,
        media_type: item.mediaType,
        title: item.title,
        poster_path: item.posterPath,
        progress: item.progress,
        playback_time: item.playbackTime,
        duration: item.duration,
        season: item.season || null,
        episode: item.episode || null,
        episode_title: item.episodeTitle || null,
        last_watched: new Date().toISOString(),
      }, { onConflict: "clerk_user_id,media_id,media_type,season,episode" });

      await fetchUserData();
    } catch (error) {
      console.error("Error updating continue watching:", error);
    }
  };

  const removeContinueWatching = async (mediaId: number, mediaType: "movie" | "tv", season?: number, episode?: number) => {
    if (!userId) return;

    try {
      let query = supabase.from("user_continue_watching")
        .delete()
        .eq("clerk_user_id", userId)
        .eq("media_id", mediaId)
        .eq("media_type", mediaType);

      if (season !== undefined) query = query.eq("season", season);
      if (episode !== undefined) query = query.eq("episode", episode);

      await query;
      await fetchUserData();
    } catch (error) {
      console.error("Error removing continue watching:", error);
    }
  };

  const getContinueWatchingItem = (mediaId: number, mediaType: "movie" | "tv", season?: number, episode?: number): ContinueWatchingItemDB | undefined => {
    return userData?.continueWatching.find(c =>
      c.media_id === mediaId &&
      c.media_type === mediaType &&
      (season === undefined || c.season === season) &&
      (episode === undefined || c.episode === episode)
    );
  };

  // Stats functions
  const updateStats = async (updates: Partial<WatchStatsDB>) => {
    if (!userId) return;

    try {
      const current = userData?.watchStats || { movies_watched: 0, episodes_watched: 0, seasons_completed: 0, total_watch_time: 0 };
      await supabase.from("user_watch_stats").upsert({
        clerk_user_id: userId,
        ...current,
        ...updates,
      }, { onConflict: "clerk_user_id" });

      await fetchUserData();
      checkAchievements({ ...current, ...updates });
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  const incrementMoviesWatched = async () => {
    const current = userData?.watchStats?.movies_watched || 0;
    await updateStats({ movies_watched: current + 1 });
  };

  const incrementEpisodesWatched = async () => {
    const current = userData?.watchStats?.episodes_watched || 0;
    await updateStats({ episodes_watched: current + 1 });
  };

  const incrementSeasonsCompleted = async () => {
    const current = userData?.watchStats?.seasons_completed || 0;
    await updateStats({ seasons_completed: current + 1 });
  };

  const addWatchTime = async (minutes: number) => {
    const current = userData?.watchStats?.total_watch_time || 0;
    await updateStats({ total_watch_time: current + minutes });
  };

  // Achievement check
  const ACHIEVEMENT_THRESHOLDS = [
    { id: "first_watch", title: "First Steps", icon: "🎬", stat: "movies_watched", threshold: 1 },
    { id: "movie_lover", title: "Movie Lover", icon: "🎥", stat: "movies_watched", threshold: 10 },
    { id: "film_buff", title: "Film Buff", icon: "🎞️", stat: "movies_watched", threshold: 25 },
    { id: "first_episode", title: "Episode One", icon: "🎯", stat: "episodes_watched", threshold: 1 },
    { id: "binge_watcher", title: "Binge Watcher", icon: "📺", stat: "episodes_watched", threshold: 50 },
    { id: "series_master", title: "Series Master", icon: "🏆", stat: "episodes_watched", threshold: 100 },
    { id: "marathon_runner", title: "Marathon Runner", icon: "⏱️", stat: "total_watch_time", threshold: 1440 },
  ];

  const checkAchievements = async (stats: WatchStatsDB) => {
    if (!userId) return;

    const unlockedIds = new Set(userData?.achievements.map(a => a.achievement_id) || []);

    for (const def of ACHIEVEMENT_THRESHOLDS) {
      if (unlockedIds.has(def.id)) continue;
      const value = stats[def.stat as keyof WatchStatsDB] as number;
      if (value >= def.threshold) {
        await unlockAchievement({ id: def.id, title: def.title, icon: def.icon });
      }
    }
  };

  const unlockAchievement = async (achievement: { id: string; title: string; description?: string; icon?: string }) => {
    if (!userId) return;

    try {
      await supabase.from("user_achievements").upsert({
        clerk_user_id: userId,
        achievement_id: achievement.id,
        title: achievement.title,
        description: achievement.description || null,
        icon: achievement.icon || null,
      }, { onConflict: "clerk_user_id,achievement_id" });

      await fetchUserData();
      toast.success(`🏆 Achievement Unlocked: ${achievement.title}`);
    } catch (error) {
      console.error("Error unlocking achievement:", error);
    }
  };

  // Preferences
  const updatePreferences = async (prefs: { theme?: string; uiLayout?: string; language?: string }) => {
    if (!userId) return;

    try {
      await supabase.from("user_preferences").update({
        theme: prefs.theme,
        ui_layout: prefs.uiLayout,
        language: prefs.language,
      }).eq("clerk_user_id", userId);

      await fetchUserData();
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  const refreshUserData = fetchUserData;

  return (
    <AuthContext.Provider value={{
      isSignedIn: isSignedIn || false,
      isLoaded,
      userId,
      userData,
      syncInProgress,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      pinItem,
      unpinItem,
      isPinned,
      updateContinueWatching,
      removeContinueWatching,
      getContinueWatchingItem,
      incrementMoviesWatched,
      incrementEpisodesWatched,
      incrementSeasonsCompleted,
      addWatchTime,
      unlockAchievement,
      updatePreferences,
      refreshUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
