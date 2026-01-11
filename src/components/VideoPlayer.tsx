import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle, Maximize2, RotateCcw, ShieldCheck } from "lucide-react";
import StreamingSourceSelector from "./StreamingSourceSelector";
import { Button } from "@/components/ui/button";
import { 
  getPreferredSource,
  StreamingSource 
} from "@/lib/streamingSources";
import { isNativeAndroid, getBlockedCount } from "@/lib/nativeAdBlocker";
import { updateContinueWatching, ContinueWatchingItem } from "@/lib/watchlist";
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
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const watchTimeRef = useRef<number>(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Estimated durations (since we can't get real video duration from embed)
  const estimatedDuration = mediaType === "movie" ? 120 * 60 : 45 * 60; // 120 min for movies, 45 min for episodes

  // Track watch progress
  const updateProgress = useCallback(() => {
    if (!title || !watchStartTime) return;
    
    const elapsedSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
    watchTimeRef.current = elapsedSeconds;
    
    // Calculate realistic progress (cap at 95% until explicitly marked complete)
    const progress = Math.min(95, Math.round((elapsedSeconds / estimatedDuration) * 100));
    
    const item: ContinueWatchingItem = {
      id: tmdbId,
      mediaType,
      title,
      poster_path: posterPath || null,
      backdrop_path: backdropPath || null,
      progress,
      currentTime: elapsedSeconds,
      duration: estimatedDuration,
      season,
      episode,
      episodeName,
      lastWatched: Date.now(),
    };
    
    updateContinueWatching(item);
    
    // Track view after 5 minutes of watching (to count as "watched")
    if (elapsedSeconds >= 300 && !hasTrackedView) {
      setHasTrackedView(true);
      if (mediaType === "tv") {
        incrementEpisodesWatched();
      } else {
        incrementMoviesWatched();
      }
    }
    
    // Add watch time to stats every 5 minutes
    if (elapsedSeconds > 0 && elapsedSeconds % 300 === 0) {
      addWatchTime(5);
    }
  }, [tmdbId, mediaType, title, posterPath, backdropPath, season, episode, episodeName, watchStartTime, hasTrackedView, estimatedDuration]);

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
    setHasTrackedView(false);
    const url = currentSource.buildUrl(tmdbId, mediaType, season, episode);
    setEmbedUrl(url);
  }, [currentSource, tmdbId, mediaType, season, episode, retryCount]);

  // Start/stop progress tracking
  useEffect(() => {
    if (!isLoading && !error && title) {
      setWatchStartTime(Date.now());
      
      // Update progress every 30 seconds
      progressIntervalRef.current = setInterval(updateProgress, 30000);
      
      // Initial update after 10 seconds
      const initialTimeout = setTimeout(updateProgress, 10000);
      
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        clearTimeout(initialTimeout);
        
        // Final update on unmount
        if (watchTimeRef.current > 0) {
          updateProgress();
          // Add remaining watch time
          const remainingMinutes = Math.floor(watchTimeRef.current / 60) % 5;
          if (remainingMinutes > 0) {
            addWatchTime(remainingMinutes);
          }
        }
      };
    }
  }, [isLoading, error, title, updateProgress]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleSourceChange = (source: StreamingSource) => {
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
