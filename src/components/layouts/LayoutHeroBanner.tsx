import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Play, Info, Star, ChevronLeft, ChevronRight, Heart, Pin, Flame } from "lucide-react";
import { Movie, getBackdropUrl, getImageUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import TrailerModal from "@/components/TrailerModal";
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/watchlist";
import { isPinned, pinItem, unpinItem } from "@/lib/userPreferences";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useUILayout } from "@/hooks/useUILayout";

interface LayoutHeroBannerProps {
  items: Movie[];
}

const LayoutHeroBanner = ({ items }: LayoutHeroBannerProps) => {
  const { language } = useLanguage();
  const { layout } = useUILayout();
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

  const goNext = useCallback(() => setCurrentIndex((p) => (p + 1) % featuredItems.length), [featuredItems.length]);
  const goPrev = useCallback(() => setCurrentIndex((p) => (p - 1 + featuredItems.length) % featuredItems.length), [featuredItems.length]);

  if (!current) return null;

  const title = current.title || current.name || "Unknown";
  const mediaType = current.media_type || (current.first_air_date ? "tv" : "movie");
  const year = (current.release_date || current.first_air_date || "").split("-")[0];
  const inWatchlist = isInWatchlist(current.id, mediaType);
  const itemPinned = isPinned(current.id, mediaType);

  const heightClasses: Record<string, string> = {
    cinetorrio: "h-[55vh] sm:h-[65vh] md:h-[80vh]",
    galaxia: "h-[60vh] sm:h-[70vh] md:h-[85vh]",
    cosmos: "h-[60vh] sm:h-[70vh] md:h-[85vh]",
    planitor: "h-[50vh] sm:h-[60vh] md:h-[70vh]",
  };

  // Galaxia - Netflix-style Billboard
  if (layout === "galaxia") {
    return (
      <>
        <div 
          className={`relative ${heightClasses.galaxia} w-full overflow-hidden`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <img
            key={current.id}
            src={getBackdropUrl(current.backdrop_path)}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 pb-16 sm:pb-24">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs font-black rounded">
                    TOP 10
                  </div>
                  <span className="text-sm text-muted-foreground">
                    #{currentIndex + 1} {language === "el" ? "σήμερα" : "Today"}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight">
                  {title}
                </h1>

                <p className="text-base sm:text-lg text-foreground/80 line-clamp-3 max-w-xl">
                  {current.overview}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <Button asChild size="lg" className="gap-2 font-semibold bg-foreground text-background hover:bg-foreground/90">
                    <Link to={`/${mediaType}/${current.id}/watch`}>
                      <Play className="w-5 h-5 fill-current" />
                      {language === "el" ? "Αναπαραγωγή" : "Play"}
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="gap-2 font-semibold bg-secondary/80">
                    <Link to={`/${mediaType}/${current.id}`}>
                      <Info className="w-5 h-5" />
                      {language === "el" ? "Πληροφορίες" : "More Info"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-16 right-4 sm:right-8 flex items-center gap-2">
            <div className="px-2 py-1 border-l-2 border-foreground/50 text-sm bg-background/50">
              {current.vote_average >= 7 ? "16+" : "13+"}
            </div>
          </div>
        </div>
        <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} mediaType={mediaType} mediaId={current.id} title={title} />
      </>
    );
  }

  // Cosmos - Disney+ Style (simplified, no spring animations per card)
  if (layout === "cosmos") {
    return (
      <>
        <div className={`relative ${heightClasses.cosmos} w-full overflow-hidden flex flex-col`}>
          {/* Background of current item */}
          <div className="absolute inset-0">
            <img
              key={current.id}
              src={getBackdropUrl(current.backdrop_path)}
              alt=""
              className="w-full h-full object-cover transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          </div>

          {/* Carousel thumbnails row */}
          <div className="relative flex-1 flex items-center justify-center px-4">
            <div className="flex gap-3 items-center justify-center">
              {featuredItems.slice(0, 5).map((item, i) => {
                const isActive = i === currentIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`rounded-2xl overflow-hidden transition-all duration-500 ease-out ${
                      isActive 
                        ? "w-[55%] sm:w-[45%] md:w-[40%] opacity-100 ring-4 ring-primary shadow-2xl scale-100" 
                        : "w-[15%] sm:w-[12%] md:w-[10%] opacity-50 hover:opacity-70 scale-90"
                    }`}
                    style={{ aspectRatio: "16/9" }}
                  >
                    <img
                      src={getBackdropUrl(item.backdrop_path)}
                      alt={item.title || item.name || ""}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom content */}
          <div className="relative z-20 pb-6 sm:pb-8 text-center px-4 shrink-0">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{current.vote_average.toFixed(1)}</span>
                <span className="text-muted-foreground">• {year}</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold line-clamp-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {title}
              </h1>

              <div className="flex items-center justify-center gap-3 pt-1">
                <Button asChild className="gap-2 rounded-full px-8 glow-shadow">
                  <Link to={`/${mediaType}/${current.id}/watch`}>
                    <Play className="w-4 h-4 fill-current" />
                    {language === "el" ? "Παρακολούθηση" : "Watch"}
                  </Link>
                </Button>
                <Button variant="outline" className="rounded-full" onClick={handleWatchlistToggle}>
                  <Heart className={`w-4 h-4 ${inWatchlist ? "fill-primary text-primary" : ""}`} />
                </Button>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                {featuredItems.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex ? "w-6 bg-primary" : "w-2 bg-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} mediaType={mediaType} mediaId={current.id} title={title} />
      </>
    );
  }

  // Planitor - Prime Video Compact Style
  if (layout === "planitor") {
    return (
      <>
        <div 
          className={`relative ${heightClasses.planitor} w-full overflow-hidden`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <img
            key={current.id}
            src={getBackdropUrl(current.backdrop_path)}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-400"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-lg space-y-3">
                <div className="flex items-start gap-4">
                  <img
                    src={getImageUrl(current.poster_path, "w185")}
                    alt={title}
                    className="w-20 sm:w-28 rounded-md shadow-lg hidden sm:block"
                    loading="lazy"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded font-medium">
                        {mediaType === "tv" ? "Series" : "Movie"}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-yellow-500" />
                        {current.vote_average.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">{year}</span>
                    </div>
                    
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                      {title}
                    </h1>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">
                      {current.overview}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button asChild size="default" className="gap-2">
                    <Link to={`/${mediaType}/${current.id}/watch`}>
                      <Play className="w-4 h-4 fill-current" />
                      {language === "el" ? "Παρακολούθηση" : "Watch Now"}
                    </Link>
                  </Button>
                  <Button variant="outline" size="default" onClick={handleWatchlistToggle}>
                    <Heart className={`w-4 h-4 ${inWatchlist ? "fill-primary" : ""}`} />
                  </Button>
                  <Button variant="outline" size="default" onClick={handlePinToggle}>
                    <Pin className={`w-4 h-4 ${itemPinned ? "fill-primary" : ""}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
            {featuredItems.slice(0, 5).map((item, i) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-24 h-14 rounded overflow-hidden transition-all duration-200 ${
                  i === currentIndex ? "ring-2 ring-primary scale-105" : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={getBackdropUrl(item.backdrop_path)}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
        <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} mediaType={mediaType} mediaId={current.id} title={title} />
      </>
    );
  }

  // Default: CineTorrio
  return (
    <>
      <div 
        className={`relative ${heightClasses.cinetorrio} w-full overflow-hidden`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <img
          key={current.id}
          src={getBackdropUrl(current.backdrop_path)}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          loading="eager"
        />

        {/* Gradients */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-48 fade-up-gradient" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />

        {/* Trending Badge */}
        <div className="absolute top-20 sm:top-24 left-4 sm:left-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold shadow-lg">
            <Flame className="w-4 h-4" />
            #{currentIndex + 1} {language === "el" ? "Τάσεις" : "Trending"}
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-end sm:items-center pb-20 sm:pb-0">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-md sm:max-w-lg lg:max-w-2xl space-y-3 sm:space-y-4">
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                {current.vote_average > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    {current.vote_average.toFixed(1)}
                  </span>
                )}
                {year && (
                  <span className="px-2 py-1 bg-secondary/50 rounded-full">
                    {year}
                  </span>
                )}
                <span className="px-2 py-1 bg-primary/20 text-primary rounded-full font-medium">
                  {mediaType === "tv" ? (language === "el" ? "Σειρά" : "TV") : (language === "el" ? "Ταινία" : "Movie")}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight break-words" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {title}
              </h1>

              {/* Overview */}
              <p className="text-xs sm:text-sm text-foreground/70 line-clamp-2 sm:line-clamp-3 max-w-lg">
                {current.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                <Button asChild size="lg" className="gap-2 rounded-xl font-semibold btn-fancy glow-shadow">
                  <Link to={`/${mediaType}/${current.id}/watch`}>
                    <Play className="w-5 h-5 fill-current" />
                    {language === "el" ? "Παρακολούθηση" : "Watch Now"}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl font-semibold bg-background/30">
                  <Link to={`/${mediaType}/${current.id}`}>
                    <Info className="w-4 h-4" />
                    {language === "el" ? "Λεπτομέρειες" : "Details"}
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleWatchlistToggle}
                  className="rounded-full bg-background/30 hover:bg-background/50"
                >
                  <Heart className={`w-5 h-5 ${inWatchlist ? "fill-primary text-primary" : ""}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePinToggle}
                  className="rounded-full bg-background/30 hover:bg-background/50"
                >
                  <Pin className={`w-5 h-5 ${itemPinned ? "fill-primary text-primary" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goPrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full performance-surface hover:bg-secondary/80 transition-colors z-20 hidden sm:block"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full performance-surface hover:bg-secondary/80 transition-colors z-20 hidden sm:block"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Progress Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20">
          {featuredItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-primary"
                  : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} mediaType={mediaType} mediaId={current.id} title={title} />
    </>
  );
};

export default LayoutHeroBanner;
