import { useState, useEffect, useCallback } from "react";
import { useSupabaseAuthSafe } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabaseShared";
import {
  getContinueWatching as getLocalContinueWatching,
  updateContinueWatching as updateLocalContinueWatching,
  removeContinueWatching as removeLocalContinueWatching,
  getContinueWatchingItem as getLocalContinueWatchingItem,
  ContinueWatchingItem,
} from "@/lib/watchlist";
import {
  getPinnedItems as getLocalPinnedItems,
  pinItem as pinLocalItem,
  unpinItem as unpinLocalItem,
  isPinned as isLocalPinned,
  getWatchStats as getLocalWatchStats,
  incrementMoviesWatched as incrementLocalMoviesWatched,
  incrementEpisodesWatched as incrementLocalEpisodesWatched,
  incrementSeasonsCompleted as incrementLocalSeasonsCompleted,
  addWatchTime as addLocalWatchTime,
  getAchievements as getLocalAchievements,
  unlockAchievement as unlockLocalAchievement,
  PinnedItem,
  WatchStats,
  Achievement,
} from "@/lib/userPreferences";
import { Movie } from "@/lib/tmdb";

// Interface matching user_collection table
interface CollectionItemDB {
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

// Extended collection item interface with watched_at and rating
export interface CollectionItem {
  id: number;
  mediaType: "movie" | "tv";
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
  watchedAt?: number;
  rating?: number | null;
}

export const useUserData = () => {
  const auth = useSupabaseAuthSafe();
  const user = auth?.user;
  const isSignedIn = !!user;

  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch watched items from CineVault's user_collection table - runs on mount independently
  const fetchCollection = useCallback(async () => {
    if (!user) {
      setCollection([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      console.log("[CineTorrio] Fetching collection for user:", user.id);
      const { data, error } = await supabase
        .from("user_collection")
        .select("*")
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false });

      if (error) {
        console.error("[CineTorrio] Error fetching collection:", error);
        setCollection([]);
      } else {
        console.log("[CineTorrio] Fetched collection items:", data?.length || 0);
        const items = (data || []) as CollectionItemDB[];
        const collectionItems: CollectionItem[] = items.map((item) => ({
          id: item.tmdb_id,
          mediaType: item.media_type as "movie" | "tv",
          title: item.title,
          name: item.title,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          overview: item.overview || "",
          vote_average: item.vote_average || 0,
          vote_count: 0,
          genre_ids: item.genres?.map((g) => parseInt(g)).filter((n) => !isNaN(n)) || [],
          release_date: item.release_date || undefined,
          addedAt: new Date(item.created_at).getTime(),
          watchedAt: item.watched_at ? new Date(item.watched_at).getTime() : undefined,
          rating: item.rating,
        }));
        setCollection(collectionItems);
      }
    } catch (error) {
      console.error("[CineTorrio] Error fetching collection:", error);
      setCollection([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch on mount when user is available - ensures CineTorrio loads collection independently
  useEffect(() => {
    if (!user) return;
    
    console.log("[CineTorrio] Initial collection fetch triggered for user:", user.id);
    fetchCollection();
  }, [user, fetchCollection]);

  // Collection (Watched) functions - sync with CineVault
  const isWatched = (id: number, mediaType: "movie" | "tv"): boolean => {
    return collection.some((c) => c.id === id && c.mediaType === mediaType);
  };

  const markAsWatched = async (item: Movie & { genres?: { id: number; name: string }[] }, mediaType: "movie" | "tv") => {
    if (!isSignedIn || !user) {
      console.log("Mark as watched: user not signed in");
      return; // Watched collection requires sign-in
    }

    try {
      console.log("Marking as watched:", item.id, mediaType, "for user:", user.id);
      
      // Handle both genre_ids (from list views) and genres (from detail views)
      const genreIds = item.genre_ids?.map(String) || item.genres?.map(g => String(g.id)) || null;
      
      const { data, error } = await supabase.from("user_collection").upsert(
        {
          user_id: user.id,
          tmdb_id: item.id,
          media_type: mediaType,
          title: item.title || item.name || "",
          poster_path: item.poster_path || null,
          backdrop_path: item.backdrop_path || null,
          overview: item.overview || null,
          release_date: item.release_date || item.first_air_date || null,
          vote_average: item.vote_average || null,
          genres: genreIds,
          watched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,tmdb_id,media_type" }
      );

      if (error) {
        console.error("Error marking as watched:", error);
        throw error;
      }

      console.log("Successfully marked as watched:", data);
      await fetchCollection();
    } catch (error) {
      console.error("Error marking as watched:", error);
    }
  };

  const unmarkAsWatched = async (id: number, mediaType: "movie" | "tv") => {
    if (!isSignedIn || !user) {
      return;
    }

    try {
      // Delete the item completely from collection
      const { error } = await supabase
        .from("user_collection")
        .delete()
        .eq("user_id", user.id)
        .eq("tmdb_id", id);

      if (error) {
        console.error("Error unmarking as watched:", error);
        throw error;
      }

      await fetchCollection();
    } catch (error) {
      console.error("Error unmarking as watched:", error);
    }
  };

  const getCollection = (): CollectionItem[] => {
    return collection;
  };

  // Get user's rating for a specific item
  const getUserRating = (id: number, mediaType: "movie" | "tv"): number | null => {
    const item = collection.find((c) => c.id === id && c.mediaType === mediaType);
    return item?.rating ?? null;
  };

  // Update rating for an item in collection
  const updateRating = async (id: number, mediaType: "movie" | "tv", rating: number) => {
    if (!isSignedIn || !user) {
      console.log("Update rating: user not signed in");
      return;
    }

    try {
      console.log("Updating rating:", id, mediaType, rating, "for user:", user.id);
      
      const { error } = await supabase
        .from("user_collection")
        .update({ rating })
        .eq("user_id", user.id)
        .eq("tmdb_id", id)
        .eq("media_type", mediaType);

      if (error) {
        console.error("Error updating rating:", error);
        throw error;
      }

      console.log("Successfully updated rating");
      await fetchCollection();
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };


  // Pinned functions
  const isPinned = (id: number, mediaType: "movie" | "tv"): boolean => {
    if (isSignedIn && auth) {
      return auth.isPinned(id, mediaType);
    }
    return isLocalPinned(id, mediaType);
  };

  const pinItem = async (item: {
    id: number;
    mediaType: "movie" | "tv";
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
  }) => {
    if (isSignedIn && auth) {
      await auth.pinItem({
        mediaId: item.id,
        mediaType: item.mediaType,
        title: item.title,
        posterPath: item.poster_path,
      });
    } else {
      pinLocalItem({
        id: item.id,
        mediaType: item.mediaType,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
      });
    }
  };

  const unpinItem = async (id: number, mediaType: "movie" | "tv") => {
    if (isSignedIn && auth) {
      await auth.unpinItem(id, mediaType);
    } else {
      unpinLocalItem(id, mediaType);
    }
  };

  const getPinnedItems = (): PinnedItem[] => {
    if (isSignedIn && auth?.userData) {
      return auth.userData.pinned.map((p) => ({
        id: p.media_id,
        mediaType: p.media_type,
        title: p.title,
        poster_path: p.poster_path,
        backdrop_path: null,
        pinnedAt: new Date(p.pinned_at).getTime(),
      }));
    }
    return getLocalPinnedItems();
  };

  // Continue Watching functions
  const getContinueWatching = (): ContinueWatchingItem[] => {
    if (isSignedIn && auth?.userData) {
      return auth.userData.continueWatching.map((c) => ({
        id: c.media_id,
        mediaType: c.media_type,
        title: c.title,
        poster_path: c.poster_path,
        backdrop_path: null,
        progress: c.progress,
        currentTime: c.playback_time,
        duration: c.duration,
        season: c.season || undefined,
        episode: c.episode || undefined,
        episodeName: c.episode_title || undefined,
        lastWatched: new Date(c.last_watched).getTime(),
      }));
    }
    return getLocalContinueWatching();
  };

  const updateContinueWatching = async (item: ContinueWatchingItem) => {
    if (isSignedIn && auth) {
      await auth.updateContinueWatching({
        mediaId: item.id,
        mediaType: item.mediaType,
        title: item.title,
        posterPath: item.poster_path,
        progress: item.progress,
        playbackTime: item.currentTime,
        duration: item.duration,
        season: item.season,
        episode: item.episode,
        episodeTitle: item.episodeName,
      });
    } else {
      updateLocalContinueWatching(item);
    }
  };

  const removeContinueWatching = async (
    id: number,
    mediaType: "movie" | "tv",
    season?: number,
    episode?: number
  ) => {
    if (isSignedIn && auth) {
      await auth.removeContinueWatching(id, mediaType, season, episode);
    } else {
      removeLocalContinueWatching(id, mediaType, season, episode);
    }
  };

  const getContinueWatchingItem = (
    id: number,
    mediaType: "movie" | "tv",
    season?: number,
    episode?: number
  ): ContinueWatchingItem | undefined => {
    if (isSignedIn && auth) {
      const item = auth.getContinueWatchingItem(id, mediaType, season, episode);
      if (item) {
        return {
          id: item.media_id,
          mediaType: item.media_type,
          title: item.title,
          poster_path: item.poster_path,
          backdrop_path: null,
          progress: item.progress,
          currentTime: item.playback_time,
          duration: item.duration,
          season: item.season || undefined,
          episode: item.episode || undefined,
          episodeName: item.episode_title || undefined,
          lastWatched: new Date(item.last_watched).getTime(),
        };
      }
      return undefined;
    }
    return getLocalContinueWatchingItem(id, mediaType, season, episode);
  };

  // Stats functions
  const getWatchStats = (): WatchStats => {
    if (isSignedIn && auth?.userData) {
      return {
        moviesWatched: auth.userData.watchStats.movies_watched,
        episodesWatched: auth.userData.watchStats.episodes_watched,
        seasonsCompleted: auth.userData.watchStats.seasons_completed,
        totalWatchTime: auth.userData.watchStats.total_watch_time,
        seriesCompleted: [],
        lastUpdated: Date.now(),
      };
    }
    return getLocalWatchStats();
  };

  const incrementMoviesWatched = async () => {
    if (isSignedIn && auth) {
      await auth.incrementMoviesWatched();
    } else {
      incrementLocalMoviesWatched();
    }
  };

  const incrementEpisodesWatched = async () => {
    if (isSignedIn && auth) {
      await auth.incrementEpisodesWatched();
    } else {
      incrementLocalEpisodesWatched();
    }
  };

  const incrementSeasonsCompleted = async () => {
    if (isSignedIn && auth) {
      await auth.incrementSeasonsCompleted();
    } else {
      incrementLocalSeasonsCompleted();
    }
  };

  const addWatchTime = async (minutes: number) => {
    if (isSignedIn && auth) {
      await auth.addWatchTime(minutes);
    } else {
      addLocalWatchTime(minutes);
    }
  };

  // Achievements
  const getAchievements = (): Achievement[] => {
    if (isSignedIn && auth?.userData) {
      return auth.userData.achievements.map((a) => ({
        id: a.achievement_id,
        title: a.title,
        description: a.description || "",
        icon: a.icon || "🏆",
        unlockedAt: new Date(a.unlocked_at).getTime(),
      }));
    }
    return getLocalAchievements();
  };

  const unlockAchievement = async (achievement: {
    id: string;
    title: string;
    description?: string;
    icon?: string;
  }) => {
    if (isSignedIn && auth) {
      await auth.unlockAchievement(achievement);
    } else {
      unlockLocalAchievement({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description || "",
        icon: achievement.icon || "🏆",
      });
    }
  };

  return {
    isSignedIn,
    syncInProgress: auth?.syncInProgress ?? false,
    loading,
    // Collection (Watched) - synced with CineVault
    isWatched,
    markAsWatched,
    unmarkAsWatched,
    getCollection,
    refetchCollection: fetchCollection,
    // Rating - synced with CineVault
    getUserRating,
    updateRating,
    // Pinned
    isPinned,
    pinItem,
    unpinItem,
    getPinnedItems,
    // Continue Watching
    getContinueWatching,
    updateContinueWatching,
    removeContinueWatching,
    getContinueWatchingItem,
    // Stats
    getWatchStats,
    incrementMoviesWatched,
    incrementEpisodesWatched,
    incrementSeasonsCompleted,
    addWatchTime,
    // Achievements
    getAchievements,
    unlockAchievement,
    // Refresh
    refreshData: auth?.refreshUserData ?? (() => Promise.resolve()),
  };
};
