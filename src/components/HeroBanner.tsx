import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Movie, getBackdropUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  items: Movie[];
}

const HeroBanner = ({ items }: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredItems = items.slice(0, 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  const current = featuredItems[currentIndex];
  if (!current) return null;

  const title = current.title || current.name || "Unknown";
  const mediaType = current.media_type || (current.first_air_date ? "tv" : "movie");
  const year = (current.release_date || current.first_air_date || "").split("-")[0];

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={getBackdropUrl(current.backdrop_path)}
            alt={title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute bottom-0 left-0 right-0 h-48 fade-up-gradient" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                  {mediaType === "tv" ? "TV SHOW" : "MOVIE"}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {current.vote_average.toFixed(1)}
                </span>
                <span>{year}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight">{title}</h1>

              <p className="text-muted-foreground line-clamp-3 text-sm md:text-base max-w-xl">
                {current.overview}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg" className="gap-2 glow-shadow">
                  <Link to={`/${mediaType}/${current.id}/watch`}>
                    <Play className="w-5 h-5 fill-current" />
                    Watch Now
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="gap-2">
                  <Link to={`/${mediaType}/${current.id}`}>
                    <Info className="w-5 h-5" />
                    More Info
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)}
          className="w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {featuredItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? "w-8 bg-primary" : "bg-foreground/30 hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredItems.length)}
          className="w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default HeroBanner;
