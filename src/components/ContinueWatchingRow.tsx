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
    <div className="relative group/row">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-xl md:text-2xl font-bold mb-4"
      >
        Continue Watching
      </motion.h2>

      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-primary"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-primary"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 w-[280px] md:w-[320px] group"
            >
              <Link to={watchUrl} className="block relative">
                <div className="relative aspect-video rounded-lg overflow-hidden card-shadow">
                  <img
                    src={getImageUrl(item.backdrop_path || item.poster_path, "w500")}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center glow-shadow">
                      <Play className="w-6 h-6 fill-current ml-1" />
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
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2">
                  <h3 className="font-medium text-sm line-clamp-1">
                    {item.title}
                  </h3>
                  {item.mediaType === "tv" && item.episodeName && (
                    <p className="text-xs text-muted-foreground">
                      S{item.season} E{item.episode}: {item.episodeName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {Math.round((item.duration - item.currentTime) / 60)} min left
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
