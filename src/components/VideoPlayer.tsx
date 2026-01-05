import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Maximize2, RotateCcw, Volume2, VolumeX } from "lucide-react";
import StreamingSourceSelector from "./StreamingSourceSelector";
import { Button } from "@/components/ui/button";
import { 
  streamingSources, 
  StreamingSource, 
  getPreferredSource 
} from "@/lib/streamingSources";
import { updateContinueWatching, ContinueWatchingItem } from "@/lib/watchlist";

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const embedUrl = currentSource.buildUrl(tmdbId, mediaType, season, episode);

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

        <motion.iframe
          key={`${embedUrl}-${retryCount}`}
          ref={iframeRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
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
