import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Star, Heart, Pin, Plus } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/watchlist";
import { isPinned, pinItem, unpinItem } from "@/lib/userPreferences";
import { useState, useEffect, memo } from "react";
import { toast } from "sonner";
import { useUILayout } from "@/hooks/useUILayout";

interface LayoutMediaCardProps {
  item: Movie;
  index?: number;
}

const LayoutMediaCard = memo(({ item, index = 0 }: LayoutMediaCardProps) => {
  const { layout } = useUILayout();
  const title = item.title || item.name || "Unknown";
  const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
  const year = (item.release_date || item.first_air_date || "").split("-")[0];
  const [inWatchlist, setInWatchlist] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setInWatchlist(isInWatchlist(item.id, mediaType));
    setPinned(isPinned(item.id, mediaType));
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

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pinned) {
      unpinItem(item.id, mediaType);
      setPinned(false);
      toast.success("Removed from pinned");
    } else {
      pinItem({
        id: item.id,
        mediaType,
        title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
      });
      setPinned(true);
      toast.success("Pinned to home");
    }
  };

  // Galaxia - Netflix sharp cards with scale hover
  if (layout === "galaxia") {
    return (
      <motion.div 
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{ scale: isHovered ? 1.1 : 1, zIndex: isHovered ? 20 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <Link to={`/${mediaType}/${item.id}`}>
          <div className="relative aspect-[2/3] rounded-sm overflow-hidden shadow-lg">
            {!imageLoaded && <div className="absolute inset-0 shimmer" />}
            <img
              src={getImageUrl(item.poster_path)}
              alt={title}
              className={`w-full h-full object-cover ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Hover overlay with info */}
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-3"
              >
                <h3 className="font-bold text-sm line-clamp-2 mb-1">{title}</h3>
                <div className="flex items-center gap-2 text-xs text-foreground/80">
                  <span className="text-green-500 font-semibold">{Math.round(item.vote_average * 10)}% Match</span>
                  <span>{year}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <button 
                    className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center"
                    onClick={(e) => { e.preventDefault(); }}
                  >
                    <Play className="w-4 h-4 text-background fill-background" />
                  </button>
                  <button 
                    className="w-7 h-7 rounded-full border border-foreground/50 flex items-center justify-center hover:border-foreground"
                    onClick={handleWatchlistClick}
                  >
                    {inWatchlist ? <Heart className="w-3 h-3 fill-primary text-primary" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Rating badge - always visible */}
            {item.vote_average > 0 && !isHovered && (
              <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-background/80 px-1 py-0.5 rounded text-[10px] font-medium">
                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                {item.vote_average.toFixed(1)}
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    );
  }

  // Cosmos - Disney+ pill cards with glow
  if (layout === "cosmos") {
    return (
      <motion.div 
        className="group relative"
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3 }}
      >
        <Link to={`/${mediaType}/${item.id}`}>
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            {!imageLoaded && <div className="absolute inset-0 shimmer" />}
            <img
              src={getImageUrl(item.poster_path)}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Magical gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Play button center */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.div 
                initial={{ scale: 0.5 }}
                whileHover={{ scale: 1.1 }}
                className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center glow-shadow"
              >
                <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
              </motion.div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <h3 className="font-semibold text-sm text-center line-clamp-1">{title}</h3>
            </div>

            {/* Rating */}
            {item.vote_average > 0 && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {item.vote_average.toFixed(1)}
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    );
  }

  // Planitor - Prime Video glass cards with border hover
  if (layout === "planitor") {
    return (
      <motion.div 
        className="group relative"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Link to={`/${mediaType}/${item.id}`}>
          <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-card border-2 border-transparent transition-all duration-200 group-hover:border-primary">
            {!imageLoaded && <div className="absolute inset-0 shimmer" />}
            <img
              src={getImageUrl(item.poster_path)}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Simple overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Action buttons */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleWatchlistClick}
                className="p-1.5 rounded bg-background/80 backdrop-blur-sm hover:bg-primary transition-colors"
              >
                <Heart className={`w-3.5 h-3.5 ${inWatchlist ? "fill-primary text-primary" : ""}`} />
              </button>
              <button
                onClick={handlePinClick}
                className="p-1.5 rounded bg-background/80 backdrop-blur-sm hover:bg-primary transition-colors"
              >
                <Pin className={`w-3.5 h-3.5 ${pinned ? "fill-primary text-primary" : ""}`} />
              </button>
            </div>

            {/* Play center */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
              </div>
            </div>

            {/* Rating */}
            {item.vote_average > 0 && (
              <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-background/80 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-medium">
                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                {item.vote_average.toFixed(1)}
              </div>
            )}
          </div>

          {/* Info below */}
          <div className="mt-2 space-y-0.5">
            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-muted-foreground">{year} • {mediaType === "tv" ? "Series" : "Movie"}</p>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default: CineTorrio - Premium modern cards
  return (
    <motion.div 
      className="group relative"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/${mediaType}/${item.id}`}>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden card-shadow media-card-hover">
          {!imageLoaded && <div className="absolute inset-0 shimmer" />}
          <img
            src={getImageUrl(item.poster_path)}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Button */}
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
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleWatchlistClick}
              className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-primary"
            >
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${inWatchlist ? "fill-primary text-primary" : ""}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handlePinClick}
              className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-primary"
            >
              <Pin className={`w-3 h-3 sm:w-4 sm:h-4 ${pinned ? "fill-primary text-primary" : ""}`} />
            </motion.button>
          </div>

          {/* Rating Badge */}
          {item.vote_average > 0 && (
            <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-background/80 backdrop-blur-sm px-1 py-0.5 rounded text-[10px] font-medium">
              <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
              {item.vote_average.toFixed(1)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-1.5 space-y-0.5 overflow-hidden">
          <h3 className="font-medium text-xs sm:text-sm truncate group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{year} • {mediaType === "tv" ? "TV" : "Movie"}</p>
        </div>
      </Link>
    </motion.div>
  );
});

LayoutMediaCard.displayName = "LayoutMediaCard";

export default LayoutMediaCard;
