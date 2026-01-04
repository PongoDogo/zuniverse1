import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import StreamingSourceSelector, {
  streamingSources,
  StreamingSource,
} from "./StreamingSourceSelector";
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
    streamingSources[0]
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedUrl = currentSource.buildUrl(tmdbId, mediaType, season, episode);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
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

  return (
    <div className="space-y-4">
      {/* Source Selector */}
      <div className="flex justify-end">
        <StreamingSourceSelector
          currentSource={currentSource}
          onSourceChange={handleSourceChange}
        />
      </div>

      {/* Player */}
      <div className="relative w-full aspect-video bg-card rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card">
            <AlertCircle className="w-16 h-16 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              Failed to load video. Try a different source.
            </p>
          </div>
        )}

        <motion.iframe
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
    </div>
  );
};

export default VideoPlayer;
