import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseShared";
import { toast } from "sonner";

// CineVault's user_collection schema - exported for use in hooks
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

export interface ContinueWatchingItemDB {
  id: string;
  user_id: string;
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

interface PinnedItemDB {
  id: string;
  user_id: string;
  media_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  pinned_at: string;
}

interface WatchStatsDB {
  movies_watched: number;
  episodes_watched: number;
  seasons_completed: number;
  total_watch_time: number;
}

interface AchievementDB {
  id: string;
  user_id: string;
  achievement_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  unlocked_at: string;
}

interface UserPreferencesDB {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  theme: string;
  ui_layout: string;
  language: string;
}

interface UserData {
  watchlist: WatchlistItemDB[];
  pinned: PinnedItemDB[];
  continueWatching: ContinueWatchingItemDB[];
  watchStats: WatchStatsDB;
  achievements: AchievementDB[];
  preferences: UserPreferencesDB | null;
}

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isSignedIn: boolean;
  userData: UserData | null;
  syncInProgress: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
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

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);

  const userId = user?.id || null;
  const isSignedIn = !!user;

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user data when user changes
  useEffect(() => {
    if (userId) {
      fetchUserData();
    } else {
      setUserData(null);
    }
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) {
      setUserData(null);
      return;
    }

    try {
      setSyncInProgress(true);
      // Use user_collection table from CineVault's shared backend
      const [watchlistRes, pinnedRes, continueRes, statsRes, achievementsRes, prefsRes] = await Promise.all([
        supabase.from("user_collection").select("*").eq("user_id", userId),
        supabase.from("pinned_favorites").select("*").eq("user_id", userId),
        supabase.from("continue_watching").select("*").eq("user_id", userId).order("last_watched", { ascending: false }),
        supabase.from("user_stats").select("*").eq("user_id", userId).single(),
        supabase.from("achievements").select("*").eq("user_id", userId),
        supabase.from("profiles").select("*").eq("id", userId).single(),
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
    } finally {
      setSyncInProgress(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success("Account created! Check your email to confirm.");
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success("Welcome back!");
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserData(null);
    toast.success("Signed out");
  };

  // Collection/Watchlist functions - uses CineVault's user_collection table
  const addToWatchlist = async (item: { mediaId: number; mediaType: "movie" | "tv"; title: string; posterPath: string | null; backdropPath?: string | null; overview?: string; voteAverage?: number; releaseDate?: string; genres?: string[] }) => {
    if (!userId) return;

    try {
      await supabase.from("user_collection").upsert({
        user_id: userId,
        tmdb_id: item.mediaId,
        media_type: item.mediaType,
        title: item.title,
        poster_path: item.posterPath,
        backdrop_path: item.backdropPath || null,
        overview: item.overview || null,
        vote_average: item.voteAverage || null,
        release_date: item.releaseDate || null,
        genres: item.genres || null,
      }, { onConflict: "user_id,tmdb_id" });

      await fetchUserData();
      toast.success("Added to collection");
    } catch (error) {
      console.error("Error adding to collection:", error);
      toast.error("Failed to add to collection");
    }
  };

  const removeFromWatchlist = async (mediaId: number, mediaType: "movie" | "tv") => {
    if (!userId) return;

    try {
      await supabase.from("user_collection")
        .delete()
        .eq("user_id", userId)
        .eq("tmdb_id", mediaId);

      await fetchUserData();
      toast.success("Removed from collection");
    } catch (error) {
      console.error("Error removing from collection:", error);
    }
  };

  const isInWatchlist = (mediaId: number, mediaType: "movie" | "tv"): boolean => {
    return userData?.watchlist.some(w => w.tmdb_id === mediaId && w.media_type === mediaType) || false;
  };

  // Pinned functions
  const pinItem = async (item: { mediaId: number; mediaType: "movie" | "tv"; title: string; posterPath: string | null }) => {
    if (!userId) return;

    if ((userData?.pinned.length || 0) >= 5) {
      toast.error("Maximum 5 pinned items allowed");
      return;
    }

    try {
      await supabase.from("pinned_favorites").upsert({
        user_id: userId,
        media_id: item.mediaId,
        media_type: item.mediaType,
        title: item.title,
        poster_path: item.posterPath,
      }, { onConflict: "user_id,media_id,media_type" });

      await fetchUserData();
      toast.success("Pinned to favorites");
    } catch (error) {
      console.error("Error pinning item:", error);
    }
  };

  const unpinItem = async (mediaId: number, mediaType: "movie" | "tv") => {
    if (!userId) return;

    try {
      await supabase.from("pinned_favorites")
        .delete()
        .eq("user_id", userId)
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
      await supabase.from("continue_watching").upsert({
        user_id: userId,
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
      }, { onConflict: "user_id,media_id,media_type,season,episode" });

      await fetchUserData();
    } catch (error) {
      console.error("Error updating continue watching:", error);
    }
  };

  const removeContinueWatching = async (mediaId: number, mediaType: "movie" | "tv", season?: number, episode?: number) => {
    if (!userId) return;

    try {
      let query = supabase.from("continue_watching")
        .delete()
        .eq("user_id", userId)
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
      await supabase.from("user_stats").upsert({
        user_id: userId,
        ...current,
        ...updates,
      }, { onConflict: "user_id" });

      await fetchUserData();
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

  // Achievements
  const unlockAchievement = async (achievement: { id: string; title: string; description?: string; icon?: string }) => {
    if (!userId) return;

    try {
      await supabase.from("achievements").upsert({
        user_id: userId,
        achievement_id: achievement.id,
        title: achievement.title,
        description: achievement.description || null,
        icon: achievement.icon || null,
      }, { onConflict: "user_id,achievement_id" });

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
      await supabase.from("profiles").update({
        theme: prefs.theme,
        ui_layout: prefs.uiLayout,
        language: prefs.language,
      }).eq("id", userId);

      await fetchUserData();
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  const refreshUserData = fetchUserData;

  return (
    <SupabaseAuthContext.Provider value={{
      user,
      session,
      isLoading,
      isSignedIn,
      userData,
      syncInProgress,
      signUp,
      signIn,
      signOut,
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
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  }
  return context;
};

export const useSupabaseAuthSafe = () => {
  return useContext(SupabaseAuthContext);
};
