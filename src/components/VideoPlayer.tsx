import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle, Maximize2, RotateCcw, ShieldCheck } from "lucide-react";
import StreamingSourceSelector from "./StreamingSourceSelector";
import { Button } from "@/components/ui/button";
import { 
  getPreferredSource,
  StreamingSource 
} from "@/lib/streamingSources";
import { isNativeAndroid, getBlockedCount } from "@/lib/nativeAdBlocker";
import { 
  updateContinueWatching, 
  ContinueWatchingItem,
  getContinueWatchingItem 
} from "@/lib/watchlist";
import { 
  incrementEpisodesWatched, 
  incrementMoviesWatched, 
  addWatchTime 
} from "@/lib/userPreferences";
import { useLanguage } from "@/hooks/useLanguage";

interface VideoPlayerProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  episodeName?: string;
}

// Estimated durations (minutes)
const MOVIE_DURATION = 120;
const EPISODE_DURATION = 45;

const VideoPlayer = ({ 
  tmdbId, 
  mediaType, 
  season, 
  episode,
  title,
  posterPath,
  backdropPath,
  episodeName
}: VideoPlayerProps) => {
  const { t } = useLanguage();
  const [currentSource, setCurrentSource] = useState<StreamingSource>(getPreferredSource);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [embedUrl, setEmbedUrl] = useState(() => 
    getPreferredSource().buildUrl(tmdbId, mediaType, season, episode)
  );
  const [retryCount, setRetryCount] = useState(0);
  const [adsBlocked, setAdsBlocked] = useState(0);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastUpdateRef = useRef<number>(0);
  const hasTrackedViewRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const estimatedDurationSeconds = (mediaType === "movie" ? MOVIE_DURATION : EPISODE_DURATION) * 60;

  // Get existing progress for this item
  const getExistingProgress = useCallback(() => {
    return getContinueWatchingItem(tmdbId, mediaType, season, episode);
  }, [tmdbId, mediaType, season, episode]);

  // Save progress to continue watching
  const saveProgress = useCallback(() => {
    if (!title) return;
    
    const now = Date.now();
    const sessionSeconds = Math.floor((now - startTimeRef.current) / 1000);
    
    // Get existing item to add to previous time
    const existing = getExistingProgress();
    const previousTime = existing?.currentTime || 0;
    const totalWatchedSeconds = previousTime + sessionSeconds;
    
    // Calculate progress percentage (cap at 95% unless explicitly marked complete)
    const progress = Math.min(95, Math.round((totalWatchedSeconds / estimatedDurationSeconds) * 100));
    
    const item: ContinueWatchingItem = {
      id: tmdbId,
      mediaType,
      title,
      poster_path: posterPath || null,
      backdrop_path: backdropPath || null,
      progress,
      currentTime: totalWatchedSeconds,
      duration: estimatedDurationSeconds,
      season,
      episode,
      episodeName,
      lastWatched: now,
      startedAt: existing?.startedAt || startTimeRef.current,
    };
    
    updateContinueWatching(item);
    lastUpdateRef.current = now;
    
    // Track achievement after 5 minutes of watching this session
    if (sessionSeconds >= 300 && !hasTrackedViewRef.current) {
      hasTrackedViewRef.current = true;
      if (mediaType === "tv") {
        incrementEpisodesWatched();
      } else {
        incrementMoviesWatched();
      }
      // Add 5 minutes of watch time
      addWatchTime(5);
    }
  }, [tmdbId, mediaType, title, posterPath, backdropPath, season, episode, episodeName, estimatedDurationSeconds, getExistingProgress]);

  // Poll native ad blocker for blocked count (only on Android)
  useEffect(() => {
    if (!isNativeAndroid()) return;
    
    const pollBlockedCount = async () => {
      const count = await getBlockedCount();
      setAdsBlocked(count);
    };
    
    const interval = setInterval(pollBlockedCount, 2000);
    pollBlockedCount();
    
    return () => clearInterval(interval);
  }, []);

  // Update URL when source/content changes
  useEffect(() => {
    setIsLoading(true);
    setError(false);
    hasTrackedViewRef.current = false;
    startTimeRef.current = Date.now();
    const url = currentSource.buildUrl(tmdbId, mediaType, season, episode);
    setEmbedUrl(url);
  }, [currentSource, tmdbId, mediaType, season, episode, retryCount]);

  // Start progress tracking when video loads
  useEffect(() => {
    if (!isLoading && !error && title) {
      // Reset start time when video actually loads
      startTimeRef.current = Date.now();
      
      // Save progress every 15 seconds
      progressIntervalRef.current = setInterval(() => {
        saveProgress();
      }, 15000);
      
      // Initial save after 5 seconds
      const initialTimeout = setTimeout(saveProgress, 5000);
      
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        clearTimeout(initialTimeout);
        // Final save on unmount
        saveProgress();
      };
    }
  }, [isLoading, error, title, saveProgress]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (title && !isLoading && !error) {
        saveProgress();
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [title, isLoading, error, saveProgress]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleSourceChange = (source: StreamingSource) => {
    // Save progress before switching
    saveProgress();
    setCurrentSource(source);
    setRetryCount(0);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <StreamingSourceSelector
          currentSource={currentSource}
          onSourceChange={handleSourceChange}
        />
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="text-xs sm:text-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {t("retry")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
            className="text-xs sm:text-sm"
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
            {t("fullscreen")}
          </Button>
        </div>
      </div>

      {/* Native ad blocker indicator */}
      {isNativeAndroid() && adsBlocked > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-md w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span><strong>{adsBlocked}</strong> {t("adsBlocked")}</span>
        </div>
      )}

      {/* Player */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-video bg-card rounded-lg overflow-hidden touch-manipulation"
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card z-10">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">{t("loadingPlayer")}</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card z-10 p-4 text-center">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive" />
            <p className="text-sm text-muted-foreground">{t("failedToLoad")}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("tryAgain")}
            </Button>
          </div>
        )}

        <iframe
          key={`${embedUrl}-${retryCount}`}
          ref={iframeRef}
          src={embedUrl}
          className={`w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>

      {/* Tips */}
      <p className="text-xs text-muted-foreground text-center">
        💡 {t("sourceTip")}
      </p>
    </div>
  );
};

export default VideoPlayer;
