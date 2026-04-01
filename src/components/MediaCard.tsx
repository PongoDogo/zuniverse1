import { Link } from "react-router-dom";
import { Play, Star, Heart, Pin } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { useUserData } from "@/hooks/useUserData";
import { isInFavorites, addToFavorites, removeFromFavorites } from "@/lib/favorites";
import { useState, memo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import WatchedBadge from "./WatchedBadge";

interface MediaCardProps {
  item: Movie;
  index?: number;
}

const MediaCard = memo(({ item }: MediaCardProps) => {
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

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
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
  }, [isFavorite, item, mediaType]);

  const handlePinClick = useCallback(async (e: React.MouseEvent) => {
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
  }, [pinned, item, mediaType, title, pinItem, unpinItem]);

  return (
    <div className="group relative">
      <Link to={`/${mediaType}/${item.id}`}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden cyber-card media-card-hover">
          {/* Skeleton placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton-wave" />
          )}
          <img
            src={getImageUrl(item.poster_path)}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          {/* Play Button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center glow-shadow transition-transform duration-200 hover:scale-110 active:scale-90">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-1 left-1 flex flex-col gap-1 z-10">
            <button
              onClick={handleFavoriteClick}
              className="p-1.5 rounded-full bg-background/70 backdrop-blur-md transition-all duration-200 hover:bg-primary active:scale-90"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                  isFavorite ? "fill-primary text-primary" : "text-foreground"
                }`}
              />
            </button>
            <button
              onClick={handlePinClick}
              className="p-1.5 rounded-full bg-background/70 backdrop-blur-md transition-all duration-200 hover:bg-primary active:scale-90"
              aria-label={pinned ? "Unpin" : "Pin to home"}
            >
              <Pin
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                  pinned ? "fill-primary text-primary" : "text-foreground"
                }`}
              />
            </button>
          </div>

          {/* Watched Badge */}
          {watched && <WatchedBadge />}

          {/* Rating Badge */}
          {item.vote_average > 0 && (
            <div 
              className="absolute top-1 right-1 flex items-center gap-0.5 bg-background/80 px-1.5 py-0.5 rounded-md text-[10px] font-medium border border-primary/20 z-10"
              style={watched ? { top: "1.75rem" } : {}}
            >
              <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
              {item.vote_average.toFixed(1)}
            </div>
          )}

          {/* Bottom border glow */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Info */}
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
});

MediaCard.displayName = "MediaCard";

export default MediaCard;
