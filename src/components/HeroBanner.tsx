import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Star, ChevronLeft, ChevronRight, PlayCircle, Heart, Pin, TrendingUp, Flame } from "lucide-react";
import { Movie, getBackdropUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import TrailerModal from "./TrailerModal";
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/watchlist";
import { isPinned, pinItem, unpinItem } from "@/lib/userPreferences";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface HeroBannerProps {
  items: Movie[];
}

const HeroBanner = ({ items }: HeroBannerProps) => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const featuredItems = items.slice(0, 7);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredItems.length, isPaused]);

  const current = featuredItems[currentIndex];
  if (!current) return null;

  const title = current.title || current.name || "Unknown";
  const mediaType = current.media_type || (current.first_air_date ? "tv" : "movie");
  const year = (current.release_date || current.first_air_date || "").split("-")[0];
  const inWatchlist = isInWatchlist(current.id, mediaType);
  const itemPinned = isPinned(current.id, mediaType);

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(current.id, mediaType);
      toast.success(language === "el" ? "Αφαιρέθηκε από τη λίστα" : "Removed from watchlist");
    } else {
      addToWatchlist(current, mediaType);
      toast.success(language === "el" ? "Προστέθηκε στη λίστα" : "Added to watchlist");
    }
  };

  const handlePinToggle = () => {
    if (itemPinned) {
      unpinItem(current.id, mediaType);
      toast.success(language === "el" ? "Ξεκαρφιτσώθηκε" : "Unpinned");
    } else {
      pinItem({
        id: current.id,
        mediaType,
        title,
        poster_path: current.poster_path,
        backdrop_path: current.backdrop_path,
      });
      toast.success(language === "el" ? "Καρφιτσώθηκε" : "Pinned to home");
    }
  };

  return (
    <>
      <div 
        className="relative h-[55vh] sm:h-[65vh] md:h-[80vh] w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7 }}
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

        {/* Enhanced Gradients */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-48 fade-up-gradient" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />

        {/* Trending Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-20 sm:top-24 left-4 sm:left-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold shadow-lg">
            <Flame className="w-4 h-4" />
            #{currentIndex + 1} {language === "el" ? "Τάσεις" : "Trending"}
          </div>
        </motion.div>

        {/* Content */}
        <div className="absolute inset-0 flex items-end sm:items-center pb-20 sm:pb-0">
          <div className="container mx-auto px-3 sm:px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md sm:max-w-lg lg:max-w-2xl space-y-3 sm:space-y-4"
              >
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                  <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-[9px] sm:text-[10px] font-bold tracking-wider">
                    {mediaType === "tv" ? "TV SHOW" : "MOVIE"}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded text-yellow-400">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    <span className="font-semibold">{current.vote_average.toFixed(1)}</span>
                  </span>
                  <span className="text-muted-foreground">{year}</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight line-clamp-2 drop-shadow-lg break-words">
                  {title}
                </h1>

                {/* Overview */}
                <p className="text-muted-foreground line-clamp-2 sm:line-clamp-3 text-sm sm:text-base max-w-xl hidden xs:block break-words">
                  {current.overview}
                </p>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                  <Button asChild size="default" className="gap-2 text-sm sm:text-base h-10 sm:h-12 px-5 sm:px-7 btn-fancy glow-shadow font-semibold">
                    <Link to={`/${mediaType}/${current.id}/watch`}>
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                      {language === "el" ? "Παρακολούθηση" : "Watch Now"}
                    </Link>
                  </Button>
                  <Button
                    variant="secondary"
                    size="default"
                    className="gap-2 text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-6"
                    onClick={() => setShowTrailer(true)}
                  >
                    <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Trailer
                  </Button>
                  <Button asChild variant="outline" size="default" className="gap-2 text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-6 hidden sm:inline-flex">
                    <Link to={`/${mediaType}/${current.id}`}>
                      <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                      {language === "el" ? "Λεπτομέρειες" : "More Info"}
                    </Link>
                  </Button>
                  
                  {/* Quick action buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleWatchlistToggle}
                      className="w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm hover:bg-primary"
                    >
                      <Heart className={`w-5 h-5 ${inWatchlist ? "fill-primary text-primary" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePinToggle}
                      className="w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm hover:bg-primary"
                    >
                      <Pin className={`w-5 h-5 ${itemPinned ? "fill-primary text-primary" : ""}`} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Arrows & Dots */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-all hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {featuredItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`transition-all rounded-full ${
                  i === currentIndex 
                    ? "w-8 h-2 bg-primary" 
                    : "w-2 h-2 bg-foreground/30 hover:bg-foreground/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredItems.length)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-all hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail preview strip */}
        <div className="absolute bottom-4 right-4 hidden lg:flex items-center gap-2">
          {featuredItems.slice(0, 5).map((item, i) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(i)}
              className={`relative w-16 h-10 rounded overflow-hidden transition-all ${
                i === currentIndex ? "ring-2 ring-primary scale-110" : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={getBackdropUrl(item.backdrop_path)}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
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
