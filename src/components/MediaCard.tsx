import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Star, Heart, Pin } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { useUserData } from "@/hooks/useUserData";
import { isInFavorites, addToFavorites, removeFromFavorites } from "@/lib/favorites";
import { useState, memo, useEffect } from "react";
import { toast } from "sonner";
import WatchedBadge from "./WatchedBadge";

interface MediaCardProps {
  item: Movie;
  index?: number;
}

const MediaCard = memo(({ item, index = 0 }: MediaCardProps) => {
  const title = item.title || item.name || "Unknown";
  const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
  const year = (item.release_date || item.first_air_date || "").split("-")[0];
  const { isPinned, pinItem, unpinItem, isWatched } = useUserData();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(isInFavorites(item.id, mediaType));
  }, [item.id, mediaType]);

  const pinned = isPinned(item.id, mediaType);
  const watched = isWatched(item.id, mediaType);
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      removeFromFavorites(item.id, mediaType);
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      addToFavorites(item, mediaType);
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  const handlePinClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pinned) {
      await unpinItem(item.id, mediaType);
      toast.success("Removed from pinned");
    } else {
      await pinItem({
        id: item.id,
        mediaType,
        title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
      });
      toast.success("Pinned to home");
    }
  };

  return (
    <motion.div 
      className="group relative"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/${mediaType}/${item.id}`}>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden card-fancy card-shadow media-card-hover">
          {/* Shimmer placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 shimmer" />
          )}
          <img
            src={getImageUrl(item.poster_path)}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
          </div>
          
          {/* Overlay - Only on hover for desktop */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Button - Only on hover for desktop */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center glow-shadow"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground fill-current ml-0.5" />
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-1 left-1 flex flex-col gap-1">
            {/* Favorite Button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleFavoriteClick}
              className="p-1.5 rounded-full bg-background/70 backdrop-blur-md transition-all duration-200 hover:bg-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                  isFavorite ? "fill-primary text-primary" : "text-foreground"
                }`}
              />
            </motion.button>

            {/* Pin Button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handlePinClick}
              className="p-1.5 rounded-full bg-background/70 backdrop-blur-md transition-all duration-200 hover:bg-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
              aria-label={pinned ? "Unpin" : "Pin to home"}
            >
              <Pin
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                  pinned ? "fill-primary text-primary" : "text-foreground"
                }`}
              />
            </motion.button>
          </div>

          {/* Watched Badge */}
          {watched && <WatchedBadge />}

          {/* Rating Badge */}
          {item.vote_average > 0 && (
            <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm px-1 py-0.5 rounded text-[10px] font-medium" style={watched ? { top: "1.75rem" } : {}}>
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
    </motion.div>
  );
});

MediaCard.displayName = "MediaCard";

export default MediaCard;
