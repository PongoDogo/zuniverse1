import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle, Maximize2, RotateCcw, ShieldCheck, CheckCircle, Info, PictureInPicture2, AlertTriangle } from "lucide-react";
import StreamingSourceSelector from "./StreamingSourceSelector";
import { Button } from "@/components/ui/button";
import { 
  getPreferredSource,
  StreamingSource,
  getNextSource 
} from "@/lib/streamingSources";
import { isNativeAndroid, getBlockedCount } from "@/lib/nativeAdBlocker";
import { 
  updateContinueWatching, 
  ContinueWatchingItem,
  getContinueWatchingItem,
  removeContinueWatching
} from "@/lib/watchlist";
import { 
  incrementEpisodesWatched, 
  incrementMoviesWatched, 
  addWatchTime 
} from "@/lib/userPreferences";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VideoPlayerProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  episodeName?: string;
  onRequestNextEpisode?: () => void;
}

const MOVIE_DURATION = 120;
const EPISODE_DURATION = 45;
const TRACKING_THRESHOLD = 120;
const SAVE_INTERVAL = 15000;

const VideoPlayer = ({ 
  tmdbId, 
  mediaType, 
  season, 
  episode,
  title,
  posterPath,
  backdropPath,
  episodeName,
  onRequestNextEpisode
}: VideoPlayerProps) => {
  const { t, language } = useLanguage();
  const [currentSource, setCurrentSource] = useState<StreamingSource>(getPreferredSource);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [embedUrl, setEmbedUrl] = useState(() => 
    getPreferredSource().buildUrl(tmdbId, mediaType, season, episode)
  );
  const [retryCount, setRetryCount] = useState(0);
  const [adsBlocked, setAdsBlocked] = useState(0);
  const [autoFallback, setAutoFallback] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastUpdateRef = useRef<number>(0);
  const hasTrackedViewRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionWatchTimeRef = useRef<number>(0);

  const estimatedDurationSeconds = (mediaType === "movie" ? MOVIE_DURATION : EPISODE_DURATION) * 60;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case "f":
          e.preventDefault();
          handleFullscreen();
          break;
        case "n":
          if (onRequestNextEpisode && mediaType === "tv") {
            e.preventDefault();
            onRequestNextEpisode();
          }
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRequestNextEpisode, mediaType]);

  const getExistingProgress = useCallback(() => {
    return getContinueWatchingItem(tmdbId, mediaType, season, episode);
  }, [tmdbId, mediaType, season, episode]);

  const saveProgress = useCallback(() => {
    if (!title) return;
    
    const now = Date.now();
    const sessionSeconds = Math.floor((now - startTimeRef.current) / 1000);
    sessionWatchTimeRef.current = sessionSeconds;
    
    const existing = getExistingProgress();
    const previousTime = existing?.currentTime || 0;
    const totalWatchedSeconds = previousTime + sessionSeconds;
    
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
    
    if (sessionSeconds >= TRACKING_THRESHOLD && !hasTrackedViewRef.current) {
      hasTrackedViewRef.current = true;
      if (mediaType === "tv") {
        incrementEpisodesWatched();
      } else {
        incrementMoviesWatched();
      }
      const minutesWatched = Math.floor(sessionSeconds / 60);
      if (minutesWatched > 0) {
        addWatchTime(minutesWatched);
      }
    }
  }, [tmdbId, mediaType, title, posterPath, backdropPath, season, episode, episodeName, estimatedDurationSeconds, getExistingProgress]);

  const handleMarkAsComplete = useCallback(() => {
    removeContinueWatching(tmdbId, mediaType, season, episode);
    toast.success(language === "el" ? "Επισημάνθηκε ως ολοκληρωμένο!" : "Marked as complete!");
  }, [tmdbId, mediaType, season, episode, language]);

  // Poll native ad blocker
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
    setReportSent(false);
    hasTrackedViewRef.current = false;
    startTimeRef.current = Date.now();
    sessionWatchTimeRef.current = 0;
    const url = currentSource.buildUrl(tmdbId, mediaType, season, episode);
    setEmbedUrl(url);
  }, [currentSource, tmdbId, mediaType, season, episode, retryCount]);

  // Start progress tracking
  useEffect(() => {
    if (!isLoading && !error && title) {
      startTimeRef.current = Date.now();
      progressIntervalRef.current = setInterval(() => {
        saveProgress();
      }, SAVE_INTERVAL);
      const initialTimeout = setTimeout(saveProgress, 5000);
      return () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        clearTimeout(initialTimeout);
        saveProgress();
      };
    }
  }, [isLoading, error, title, saveProgress]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (title && !isLoading && !error) saveProgress();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [title, isLoading, error, saveProgress]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
    setAutoFallback(false);
  };

  const handleError = () => {
    setIsLoading(false);
    if (!autoFallback) {
      const nextSource = getNextSource(currentSource.id);
      if (nextSource) {
        setAutoFallback(true);
        toast.info(language === "el" ? `Αλλαγή σε ${nextSource.name}...` : `Switching to ${nextSource.name}...`);
        setCurrentSource(nextSource);
        return;
      }
    }
    setError(true);
  };

  const handleSourceChange = (source: StreamingSource) => {
    saveProgress();
    setCurrentSource(source);
    setRetryCount(0);
    setAutoFallback(false);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setAutoFallback(false);
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

  const handlePiP = async () => {
    // PiP works best with <video> elements, but we can try with the iframe
    // For iframes, we try the document PiP API
    if ('documentPictureInPicture' in window) {
      try {
        // @ts-ignore - experimental API
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width: 640,
          height: 360,
        });
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.allowFullscreen = true;
        pipWindow.document.body.style.margin = '0';
        pipWindow.document.body.appendChild(iframe);
        toast.success(language === "el" ? "Picture-in-Picture ενεργό" : "Picture-in-Picture active");
      } catch {
        toast.error(language === "el" ? "Το PiP δεν υποστηρίζεται" : "PiP not supported for this content");
      }
    } else {
      toast.info(language === "el" ? "Το PiP δεν υποστηρίζεται στον browser σας" : "PiP not supported in your browser");
    }
  };

  const handleReportBroken = () => {
    setReportSent(true);
    toast.success(
      language === "el" 
        ? `Αναφορά: "${currentSource.name}" σημειώθηκε ως μη λειτουργική` 
        : `Reported: "${currentSource.name}" marked as not working`
    );
    // Try next source automatically
    const nextSource = getNextSource(currentSource.id);
    if (nextSource) {
      setTimeout(() => {
        setCurrentSource(nextSource);
        setRetryCount(0);
      }, 1000);
    }
  };

  const existingProgress = getExistingProgress();
  const showMarkComplete = existingProgress && existingProgress.progress >= 50;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <StreamingSourceSelector
          currentSource={currentSource}
          onSourceChange={handleSourceChange}
        />
        
        <div className="flex items-center gap-2 flex-wrap">
          {showMarkComplete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAsComplete}
              className="text-xs sm:text-sm text-green-500 border-green-500/30 hover:bg-green-500/10"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              {language === "el" ? "Ολοκληρωμένο" : "Mark Complete"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePiP} className="text-xs sm:text-sm">
            <PictureInPicture2 className="w-3.5 h-3.5 mr-1.5" />
            PiP
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReportBroken}
            disabled={reportSent}
            className="text-xs sm:text-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            {reportSent 
              ? (language === "el" ? "Αναφέρθηκε" : "Reported") 
              : (language === "el" ? "Αναφορά" : "Report")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRetry} className="text-xs sm:text-sm">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {t("retry")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleFullscreen} className="text-xs sm:text-sm">
            <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
            {t("fullscreen")}
          </Button>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">F</kbd>
          {t("fullscreen")}
        </span>
        {mediaType === "tv" && onRequestNextEpisode && (
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">N</kbd>
            {t("nextEpisode")}
          </span>
        )}
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
      <div className="flex items-center justify-center gap-2">
        <p className="text-xs text-muted-foreground text-center">
          💡 {t("sourceTip")}
        </p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                {language === "el" 
                  ? "💡 Για καλύτερη εμπειρία χωρίς διαφημίσεις, εγκαταστήστε το uBlock Origin extension στον browser σας."
                  : "💡 For better ad-free experience, install the uBlock Origin extension in your browser."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default VideoPlayer;
