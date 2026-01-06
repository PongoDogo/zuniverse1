import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, Maximize2, RotateCcw, ShieldCheck } from "lucide-react";
import StreamingSourceSelector from "./StreamingSourceSelector";
import { Button } from "@/components/ui/button";
import { 
  streamingSources, 
  getDefaultSource,
  getPreferredSource,
  StreamingSource 
} from "@/lib/streamingSources";
import { isNativeAndroid, getBlockedCount } from "@/lib/nativeAdBlocker";

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

  // Poll native ad blocker for blocked count (only on Android)
  useEffect(() => {
    if (!isNativeAndroid()) return;
    
    const pollBlockedCount = async () => {
      const count = await getBlockedCount();
      setAdsBlocked(count);
    };
    
    // Poll every 2 seconds
    const interval = setInterval(pollBlockedCount, 2000);
    pollBlockedCount(); // Initial check
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    const url = currentSource.buildUrl(tmdbId, mediaType, season, episode);
    setEmbedUrl(url);
  }, [currentSource, tmdbId, mediaType, season, episode, retryCount]);

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
            Retry
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
            className="text-xs sm:text-sm"
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Native ad blocker indicator */}
      {isNativeAndroid() && adsBlocked > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-md w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span><strong>{adsBlocked}</strong> ads blocked</span>
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
            <p className="text-sm text-muted-foreground">Loading player...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card z-10 p-4 text-center">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive" />
            <p className="text-sm text-muted-foreground">Failed to load video</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
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
        💡 Tip: If video doesn't load, try a different source from the dropdown above
      </p>
    </div>
  );
};

export default VideoPlayer;
