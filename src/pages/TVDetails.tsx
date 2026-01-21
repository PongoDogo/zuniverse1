import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Star, Calendar, ArrowLeft, Tv, PlayCircle, Share2, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import WatchlistButton from "@/components/WatchlistButton";
import MarkAsWatchedButton from "@/components/MarkAsWatchedButton";
import PinButton from "@/components/PinButton";
import TrailerModal from "@/components/TrailerModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

const TVDetails = () => {
  const { id } = useParams<{ id: string }>();
  const tvId = parseInt(id || "0");
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showTrailer, setShowTrailer] = useState(false);
  const { t, language } = useLanguage();

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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: show?.name || "TV Show",
          text: `Check out ${show?.name} on CineTorrio`,
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

  if (!show) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{language === "el" ? "Η σειρά δεν βρέθηκε" : "TV Show not found"}</p>
      </div>
    );
  }

  const year = (show.first_air_date || "").split("-")[0];
  const seasons = show.seasons?.filter((s) => s.season_number > 0) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[65vh] md:h-[75vh]">
        <img
          src={getBackdropUrl(show.backdrop_path)}
          alt={show.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute bottom-0 left-0 right-0 h-64 fade-up-gradient" />
        
        {/* Back Button */}
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

      {/* Content */}
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
                src={getImageUrl(show.poster_path, "w500")}
                alt={show.name}
                className="w-48 lg:w-full rounded-xl shadow-2xl mx-auto lg:mx-0"
              />
              
              {/* Stats Card - Desktop */}
              <div className="hidden lg:block mt-6 p-4 bg-card rounded-xl border border-border/50">
                <h3 className="font-semibold mb-3 text-sm">{language === "el" ? "Πληροφορίες" : "Details"}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "el" ? "Πρεμιέρα" : "First Air"}</span>
                    <span>{show.first_air_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "el" ? "Σεζόν" : "Seasons"}</span>
                    <span>{show.number_of_seasons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "el" ? "Επεισόδια" : "Episodes"}</span>
                    <span>{show.number_of_episodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "el" ? "Βαθμολογία" : "Rating"}</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      {show.vote_average.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "el" ? "Κατάσταση" : "Status"}</span>
                    <Badge variant={show.status === "Ended" ? "secondary" : "default"} className="text-xs">
                      {show.status}
                    </Badge>
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
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{show.name}</h1>
                {show.tagline && (
                  <p className="text-muted-foreground italic text-lg">"{show.tagline}"</p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                <Badge variant="secondary" className="gap-1 px-3 py-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  {show.vote_average.toFixed(1)}
                </Badge>
                {year && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {year}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Tv className="w-4 h-4" />
                  {show.number_of_seasons} {language === "el" ? "Σεζόν" : "Season"}{show.number_of_seasons !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {show.genres?.map((genre) => (
                  <Badge key={genre.id} variant="outline" className="px-3 py-1">
                    {genre.name}
                  </Badge>
                ))}
              </div>

              {/* Overview */}
              <p className="text-muted-foreground leading-relaxed max-w-3xl">
                {show.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg" className="gap-2 glow-shadow h-12 px-6">
                  <Link to={`/tv/${tvId}/watch/1/1`}>
                    <Play className="w-5 h-5 fill-current" />
                    {language === "el" ? "Παρακολούθηση S1 E1" : "Watch S1 E1"}
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
                <WatchlistButton item={show} mediaType="tv" variant="full" />
                <MarkAsWatchedButton item={show} mediaType="tv" variant="full" />
                <PinButton item={show} mediaType="tv" />
                <Button variant="ghost" size="icon" onClick={handleShare} className="h-12 w-12">
                  <Share2 className="w-5 h-5" />
                </Button>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <h2 className="text-xl font-bold">{language === "el" ? "Επεισόδια" : "Episodes"}</h2>
                <Select
                  value={selectedSeason.toString()}
                  onValueChange={(v) => setSelectedSeason(parseInt(v))}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem
                        key={season.season_number}
                        value={season.season_number.toString()}
                      >
                        {language === "el" ? "Σεζόν" : "Season"} {season.season_number} ({season.episode_count} {language === "el" ? "επ." : "ep"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                {episodes?.map((episode) => (
                  <Link
                    key={episode.id}
                    to={`/tv/${tvId}/watch/${selectedSeason}/${episode.episode_number}`}
                    className="flex gap-4 p-4 bg-card rounded-xl hover:bg-secondary/80 transition-all group border border-border/50 hover:border-primary/30"
                  >
                    <div className="relative flex-shrink-0 w-36 sm:w-44 aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={getImageUrl(episode.still_path, "w300")}
                        alt={episode.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-10 h-10 text-primary fill-primary" />
                      </div>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white font-medium">
                        E{episode.episode_number}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                        {episode.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                        {episode.overview || (language === "el" ? "Δεν υπάρχει περιγραφή" : "No description available")}
                      </p>
                      <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground">
                        {episode.runtime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {episode.runtime} min
                          </span>
                        )}
                        {episode.vote_average > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            {episode.vote_average.toFixed(1)}
                          </span>
                        )}
                        {episode.air_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(episode.air_date).toLocaleDateString()}
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

          {/* Similar Shows */}
          {similar && similar.length > 0 && (
            <div className="mt-12">
              <MediaRow 
                title={language === "el" ? "Παρόμοιες Σειρές" : "Similar TV Shows"} 
                items={similar} 
              />
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
