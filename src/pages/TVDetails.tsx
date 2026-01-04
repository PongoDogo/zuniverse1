import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Star, Calendar, ArrowLeft, Tv, PlayCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import WatchlistButton from "@/components/WatchlistButton";
import TrailerModal from "@/components/TrailerModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDetails,
  getCredits,
  getSimilar,
  getSeasonDetails,
  getBackdropUrl,
  getImageUrl,
} from "@/lib/tmdb";

const TVDetails = () => {
  const { id } = useParams<{ id: string }>();
  const tvId = parseInt(id || "0");
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showTrailer, setShowTrailer] = useState(false);

  const { data: show, isLoading } = useQuery({
    queryKey: ["tv", tvId],
    queryFn: () => getDetails("tv", tvId),
    enabled: !!tvId,
  });

  const { data: credits } = useQuery({
    queryKey: ["credits", "tv", tvId],
    queryFn: () => getCredits("tv", tvId),
    enabled: !!tvId,
  });

  const { data: similar } = useQuery({
    queryKey: ["similar", "tv", tvId],
    queryFn: () => getSimilar("tv", tvId),
    enabled: !!tvId,
  });

  const { data: episodes } = useQuery({
    queryKey: ["episodes", tvId, selectedSeason],
    queryFn: () => getSeasonDetails(tvId, selectedSeason),
    enabled: !!tvId && selectedSeason > 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">TV Show not found</p>
      </div>
    );
  }

  const year = (show.first_air_date || "").split("-")[0];
  const seasons = show.seasons?.filter((s) => s.season_number > 0) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <img
          src={getBackdropUrl(show.backdrop_path)}
          alt={show.name}
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
                src={getImageUrl(show.poster_path, "w500")}
                alt={show.name}
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
              <h1 className="text-3xl md:text-5xl font-bold">{show.name}</h1>

              {show.tagline && (
                <p className="text-muted-foreground italic">{show.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {show.vote_average.toFixed(1)}
                </span>
                {year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {year}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Tv className="w-4 h-4" />
                  {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {show.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-muted-foreground max-w-2xl">{show.overview}</p>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button asChild size="lg" className="gap-2 glow-shadow">
                  <Link to={`/tv/${tvId}/watch/1/1`}>
                    <Play className="w-5 h-5 fill-current" />
                    Watch S1 E1
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
                <WatchlistButton item={show} mediaType="tv" variant="full" />
              </div>
            </motion.div>
          </div>

          {/* Episodes Section */}
          {seasons.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Episodes</h2>
                <Select
                  value={selectedSeason.toString()}
                  onValueChange={(v) => setSelectedSeason(parseInt(v))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem
                        key={season.season_number}
                        value={season.season_number.toString()}
                      >
                        Season {season.season_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {episodes?.map((episode) => (
                  <Link
                    key={episode.id}
                    to={`/tv/${tvId}/watch/${selectedSeason}/${episode.episode_number}`}
                    className="flex gap-4 p-4 bg-card rounded-lg hover:bg-secondary transition-colors group"
                  >
                    <div className="relative flex-shrink-0 w-40 aspect-video rounded overflow-hidden">
                      <img
                        src={getImageUrl(episode.still_path, "w300")}
                        alt={episode.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-primary fill-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {episode.episode_number}. {episode.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {episode.overview}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {episode.runtime && <span>{episode.runtime} min</span>}
                        {episode.vote_average > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {episode.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cast */}
          {credits && credits.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
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
              <MediaRow title="Similar TV Shows" items={similar} />
            </div>
          )}
        </div>
      </div>

      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        mediaType="tv"
        mediaId={tvId}
        title={show.name || ""}
      />
    </div>
  );
};

export default TVDetails;
