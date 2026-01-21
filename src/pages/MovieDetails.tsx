import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Star, Clock, Calendar, ArrowLeft, PlayCircle, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import WatchlistButton from "@/components/WatchlistButton";
import MarkAsWatchedButton from "@/components/MarkAsWatchedButton";
import PinButton from "@/components/PinButton";
import TrailerModal from "@/components/TrailerModal";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getDetails,
  getCredits,
  getSimilar,
  getBackdropUrl,
  getImageUrl,
} from "@/lib/tmdb";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserData } from "@/hooks/useUserData";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || "0");
  const [showTrailer, setShowTrailer] = useState(false);
  const { t, language } = useLanguage();
  const { isWatched, getUserRating, updateRating, isSignedIn } = useUserData();
  
  const watched = isWatched(movieId, "movie");
  const userRating = getUserRating(movieId, "movie");

  const handleRatingChange = async (rating: number) => {
    if (!isSignedIn) {
      toast.error(t("signInToSync"));
      return;
    }
    if (!watched) {
      toast.error(t("markAsWatchedFirst"));
      return;
    }
    await updateRating(movieId, "movie", rating);
    toast.success(t("ratingUpdated"));
  };

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => getDetails("movie", movieId),
    enabled: !!movieId,
  });

  const { data: credits } = useQuery({
    queryKey: ["credits", "movie", movieId],
    queryFn: () => getCredits("movie", movieId),
    enabled: !!movieId,
  });

  const { data: similar } = useQuery({
    queryKey: ["similar", "movie", movieId],
    queryFn: () => getSimilar("movie", movieId),
    enabled: !!movieId,
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie?.title || "Movie",
          text: `Check out ${movie?.title} on CineTorrio`,
          url: url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(language === "el" ? "Ο σύνδεσμος αντιγράφηκε!" : "Link copied!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{language === "el" ? "Η ταινία δεν βρέθηκε" : "Movie not found"}</p>
      </div>
    );
  }

  const year = (movie.release_date || "").split("-")[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Backdrop */}
      <div className="relative h-[65vh] md:h-[75vh]">
        <img
          src={getBackdropUrl(movie.backdrop_path)}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute bottom-0 left-0 right-0 h-64 fade-up-gradient" />
        
        {/* Back Button Overlay */}
        <div className="absolute top-20 left-0 right-0 z-10">
          <div className="container mx-auto px-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("back")}
            </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 -mt-48 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Poster Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 lg:w-72"
            >
              <img
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                className="w-48 lg:w-full rounded-xl shadow-2xl mx-auto lg:mx-0"
              />
              
              {/* Quick Stats Card - Desktop */}
              <div className="hidden lg:block mt-6 p-4 bg-card rounded-xl border border-border/50">
                <h3 className="font-semibold mb-3 text-sm">{language === "el" ? "Πληροφορίες" : "Details"}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "el" ? "Κυκλοφορία" : "Release"}</span>
                    <span>{movie.release_date}</span>
                  </div>
                  {movie.runtime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === "el" ? "Διάρκεια" : "Runtime"}</span>
                      <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "el" ? "Βαθμολογία" : "Rating"}</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "el" ? "Ψήφοι" : "Votes"}</span>
                    <span>{movie.vote_count?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Info Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 space-y-5"
            >
              {/* Title & Tagline */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-muted-foreground italic text-lg">"{movie.tagline}"</p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                <Badge variant="secondary" className="gap-1 px-3 py-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  {movie.vote_average.toFixed(1)}
                </Badge>
                {year && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {year}
                  </span>
                )}
                {movie.runtime && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre) => (
                  <Badge key={genre.id} variant="outline" className="px-3 py-1">
                    {genre.name}
                  </Badge>
                ))}
              </div>

              {/* Overview */}
              <p className="text-muted-foreground leading-relaxed max-w-3xl">
                {movie.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg" className="gap-2 glow-shadow h-12 px-6">
                  <Link to={`/movie/${movieId}/watch`}>
                    <Play className="w-5 h-5 fill-current" />
                    {language === "el" ? "Παρακολούθηση" : "Watch Now"}
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="gap-2 h-12"
                  onClick={() => setShowTrailer(true)}
                >
                  <PlayCircle className="w-5 h-5" />
                  {language === "el" ? "Τρέιλερ" : "Trailer"}
                </Button>
                <WatchlistButton item={movie} mediaType="movie" variant="full" />
                <MarkAsWatchedButton item={movie} mediaType="movie" variant="full" />
                <PinButton item={movie} mediaType="movie" />
                <Button variant="ghost" size="icon" onClick={handleShare} className="h-12 w-12">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* User Rating Section - Only show when watched */}
              {watched && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">{t("yourRating")}</p>
                  <StarRating
                    value={userRating}
                    onChange={handleRatingChange}
                    maxStars={10}
                    size="lg"
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Cast Section */}
          {credits && credits.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12"
            >
              <h2 className="text-xl font-bold mb-5">{language === "el" ? "Ηθοποιοί" : "Cast"}</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {credits.slice(0, 12).map((person) => (
                  <div key={person.id} className="flex-shrink-0 w-28 text-center group">
                    <div className="relative mb-2 overflow-hidden rounded-full">
                      <img
                        src={getImageUrl(person.profile_path, "w200")}
                        alt={person.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-border group-hover:ring-primary transition-all"
                      />
                    </div>
                    <p className="text-sm font-medium line-clamp-1">{person.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {person.character}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Similar Movies */}
          {similar && similar.length > 0 && (
            <div className="mt-12">
              <MediaRow 
                title={language === "el" ? "Παρόμοιες Ταινίες" : "Similar Movies"} 
                items={similar} 
              />
            </div>
          )}
        </div>
      </div>

      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        mediaType="movie"
        mediaId={movieId}
        title={movie.title || ""}
      />
    </div>
  );
};

export default MovieDetails;