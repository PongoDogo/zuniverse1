import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, X, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/tmdb";
import {
  getContinueWatching,
  removeContinueWatching,
  ContinueWatchingItem,
} from "@/lib/watchlist";
import { useLanguage } from "@/hooks/useLanguage";

const ContinueWatchingRow = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshItems = useCallback(() => {
    setItems(getContinueWatching());
  }, []);

  useEffect(() => {
    refreshItems();
    
    // Listen for continue watching updates
    const handleUpdate = () => refreshItems();
    window.addEventListener("continueWatchingUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    
    // Refresh every 30 seconds in case of external changes
    const interval = setInterval(refreshItems, 30000);
    
    return () => {
      window.removeEventListener("continueWatchingUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, [refreshItems]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleRemove = (e: React.MouseEvent, item: ContinueWatchingItem) => {
    e.preventDefault();
    e.stopPropagation();
    removeContinueWatching(item.id, item.mediaType, item.season, item.episode);
  };

  const formatTimeLeft = (item: ContinueWatchingItem) => {
    const secondsLeft = Math.max(0, item.duration - item.currentTime);
    const minutesLeft = Math.round(secondsLeft / 60);
    
    if (minutesLeft < 1) return `< 1 ${t("minLeft").split(" ")[0]}`;
    if (minutesLeft >= 60) {
      const hours = Math.floor(minutesLeft / 60);
      const mins = minutesLeft % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutesLeft} ${t("minLeft")}`;
  };

  if (items.length === 0) return null;

  return (
    <div className="relative group/row overflow-hidden">
      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        {t("continueWatching")}
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
            <motion.div
              key={`${item.id}-${item.season || 0}-${item.episode || 0}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0 w-[200px] sm:w-[260px] md:w-[300px] group"
            >
              <Link to={watchUrl} className="block relative">
                <div className="relative aspect-video rounded-lg overflow-hidden card-shadow">
                  <img
                    src={getImageUrl(item.backdrop_path || item.poster_path, "w500")}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center shadow-lg"
                    >
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                    </motion.div>
                  </div>

                  {/* Progress bar at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted/60">
                    <motion.div
                      className="h-full bg-primary rounded-r-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  {/* Progress percentage badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] sm:text-xs font-semibold shadow-lg">
                    {item.progress}%
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemove(e, item)}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:scale-110"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="mt-2 overflow-hidden">
                  <h3 className="font-semibold text-xs sm:text-sm truncate">
                    {item.title}
                  </h3>
                  {item.mediaType === "tv" && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      S{item.season} E{item.episode}{item.episodeName ? `: ${item.episodeName}` : ""}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-primary font-medium mt-0.5">
                    ⏱️ {formatTimeLeft(item)}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueWatchingRow;
