import { Link } from "react-router-dom";
import { Play, Star, Heart, Pin, Plus } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/watchlist";
import { isPinned, pinItem, unpinItem } from "@/lib/userPreferences";
import { useState, useEffect, memo, useCallback } from "react";
import { toast } from "sonner";
import { useUILayout } from "@/hooks/useUILayout";

interface LayoutMediaCardProps {
  item: Movie;
  index?: number;
}

const LayoutMediaCard = memo(({ item }: LayoutMediaCardProps) => {
  const { layout } = useUILayout();
  const title = item.title || item.name || "Unknown";
  const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
  const year = (item.release_date || item.first_air_date || "").split("-")[0];
  const [inWatchlist, setInWatchlist] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setInWatchlist(isInWatchlist(item.id, mediaType));
    setPinned(isPinned(item.id, mediaType));
  }, [item.id, mediaType]);

  const handleWatchlistClick = useCallback((e: React.MouseEvent) => {
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
  }, [inWatchlist, item, mediaType]);

  const handlePinClick = useCallback((e: React.MouseEvent) => {
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
  }, [pinned, item, mediaType, title]);

  // Galaxia - Netflix sharp cards
  if (layout === "galaxia") {
    return (
      <div className="group relative transition-transform duration-200 hover:scale-110 hover:z-20">
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
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
              <h3 className="font-bold text-sm line-clamp-2 mb-1">{title}</h3>
              <div className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="text-green-500 font-semibold">{Math.round(item.vote_average * 10)}% Match</span>
                <span>{year}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <button className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
                  <Play className="w-4 h-4 text-background fill-background" />
                </button>
                <button 
                  className="w-7 h-7 rounded-full border border-foreground/50 flex items-center justify-center hover:border-foreground"
                  onClick={handleWatchlistClick}
                >
                  {inWatchlist ? <Heart className="w-3 h-3 fill-primary text-primary" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Rating badge */}
            {item.vote_average > 0 && (
              <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-background/80 px-1 py-0.5 rounded text-[10px] font-medium group-hover:opacity-0 transition-opacity">
                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                {item.vote_average.toFixed(1)}
              </div>
            )}
          </div>
        </Link>
      </div>
    );
  }

  // Cosmos - Disney+ pill cards
  if (layout === "cosmos") {
    return (
      <div className="group relative transition-transform duration-300 hover:-translate-y-2 active:scale-[0.98]">
        <Link to={`/${mediaType}/${item.id}`}>
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            {!imageLoaded && <div className="absolute inset-0 shimmer" />}
            <img
              src={getImageUrl(item.poster_path)}
              alt={title}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center glow-shadow transition-transform hover:scale-110">
                <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <h3 className="font-semibold text-sm text-center line-clamp-1">{title}</h3>
            </div>

            {item.vote_average > 0 && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/70 px-2 py-1 rounded-full text-xs font-medium">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {item.vote_average.toFixed(1)}
              </div>
            )}
          </div>
        </Link>
      </div>
    );
  }

  // Planitor - Prime Video clean cards
  if (layout === "planitor") {
    return (
      <div className="group relative transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98]">
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
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={handleWatchlistClick} className="p-1.5 rounded bg-background/80 hover:bg-primary transition-colors">
                <Heart className={`w-3.5 h-3.5 ${inWatchlist ? "fill-primary text-primary" : ""}`} />
              </button>
              <button onClick={handlePinClick} className="p-1.5 rounded bg-background/80 hover:bg-primary transition-colors">
                <Pin className={`w-3.5 h-3.5 ${pinned ? "fill-primary text-primary" : ""}`} />
              </button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
              </div>
            </div>

            {item.vote_average > 0 && (
              <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-background/80 px-1.5 py-0.5 rounded text-[10px] font-medium">
                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                {item.vote_average.toFixed(1)}
              </div>
            )}
          </div>

          <div className="mt-2 space-y-0.5">
            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-muted-foreground">{year} • {mediaType === "tv" ? "Series" : "Movie"}</p>
          </div>
        </Link>
      </div>
    );
  }

  // Default: CineTorrio
  return (
    <div className="group relative transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98]">
      <Link to={`/${mediaType}/${item.id}`}>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden card-shadow media-card-hover">
          {!imageLoaded && <div className="absolute inset-0 shimmer" />}
          <img
            src={getImageUrl(item.poster_path)}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center glow-shadow transition-transform hover:scale-110 active:scale-90">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>

          <div className="absolute top-1 left-1 flex flex-col gap-1">
            <button
              onClick={handleWatchlistClick}
              className="p-1.5 rounded-full bg-background/80 transition-all hover:bg-primary active:scale-90"
            >
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${inWatchlist ? "fill-primary text-primary" : ""}`} />
            </button>
            <button
              onClick={handlePinClick}
              className="p-1.5 rounded-full bg-background/80 transition-all hover:bg-primary active:scale-90"
            >
              <Pin className={`w-3 h-3 sm:w-4 sm:h-4 ${pinned ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>

          {item.vote_average > 0 && (
            <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-background/80 px-1 py-0.5 rounded text-[10px] font-medium">
              <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
              {item.vote_average.toFixed(1)}
            </div>
          )}
        </div>

        <div className="mt-1.5 space-y-0.5 overflow-hidden">
          <h3 className="font-medium text-xs sm:text-sm truncate group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{year} • {mediaType === "tv" ? "TV" : "Movie"}</p>
        </div>
      </Link>
    </div>
  );
});

LayoutMediaCard.displayName = "LayoutMediaCard";

export default LayoutMediaCard;
