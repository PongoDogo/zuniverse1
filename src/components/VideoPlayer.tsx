import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle, Maximize2, RotateCcw, Shield, ShieldCheck, MousePointerClick } from "lucide-react";
import StreamingSourceSelector from "./StreamingSourceSelector";
import { Button } from "@/components/ui/button";
import { 
  streamingSources, 
  StreamingSource, 
  getPreferredSource 
} from "@/lib/streamingSources";
import { updateContinueWatching, ContinueWatchingItem } from "@/lib/watchlist";
import { 
  initAdBlocker, 
  injectAdBlockerCSS, 
  setupIframeProtection,
  setBlockedCallback,
  getBlockedCount 
} from "@/lib/adBlocker";

interface VideoPlayerProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
  posterPath?: string;
  backdropPath?: string;
  episodeName?: string;
}

const CLICKS_TO_ABSORB = 3; // Number of "ad trigger" clicks to absorb

const VideoPlayer = ({
  tmdbId,
  mediaType,
  season,
  episode,
  title = "",
  posterPath,
  backdropPath,
  episodeName,
}: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSource, setCurrentSource] = useState<StreamingSource>(
    getPreferredSource()
  );
  const [retryCount, setRetryCount] = useState(0);
  const [adsBlocked, setAdsBlocked] = useState(0);
  const [clickShieldActive, setClickShieldActive] = useState(true);
  const [clicksAbsorbed, setClicksAbsorbed] = useState(0);
  const [shieldMessage, setShieldMessage] = useState("Click to start watching");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const adBlockerInitialized = useRef(false);

  const embedUrl = currentSource.buildUrl(tmdbId, mediaType, season, episode);

  // Initialize ad blocker on mount
  useEffect(() => {
    if (!adBlockerInitialized.current) {
      adBlockerInitialized.current = true;
      
      // Initialize all ad blocking systems
      initAdBlocker();
      injectAdBlockerCSS();
      setupIframeProtection();
      
      // Set callback to update blocked count in UI
      setBlockedCallback((count) => {
        setAdsBlocked(count);
      });
      
      // Get initial count
      setAdsBlocked(getBlockedCount());
      
      console.log('[VideoPlayer] Ad blocker systems initialized');
    }
  }, []);

  // Reset click shield when source changes
  useEffect(() => {
    setClickShieldActive(true);
    setClicksAbsorbed(0);
    setShieldMessage("Click to start watching");
  }, [currentSource, tmdbId, season, episode]);

  // Handle click shield - absorb ad-triggering clicks
  const handleShieldClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newCount = clicksAbsorbed + 1;
    setClicksAbsorbed(newCount);
    setAdsBlocked(prev => prev + 1); // Count as blocked ad
    
    if (newCount >= CLICKS_TO_ABSORB) {
      setShieldMessage("Ad clicks absorbed! Enjoy watching.");
      setTimeout(() => {
        setClickShieldActive(false);
      }, 800);
    } else {
      const remaining = CLICKS_TO_ABSORB - newCount;
      setShieldMessage(`Blocking ads... Click ${remaining} more time${remaining > 1 ? 's' : ''}`);
    }
    
    console.log(`[VideoPlayer] Absorbed click ${newCount}/${CLICKS_TO_ABSORB}`);
  }, [clicksAbsorbed]);

  // Skip shield button
  const handleSkipShield = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setClickShieldActive(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setRetryCount(0);
  }, [tmdbId, season, episode, currentSource]);

  // Listen for player events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PLAYER_EVENT") {
        const { currentTime, duration } = event.data.data;
        
        if (duration > 0 && currentTime > 0) {
          const progress = Math.round((currentTime / duration) * 100);
          
          const item: ContinueWatchingItem = {
            id: tmdbId,
            mediaType,
            title,
            poster_path: posterPath || null,
            backdrop_path: backdropPath || null,
            progress,
            currentTime,
            duration,
            season,
            episode,
            episodeName,
            lastWatched: Date.now(),
          };
          
          // Only save if watched more than 30 seconds and less than 95%
          if (currentTime > 30 && progress < 95) {
            updateContinueWatching(item);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [tmdbId, mediaType, title, posterPath, backdropPath, season, episode, episodeName]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleSourceChange = (source: StreamingSource) => {
    setCurrentSource(source);
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setIsLoading(true);
    setError(false);
    
    // Try next source after 2 retries
    if (retryCount >= 2) {
      const currentIndex = streamingSources.findIndex(
        (s) => s.id === currentSource.id
      );
      const nextIndex = (currentIndex + 1) % streamingSources.length;
      setCurrentSource(streamingSources[nextIndex]);
    }
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullscreen}
            className="h-8 w-8 sm:h-9 sm:w-9"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
        <StreamingSourceSelector
          currentSource={currentSource}
          onSourceChange={handleSourceChange}
        />
      </div>

      {/* Ads blocked indicator */}
      {adsBlocked > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span><strong>{adsBlocked}</strong> ads/popups blocked</span>
        </div>
      )}

      {/* Player */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-video bg-card rounded-lg overflow-hidden touch-manipulation"
      >
        {/* Click Shield - Absorbs ad-triggering clicks */}
        {clickShieldActive && !isLoading && !error && (
          <div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={handleShieldClick}
          >
            <div className="text-center space-y-4 p-6">
              <div className="relative">
                <Shield className="w-16 h-16 text-primary mx-auto animate-pulse" />
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {CLICKS_TO_ABSORB - clicksAbsorbed}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{shieldMessage}</h3>
                <p className="text-sm text-gray-300">
                  We're absorbing ad clicks so you don't get popups
                </p>
              </div>
              
              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {Array.from({ length: CLICKS_TO_ABSORB }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i < clicksAbsorbed 
                        ? 'bg-green-500 scale-110' 
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={handleSkipShield}
                className="text-xs text-gray-400 hover:text-gray-200 underline mt-4"
              >
                Skip protection (not recommended)
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card z-10">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading player...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card z-10 p-4">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
            <p className="text-muted-foreground text-center text-sm sm:text-base">
              Failed to load video. Try a different source.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={handleRetry} variant="secondary" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        <iframe
          key={`${embedUrl}-${retryCount}`}
          ref={iframeRef}
          src={embedUrl}
          className={`w-full h-full transition-opacity duration-300 ${isLoading || clickShieldActive ? 'pointer-events-none' : ''} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups-to-escape-sandbox"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>

      {/* Quick Tips */}
      <p className="text-xs text-muted-foreground text-center">
        💡 Tip: If video doesn't load, try a different source from the dropdown above
      </p>
    </div>
  );
};

export default VideoPlayer;
