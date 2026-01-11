import { useRef, useState, useEffect } from "react";
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

  useEffect(() => {
    setItems(getContinueWatching());
    
    // Refresh on storage changes
    const handleStorage = () => setItems(getContinueWatching());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
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

  const formatTimeLeft = (item: ContinueWatchingItem) => {
    const secondsLeft = Math.max(0, item.duration - item.currentTime);
    const minutesLeft = Math.round(secondsLeft / 60);
    
    if (minutesLeft < 1) return "< 1 " + t("minLeft").split(" ")[0];
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
              key={`${item.id}-${item.season}-${item.episode}`}
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

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center shadow-lg"
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                    </motion.div>
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted/80">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Progress percentage badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm text-[10px] font-medium">
                    {item.progress}%
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
                  {item.mediaType === "tv" && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      S{item.season} E{item.episode}{item.episodeName ? `: ${item.episodeName}` : ""}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-primary font-medium">
                    {formatTimeLeft(item)}
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
