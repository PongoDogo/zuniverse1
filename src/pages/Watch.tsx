import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Share2, Heart, Pin, Star, Calendar, Clock, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import MediaRow from "@/components/MediaRow";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDetails, getSeasonDetails, getSimilar, getImageUrl } from "@/lib/tmdb";
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/watchlist";
import { isPinned, pinItem, unpinItem } from "@/lib/userPreferences";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

const Watch = () => {
  const { type, id, season, episode } = useParams<{
    type: string;
    id: string;
    season?: string;
    episode?: string;
  }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const mediaType = type as "movie" | "tv";
  const mediaId = parseInt(id || "0");
  const currentSeason = parseInt(season || "1");
  const currentEpisode = parseInt(episode || "1");

  const { data: details } = useQuery({
    queryKey: [mediaType, mediaId],
    queryFn: () => getDetails(mediaType, mediaId),
    enabled: !!mediaId,
  });

  const { data: episodes } = useQuery({
    queryKey: ["episodes", mediaId, currentSeason],
    queryFn: () => getSeasonDetails(mediaId, currentSeason),
    enabled: !!mediaId && mediaType === "tv",
  });

  const { data: similar } = useQuery({
    queryKey: ["similar", mediaType, mediaId],
    queryFn: () => getSimilar(mediaType, mediaId),
    enabled: !!mediaId,
  });

  const title = details?.title || details?.name || "Loading...";
  const seasons = details?.seasons?.filter((s) => s.season_number > 0) || [];
  const year = (details?.release_date || details?.first_air_date || "").split("-")[0];

  const currentEpisodeData = episodes?.find(
    (ep) => ep.episode_number === currentEpisode
  );

  const hasPrevEpisode = currentEpisode > 1;
  const hasNextEpisode = episodes && currentEpisode < episodes.length;

  const inWatchlist = details ? isInWatchlist(mediaId, mediaType) : false;
  const itemPinned = details ? isPinned(mediaId, mediaType) : false;

  const goToEpisode = (ep: number) => {
    navigate(`/tv/${mediaId}/watch/${currentSeason}/${ep}`);
  };

  const goToSeason = (s: number) => {
    navigate(`/tv/${mediaId}/watch/${s}/1`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Watch ${title} on CineTorrio`,
          url: url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(language === "el" ? "Ο σύνδεσμος αντιγράφηκε!" : "Link copied to clipboard!");
    }
  };

  const handleWatchlistToggle = () => {
    if (!details) return;
    if (inWatchlist) {
      removeFromWatchlist(mediaId, mediaType);
      toast.success(language === "el" ? "Αφαιρέθηκε από τη λίστα" : "Removed from watchlist");
    } else {
      addToWatchlist(details, mediaType);
      toast.success(language === "el" ? "Προστέθηκε στη λίστα" : "Added to watchlist");
    }
  };

  const handlePinToggle = () => {
    if (!details) return;
    if (itemPinned) {
      unpinItem(mediaId, mediaType);
      toast.success(language === "el" ? "Ξεκαρφιτσώθηκε" : "Unpinned");
    } else {
      pinItem({
        id: mediaId,
        mediaType,
        title,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
      });
      toast.success(language === "el" ? "Καρφιτσώθηκε" : "Pinned to home");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16 sm:pt-20 pb-8 sm:pb-16 safe-bottom">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          
          {/* Top Navigation Bar */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4 sm:mb-6 p-3 sm:p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50"
          >
            <Link
              to={`/${mediaType}/${mediaId}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{t("backToDetails")}</span>
            </Link>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                variant={inWatchlist ? "default" : "ghost"}
                size="sm" 
                onClick={handleWatchlistToggle}
                className="gap-1.5"
              >
                <Heart className={`w-4 h-4 ${inWatchlist ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">{inWatchlist ? t("removeFromWatchlist").split(" ")[0] : t("addToWatchlist").split(" ")[0]}</span>
              </Button>
              <Button 
                variant={itemPinned ? "default" : "ghost"}
                size="sm" 
                onClick={handlePinToggle}
                className="gap-1.5"
              >
                <Pin className={`w-4 h-4 ${itemPinned ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1.5">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t("share")}</span>
              </Button>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-[1fr,320px] gap-6">
            
            {/* Left Column - Video Player & Episodes */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* Title & Meta */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {mediaType === "tv" && currentEpisodeData && (
                    <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-md font-medium">
                      S{currentSeason} E{currentEpisode}
                    </span>
                  )}
                  {details?.vote_average && details.vote_average > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {details.vote_average.toFixed(1)}
                    </span>
                  )}
                  {year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {year}
                    </span>
                  )}
                  {details?.runtime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                    </span>
                  )}
                </div>
                {mediaType === "tv" && currentEpisodeData && (
                  <p className="text-muted-foreground mt-2 font-medium">
                    {currentEpisodeData.name}
                  </p>
                )}
              </motion.div>

              {/* Video Player */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl overflow-hidden shadow-2xl"
              >
                <VideoPlayer
                  tmdbId={mediaId}
                  mediaType={mediaType}
                  season={mediaType === "tv" ? currentSeason : undefined}
                  episode={mediaType === "tv" ? currentEpisode : undefined}
                  title={title}
                  posterPath={details?.poster_path}
                  backdropPath={details?.backdrop_path}
                  episodeName={currentEpisodeData?.name}
                />
              </motion.div>

              {/* TV Show Controls */}
              {mediaType === "tv" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  {/* Navigation Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-card rounded-xl border border-border/50">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Select
                        value={currentSeason.toString()}
                        onValueChange={(v) => goToSeason(parseInt(v))}
                      >
                        <SelectTrigger className="w-full sm:w-32 h-10">
                          <SelectValue placeholder="Season" />
                        </SelectTrigger>
                        <SelectContent>
                          {seasons.map((s) => (
                            <SelectItem key={s.season_number} value={s.season_number.toString()}>
                              {language === "el" ? `Σεζόν ${s.season_number}` : `Season ${s.season_number}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {episodes && (
                        <Select
                          value={currentEpisode.toString()}
                          onValueChange={(v) => goToEpisode(parseInt(v))}
                        >
                          <SelectTrigger className="w-full sm:w-44 h-10">
                            <SelectValue placeholder="Episode" />
                          </SelectTrigger>
                          <SelectContent>
                            {episodes.map((ep) => (
                              <SelectItem
                                key={ep.episode_number}
                                value={ep.episode_number.toString()}
                              >
                                E{ep.episode_number}: {ep.name?.slice(0, 20)}...
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Prev/Next Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="default"
                        disabled={!hasPrevEpisode}
                        onClick={() => goToEpisode(currentEpisode - 1)}
                        className="flex-1 sm:flex-initial h-10"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {language === "el" ? "Προηγ." : "Prev"}
                      </Button>
                      <Button
                        variant="default"
                        size="default"
                        disabled={!hasNextEpisode}
                        onClick={() => goToEpisode(currentEpisode + 1)}
                        className="flex-1 sm:flex-initial h-10 glow-shadow"
                      >
                        {language === "el" ? "Επόμ." : "Next"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  {/* Episode Quick Grid */}
                  {episodes && episodes.length > 0 && (
                    <div className="p-4 bg-card rounded-xl border border-border/50">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">
                        {language === "el" ? "Επεισόδια" : "Episodes"}
                      </h3>
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                        {episodes.map((ep) => (
                          <button
                            key={ep.episode_number}
                            onClick={() => goToEpisode(ep.episode_number)}
                            className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                              ep.episode_number === currentEpisode
                                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                : "bg-secondary hover:bg-secondary/80 hover:scale-105"
                            }`}
                          >
                            {ep.episode_number}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Episode/Movie Description */}
              {(currentEpisodeData?.overview || details?.overview) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="p-5 bg-card rounded-xl border border-border/50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">
                      {mediaType === "tv" && currentEpisodeData?.overview 
                        ? (language === "el" ? "Περίληψη Επεισοδίου" : "Episode Synopsis")
                        : (language === "el" ? "Περιγραφή" : "Overview")}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentEpisodeData?.overview || details?.overview}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right Column - Info Panel */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="hidden lg:block space-y-4"
            >
              {/* Poster & Quick Info */}
              <div className="p-4 bg-card rounded-xl border border-border/50">
                <img
                  src={getImageUrl(details?.poster_path, "w500")}
                  alt={title}
                  className="w-full rounded-lg shadow-lg mb-4"
                />
                
                {/* Genres */}
                {details?.genres && details.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {details.genres.slice(0, 4).map((genre) => (
                      <span
                        key={genre.id}
                        className="px-2 py-0.5 bg-secondary text-xs rounded-full"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Details Link */}
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/${mediaType}/${mediaId}`}>
                    <Info className="w-4 h-4 mr-2" />
                    {language === "el" ? "Πλήρεις Πληροφορίες" : "Full Details"}
                  </Link>
                </Button>
              </div>

              {/* Season Info for TV */}
              {mediaType === "tv" && seasons.length > 0 && (
                <div className="p-4 bg-card rounded-xl border border-border/50">
                  <h3 className="font-semibold mb-3 text-sm">
                    {language === "el" ? "Σεζόν" : "Season"} {currentSeason}
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{episodes?.length || 0} {language === "el" ? "επεισόδια" : "episodes"}</p>
                    <p>{language === "el" ? "Τρέχον:" : "Current:"} E{currentEpisode}</p>
                  </div>
                </div>
              )}
            </motion.aside>
          </div>

          {/* Similar Content */}
          {similar && similar.length > 0 && (
            <div className="mt-10 sm:mt-14">
              <MediaRow
                title={language === "el" 
                  ? `Παρόμοιες ${mediaType === "tv" ? "Σειρές" : "Ταινίες"}` 
                  : `More ${mediaType === "tv" ? "TV Shows" : "Movies"} Like This`}
                items={similar}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watch;
