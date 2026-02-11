import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { useLanguage } from "@/hooks/useLanguage";

interface TopTenRowProps {
  items: Movie[];
  isLoading?: boolean;
}

const TopTenRow = ({ items, isLoading }: TopTenRowProps) => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const topItems = items.slice(0, 10);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      checkScroll();
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <div className="h-7 w-48 bg-secondary rounded animate-pulse mb-3" />
        <div className="flex gap-4 overflow-hidden pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[180px] sm:w-[220px] aspect-[2/3] bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!topItems.length) return null;

  return (
    <div className="relative group/row overflow-hidden">
      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 flex items-center gap-2">
        <span className="text-gradient">🔥 {t("topTenThisWeek")}</span>
      </h2>

      <button
        onClick={() => scroll("left")}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm items-center justify-center transition-all hover:bg-primary hover:text-primary-foreground hidden md:flex ${
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm items-center justify-center transition-all hover:bg-primary hover:text-primary-foreground hidden md:flex ${
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {topItems.map((item, index) => {
          const title = item.title || item.name || "Unknown";
          const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 relative group"
            >
              <Link to={`/${mediaType}/${item.id}`} className="flex items-end">
                {/* Large rank number */}
                <span
                  className="text-[80px] sm:text-[100px] md:text-[120px] font-black leading-none select-none"
                  style={{
                    WebkitTextStroke: "2px hsl(var(--primary))",
                    WebkitTextFillColor: "transparent",
                    marginRight: "-20px",
                    zIndex: 1,
                    fontFamily: "'Bebas Neue', sans-serif",
                  }}
                >
                  {index + 1}
                </span>
                <div className="relative w-[100px] sm:w-[120px] md:w-[140px] aspect-[2/3] rounded-lg overflow-hidden card-shadow media-card-hover">
                  <img
                    src={getImageUrl(item.poster_path)}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TopTenRow;
