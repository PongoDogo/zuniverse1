import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
}

const VideoPlayer = ({ tmdbId, mediaType, season, episode }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Build VixSrc URL
  let embedUrl = `https://vixsrc.to/${mediaType}/${tmdbId}`;
  if (mediaType === "tv" && season && episode) {
    embedUrl = `https://vixsrc.to/tv/${tmdbId}/${season}/${episode}`;
  }

  // Add customization parameters
  embedUrl += "?primaryColor=DC2626&secondaryColor=7F1D1D&autoplay=true";

  useEffect(() => {
    setIsLoading(true);
    setError(false);
  }, [tmdbId, season, episode]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
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
            Failed to load video. Please try again later.
          </p>
        </div>
      )}

      <motion.iframe
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
  );
};

export default VideoPlayer;
