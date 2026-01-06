import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Star, Heart } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/watchlist";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface MediaCardProps {
  item: Movie;
  index?: number;
}

const MediaCard = ({ item, index = 0 }: MediaCardProps) => {
  const title = item.title || item.name || "Unknown";
  const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
  const year = (item.release_date || item.first_air_date || "").split("-")[0];
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    setInWatchlist(isInWatchlist(item.id, mediaType));
  }, [item.id, mediaType]);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(item.id, mediaType);
      setInWatchlist(false);
      toast.success("Removed from watchlist");
    } else {
      addToWatchlist(item, mediaType);
      setInWatchlist(true);
      toast.success("Added to watchlist");
    }
  };

  return (
    <div className="group relative">
      <Link to={`/${mediaType}/${item.id}`}>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden card-shadow">
          <img
            src={getImageUrl(item.poster_path)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          
          {/* Overlay - Only on hover for desktop */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Button - Only on hover for desktop */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>

          {/* Watchlist Button */}
          <button
            onClick={handleWatchlistClick}
            className="absolute top-1 left-1 p-1.5 rounded-full bg-background/80 backdrop-blur-sm transition-all active:scale-95 hover:bg-primary"
            aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Heart
              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                inWatchlist ? "fill-primary text-primary" : "text-foreground"
              }`}
            />
          </button>

          {/* Rating Badge */}
          {item.vote_average > 0 && (
            <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm px-1 py-0.5 rounded text-[10px] font-medium">
              <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
              {item.vote_average.toFixed(1)}
            </div>
          )}
        </div>

        {/* Info - Fixed overflow */}
        <div className="mt-1.5 space-y-0.5 overflow-hidden">
          <h3 className="font-medium text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
            {year} • {mediaType === "tv" ? "TV" : "Movie"}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default MediaCard;
