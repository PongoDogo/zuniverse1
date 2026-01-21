import { useSupabaseAuthSafe } from "@/contexts/SupabaseAuthContext";
import {
  getWatchlist as getLocalWatchlist,
  addToWatchlist as addToLocalWatchlist,
  removeFromWatchlist as removeFromLocalWatchlist,
  isInWatchlist as isInLocalWatchlist,
  getContinueWatching as getLocalContinueWatching,
  updateContinueWatching as updateLocalContinueWatching,
  removeContinueWatching as removeLocalContinueWatching,
  getContinueWatchingItem as getLocalContinueWatchingItem,
  WatchlistItem,
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

export const useUserData = () => {
  // Use Supabase auth context (shared with CineVault)
  const auth = useSupabaseAuthSafe();
  
  // Check if user is signed in
  const isSignedIn = auth?.isSignedIn ?? false;

  // Watchlist functions
  const isInWatchlist = (id: number, mediaType: "movie" | "tv"): boolean => {
    if (isSignedIn && auth) {
      return auth.isInWatchlist(id, mediaType);
    }
    return isInLocalWatchlist(id, mediaType);
  };

  const addToWatchlist = async (item: Movie, mediaType: "movie" | "tv") => {
    if (isSignedIn && auth) {
      await auth.addToWatchlist({
        mediaId: item.id,
        mediaType,
        title: item.title || item.name || "Unknown",
        posterPath: item.poster_path,
        voteAverage: item.vote_average,
        releaseDate: item.release_date || item.first_air_date,
      });
    } else {
      addToLocalWatchlist(item, mediaType);
    }
  };

  const removeFromWatchlist = async (id: number, mediaType: "movie" | "tv") => {
    if (isSignedIn && auth) {
      await auth.removeFromWatchlist(id, mediaType);
    } else {
      removeFromLocalWatchlist(id, mediaType);
    }
  };

  const getWatchlist = (): WatchlistItem[] => {
    if (isSignedIn && auth?.userData) {
      return auth.userData.watchlist.map(w => ({
        id: w.tmdb_id,
        title: w.title,
        name: w.title,
        poster_path: w.poster_path,
        vote_average: w.vote_average || 0,
        vote_count: 0,
        genre_ids: [],
        release_date: w.release_date || undefined,
        mediaType: w.media_type,
        addedAt: new Date(w.created_at).getTime(),
        backdrop_path: w.backdrop_path,
        overview: w.overview || "",
        popularity: 0,
        original_language: "",
        adult: false,
      })) as WatchlistItem[];
    }
    return getLocalWatchlist();
  };

  // Pinned functions
  const isPinned = (id: number, mediaType: "movie" | "tv"): boolean => {
    if (isSignedIn && auth) {
      return auth.isPinned(id, mediaType);
    }
    return isLocalPinned(id, mediaType);
  };

  const pinItem = async (item: { id: number; mediaType: "movie" | "tv"; title: string; poster_path: string | null; backdrop_path: string | null }) => {
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
      return auth.userData.pinned.map(p => ({
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
      return auth.userData.continueWatching.map(c => ({
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

  const removeContinueWatching = async (id: number, mediaType: "movie" | "tv", season?: number, episode?: number) => {
    if (isSignedIn && auth) {
      await auth.removeContinueWatching(id, mediaType, season, episode);
    } else {
      removeLocalContinueWatching(id, mediaType, season, episode);
    }
  };

  const getContinueWatchingItem = (id: number, mediaType: "movie" | "tv", season?: number, episode?: number): ContinueWatchingItem | undefined => {
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
      return auth.userData.achievements.map(a => ({
        id: a.achievement_id,
        title: a.title,
        description: a.description || "",
        icon: a.icon || "🏆",
        unlockedAt: new Date(a.unlocked_at).getTime(),
      }));
    }
    return getLocalAchievements();
  };

  const unlockAchievement = async (achievement: { id: string; title: string; description?: string; icon?: string }) => {
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
    isSignedIn: isSignedIn || false,
    syncInProgress: auth?.syncInProgress ?? false,
    // Watchlist
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getWatchlist,
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
