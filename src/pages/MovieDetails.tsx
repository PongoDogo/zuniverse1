import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Star, Clock, Calendar, ArrowLeft, PlayCircle, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import WatchlistButton from "@/components/WatchlistButton";
import TrailerModal from "@/components/TrailerModal";
import { Button } from "@/components/ui/button";
import {
  getDetails,
  getCredits,
  getSimilar,
  getBackdropUrl,
  getImageUrl,
} from "@/lib/tmdb";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || "0");
  const [showTrailer, setShowTrailer] = useState(false);

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
        <p className="text-muted-foreground">Movie not found</p>
      </div>
    );
  }

  const year = (movie.release_date || "").split("-")[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <img
          src={getBackdropUrl(movie.backdrop_path)}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute bottom-0 left-0 right-0 h-48 fade-up-gradient" />
      </div>

      {/* Content */}
      <div className="relative z-10 -mt-40 pb-16">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0"
            >
              <img
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                className="w-48 md:w-64 rounded-lg card-shadow"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 space-y-4"
            >
              <h1 className="text-3xl md:text-5xl font-bold">{movie.title}</h1>

              {movie.tagline && (
                <p className="text-muted-foreground italic">{movie.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {movie.vote_average.toFixed(1)}
                </span>
                {year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {year}
                  </span>
                )}
                {movie.runtime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-muted-foreground max-w-2xl">{movie.overview}</p>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button asChild size="lg" className="gap-2 glow-shadow">
                  <Link to={`/movie/${movieId}/watch`}>
                    <Play className="w-5 h-5 fill-current" />
                    Watch Now
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="gap-2"
                  onClick={() => setShowTrailer(true)}
                >
                  <PlayCircle className="w-5 h-5" />
                  Trailer
                </Button>
                <WatchlistButton item={movie} mediaType="movie" variant="full" />
              </div>
            </motion.div>
          </div>

          {/* Cast */}
          {credits && credits.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12"
            >
              <h2 className="text-xl font-bold mb-4">Cast</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {credits.map((person) => (
                  <div key={person.id} className="flex-shrink-0 w-32 text-center">
                    <img
                      src={getImageUrl(person.profile_path, "w200")}
                      alt={person.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-2"
                    />
                    <p className="text-sm font-medium line-clamp-1">{person.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {person.character}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Similar */}
          {similar && similar.length > 0 && (
            <div className="mt-12">
              <MediaRow title="Similar Movies" items={similar} />
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
