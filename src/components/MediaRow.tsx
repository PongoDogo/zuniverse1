import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Movie } from "@/lib/tmdb";
import MediaCard from "./MediaCard";

interface MediaRowProps {
  title: string;
  items: Movie[];
  isLoading?: boolean;
}

const MediaRow = ({ title, items, isLoading }: MediaRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
      <div className="relative group/row">
        <div className="h-7 w-40 bg-secondary rounded animate-pulse mb-3" />
        <div className="flex gap-3 overflow-hidden pb-4 -mx-3 px-3 sm:-mx-4 sm:px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[130px] sm:w-[150px] md:w-[180px] aspect-[2/3] bg-secondary rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!items?.length) return null;

  return (
    <div className="relative group/row overflow-hidden">
      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 truncate">
        {title}
      </h2>

      {/* Scroll Buttons - Hidden on mobile */}
      <button
        onClick={() => scroll("left")}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm items-center justify-center transition-all hover:bg-primary hover:text-primary-foreground hidden md:flex ${
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm items-center justify-center transition-all hover:bg-primary hover:text-primary-foreground hidden md:flex ${
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scrollable Container - Optimized for mobile */}
      <div
        ref={scrollRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex-shrink-0 w-[100px] sm:w-[130px] md:w-[160px]"
          >
            <MediaCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaRow;
