import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/tmdb";
import {
  getContinueWatching,
  removeContinueWatching,
  ContinueWatchingItem,
} from "@/lib/watchlist";

const ContinueWatchingRow = () => {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(getContinueWatching());
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleRemove = (item: ContinueWatchingItem) => {
    removeContinueWatching(item.id, item.mediaType, item.season, item.episode);
    setItems(getContinueWatching());
  };

  if (items.length === 0) return null;

  return (
    <div className="relative group/row overflow-hidden">
      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">
        Continue Watching
      </h2>

      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-primary hidden md:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-primary hidden md:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => {
          const watchUrl =
            item.mediaType === "tv"
              ? `/tv/${item.id}/watch/${item.season}/${item.episode}`
              : `/movie/${item.id}/watch`;

          return (
            <div
              key={`${item.id}-${item.season}-${item.episode}`}
              className="flex-shrink-0 w-[200px] sm:w-[260px] md:w-[300px] group"
            >
              <Link to={watchUrl} className="block relative">
                <div className="relative aspect-video rounded-lg overflow-hidden card-shadow">
                  <img
                    src={getImageUrl(item.backdrop_path || item.poster_path, "w500")}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(item);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="mt-1.5 overflow-hidden">
                  <h3 className="font-medium text-xs sm:text-sm truncate">
                    {item.title}
                  </h3>
                  {item.mediaType === "tv" && item.episodeName && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      S{item.season} E{item.episode}: {item.episodeName}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {Math.round((item.duration - item.currentTime) / 60)} min left
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueWatchingRow;
