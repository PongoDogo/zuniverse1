import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Star, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { Movie, getBackdropUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import TrailerModal from "./TrailerModal";

interface HeroBannerProps {
  items: Movie[];
}

const HeroBanner = ({ items }: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
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
    <>
      <div className="relative h-[55vh] sm:h-[65vh] md:h-[80vh] w-full overflow-hidden">
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
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradients */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-40 fade-up-gradient" />

        {/* Content */}
        <div className="absolute inset-0 flex items-end sm:items-center pb-16 sm:pb-0">
          <div className="container mx-auto px-3 sm:px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-md sm:max-w-lg lg:max-w-xl space-y-2 sm:space-y-3"
              >
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[9px] sm:text-[10px] font-medium">
                    {mediaType === "tv" ? "TV SHOW" : "MOVIE"}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {current.vote_average.toFixed(1)}
                  </span>
                  <span>{year}</span>
                </div>

                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight line-clamp-2">
                  {title}
                </h1>

                <p className="text-muted-foreground line-clamp-2 text-xs sm:text-sm max-w-md hidden xs:block">
                  {current.overview}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button asChild size="sm" className="gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
                    <Link to={`/${mediaType}/${current.id}/watch`}>
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                      Watch Now
                    </Link>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                    onClick={() => setShowTrailer(true)}
                  >
                    <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Trailer
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 hidden sm:inline-flex">
                    <Link to={`/${mediaType}/${current.id}`}>
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      More Info
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Arrows & Dots */}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)}
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {featuredItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1 sm:h-1.5 rounded-full transition-all ${
                  i === currentIndex ? "w-4 sm:w-6 bg-primary" : "w-1 sm:w-1.5 bg-foreground/30 hover:bg-foreground/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredItems.length)}
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        mediaType={mediaType}
        mediaId={current.id}
        title={title}
      />
    </>
  );
};

export default HeroBanner;
