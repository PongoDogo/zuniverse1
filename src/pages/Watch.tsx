import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Share2, Heart, Pin, Star, 
  Calendar, Clock, Info, ToggleLeft, ToggleRight, Play, Film, Tv,
  Layers, Eye, ExternalLink
} from "lucide-react";
import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import AutoPlayCountdown from "@/components/AutoPlayCountdown";
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

const AUTO_PLAY_KEY = "cinetorrio_autoplay";

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

  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
    try { return localStorage.getItem(AUTO_PLAY_KEY) !== "false"; } catch { return true; }
  });
  const [showCountdown, setShowCountdown] = useState(false);

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
  const seasons = details?.seasons?.filter((s: any) => s.season_number > 0) || [];
  const year = (details?.release_date || details?.first_air_date || "").split("-")[0];

  const currentEpisodeData = episodes?.find(
    (ep: any) => ep.episode_number === currentEpisode
  );

  const hasPrevEpisode = currentEpisode > 1;
  const hasNextEpisode = episodes && currentEpisode < episodes.length;
  const nextEpisodeData = hasNextEpisode ? episodes?.find((ep: any) => ep.episode_number === currentEpisode + 1) : null;

  const inWatchlist = details ? isInWatchlist(mediaId, mediaType) : false;
  const itemPinned = details ? isPinned(mediaId, mediaType) : false;

  const goToEpisode = useCallback((ep: number) => {
    setShowCountdown(false);
    navigate(`/tv/${mediaId}/watch/${currentSeason}/${ep}`);
  }, [navigate, mediaId, currentSeason]);

  const goToSeason = (s: number) => {
    navigate(`/tv/${mediaId}/watch/${s}/1`);
  };

  const handleAutoPlayToggle = () => {
    const newVal = !autoPlayEnabled;
    setAutoPlayEnabled(newVal);
    localStorage.setItem(AUTO_PLAY_KEY, newVal.toString());
    toast.success(
      newVal
        ? (language === "el" ? "Αυτόματη αναπαραγωγή ενεργή" : "Auto-play enabled")
        : (language === "el" ? "Αυτόματη αναπαραγωγή απενεργοποιημένη" : "Auto-play disabled")
    );
  };

  const handleRequestNextEpisode = useCallback(() => {
    if (hasNextEpisode) {
      if (autoPlayEnabled) {
        setShowCountdown(true);
      } else {
        goToEpisode(currentEpisode + 1);
      }
    }
  }, [hasNextEpisode, autoPlayEnabled, goToEpisode, currentEpisode]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Watch ${title} on CineTorrio`, url });
      } catch {}
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

  const backdropUrl = details?.backdrop_path ? getImageUrl(details.backdrop_path, "w780") : null;
  const progressPercent = episodes?.length ? Math.round((currentEpisode / episodes.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      {/* Cinematic Backdrop - no blur, just opacity */}
      {backdropUrl && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            src={backdropUrl} 
            alt="" 
            className="w-full h-full object-cover opacity-[0.07]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>
      )}

      <div className="relative z-10 pt-16 sm:pt-20 pb-8 sm:pb-16 safe-bottom">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          
          {/* Top Cinema Bar - CSS only, no motion */}
          <div className="flex items-center justify-between mb-5 sm:mb-6 p-3 sm:p-4 rounded-2xl border border-border/30 performance-surface shadow-lg shadow-black/5 performance-page-enter">
            <Link
              to={`/${mediaType}/${mediaId}`}
              className="inline-flex items-center gap-2.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 group"
            >
              <div className="p-1.5 rounded-lg bg-secondary/80 group-hover:bg-primary/20 transition-colors">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="hidden sm:inline">{t("backToDetails")}</span>
            </Link>
            
            {/* Center: Now Playing indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="font-medium text-foreground/70">
                  {language === "el" ? "Παίζει τώρα" : "Now Playing"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-1.5">
              {mediaType === "tv" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoPlayToggle}
                  className={`gap-1.5 text-xs rounded-xl ${autoPlayEnabled ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                >
                  {autoPlayEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  <span className="hidden sm:inline">{t("autoPlay")}</span>
                </Button>
              )}
              <Button 
                variant="ghost"
                size="sm" 
                onClick={handleWatchlistToggle}
                className={`gap-1.5 rounded-xl ${inWatchlist ? "text-red-400 bg-red-500/10" : ""}`}
              >
                <Heart className={`w-4 h-4 ${inWatchlist ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">{inWatchlist ? (language === "el" ? "Αφαίρεση" : "Remove") : (language === "el" ? "Λίστα" : "Save")}</span>
              </Button>
              <Button 
                variant="ghost"
                size="sm" 
                onClick={handlePinToggle}
                className={`rounded-xl ${itemPinned ? "text-primary bg-primary/10" : ""}`}
              >
                <Pin className={`w-4 h-4 ${itemPinned ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1.5 rounded-xl">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-[1fr,340px] gap-5 lg:gap-6">
            
            {/* Left Column */}
            <div className="space-y-5">
              
              {/* Title & Meta Hero */}
              <div className="space-y-3 performance-page-enter">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-1">
                    {mediaType === "tv" ? <Tv className="w-5 h-5" /> : <Film className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">{title}</h1>
                    <div className="flex flex-wrap items-center gap-2.5 mt-2 text-sm text-muted-foreground">
                      {mediaType === "tv" && currentEpisodeData && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/15 text-primary rounded-lg font-semibold text-xs tracking-wide">
                          <Layers className="w-3 h-3" />
                          S{currentSeason} E{currentEpisode}
                        </span>
                      )}
                      {details?.vote_average && details.vote_average > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          {details.vote_average.toFixed(1)}
                        </span>
                      )}
                      {year && (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3" />
                          {year}
                        </span>
                      )}
                      {details?.runtime && (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3" />
                          {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {mediaType === "tv" && currentEpisodeData && (
                  <p className="text-muted-foreground font-medium pl-[52px] text-sm">
                    "{currentEpisodeData.name}"
                  </p>
                )}
              </div>

              {/* Video Player - no glow ring (causes repaint), no motion wrapper */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden border border-border/30 shadow-2xl shadow-black/20 bg-black">
                  <VideoPlayer
                    tmdbId={mediaId}
                    mediaType={mediaType}
                    season={mediaType === "tv" ? currentSeason : undefined}
                    episode={mediaType === "tv" ? currentEpisode : undefined}
                    title={title}
                    posterPath={details?.poster_path}
                    backdropPath={details?.backdrop_path}
                    episodeName={currentEpisodeData?.name}
                    onRequestNextEpisode={hasNextEpisode ? handleRequestNextEpisode : undefined}
                  />
                </div>
              </div>

              {/* Auto-play countdown */}
              {showCountdown && hasNextEpisode && (
                <AutoPlayCountdown
                  seconds={10}
                  onComplete={() => goToEpisode(currentEpisode + 1)}
                  onCancel={() => setShowCountdown(false)}
                  nextEpisodeName={nextEpisodeData?.name}
                />
              )}

              {/* TV Show Controls */}
              {mediaType === "tv" && (
                <div className="space-y-4 performance-page-enter">
                  {/* Navigation Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-border/30 performance-surface">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Select
                        value={currentSeason.toString()}
                        onValueChange={(v) => goToSeason(parseInt(v))}
                      >
                        <SelectTrigger className="w-full sm:w-36 h-10 rounded-xl bg-secondary/50 border-border/30">
                          <SelectValue placeholder="Season" />
                        </SelectTrigger>
                        <SelectContent>
                          {seasons.map((s: any) => (
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
                          <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl bg-secondary/50 border-border/30">
                            <SelectValue placeholder="Episode" />
                          </SelectTrigger>
                          <SelectContent>
                            {episodes.map((ep: any) => (
                              <SelectItem
                                key={ep.episode_number}
                                value={ep.episode_number.toString()}
                              >
                                E{ep.episode_number}: {ep.name?.slice(0, 22)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="default"
                        disabled={!hasPrevEpisode}
                        onClick={() => goToEpisode(currentEpisode - 1)}
                        className="flex-1 sm:flex-initial h-10 rounded-xl"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {language === "el" ? "Προηγ." : "Prev"}
                      </Button>
                      <Button
                        variant="default"
                        size="default"
                        disabled={!hasNextEpisode}
                        onClick={() => goToEpisode(currentEpisode + 1)}
                        className="flex-1 sm:flex-initial h-10 rounded-xl"
                      >
                        {language === "el" ? "Επόμ." : "Next"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  {/* Episode Grid */}
                  {episodes && episodes.length > 0 && (
                    <div className="p-4 rounded-2xl border border-border/30 performance-surface">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Eye className="w-4 h-4 text-primary" />
                          {language === "el" ? "Επεισόδια" : "Episodes"}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {currentEpisode}/{episodes.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                        {episodes.map((ep: any) => {
                          const isCurrent = ep.episode_number === currentEpisode;
                          return (
                            <button
                              key={ep.episode_number}
                              onClick={() => goToEpisode(ep.episode_number)}
                              title={ep.name}
                              className={`relative aspect-square rounded-xl text-sm font-bold transition-all duration-200 overflow-hidden ${
                                isCurrent
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110 ring-2 ring-primary/50"
                                  : "bg-secondary/60 hover:bg-secondary hover:scale-105"
                              }`}
                            >
                              {ep.still_path ? (
                                <>
                                  <img
                                    src={getImageUrl(ep.still_path, "w200")}
                                    alt={ep.name}
                                    className={`absolute inset-0 w-full h-full object-cover ${isCurrent ? "opacity-30" : "opacity-20"}`}
                                    loading="lazy"
                                  />
                                  <span className="relative z-10">{ep.episode_number}</span>
                                </>
                              ) : (
                                <span className="flex items-center justify-center h-full">{ep.episode_number}</span>
                              )}
                              {isCurrent && (
                                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary-foreground/70" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Synopsis Panel */}
              {(currentEpisodeData?.overview || details?.overview) && (
                <div className="p-5 rounded-2xl border border-border/30 performance-surface performance-page-enter">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Info className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">
                      {mediaType === "tv" && currentEpisodeData?.overview 
                        ? (language === "el" ? "Περίληψη Επεισοδίου" : "Episode Synopsis")
                        : (language === "el" ? "Περιγραφή" : "Overview")}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {currentEpisodeData?.overview || details?.overview}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Info Panel */}
            <aside className="hidden lg:flex flex-col gap-4 performance-page-enter">
              {/* Poster Card */}
              <div className="relative rounded-2xl overflow-hidden border border-border/30 performance-surface">
                <div className="p-4">
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={getImageUrl(details?.poster_path, "w342")}
                      alt={title}
                      className="w-full rounded-xl shadow-lg"
                      loading="lazy"
                    />
                  </div>
                  
                  {details?.genres && details.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {details.genres.slice(0, 4).map((genre: any) => (
                        <span
                          key={genre.id}
                          className="px-2.5 py-1 bg-secondary/60 text-xs rounded-lg font-medium"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <Button asChild variant="outline" className="w-full mt-4 rounded-xl h-10 gap-2">
                    <Link to={`/${mediaType}/${mediaId}`}>
                      <ExternalLink className="w-4 h-4" />
                      {language === "el" ? "Πλήρεις Πληροφορίες" : "Full Details"}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Season Info Card */}
              {mediaType === "tv" && seasons.length > 0 && (
                <div className="p-4 rounded-2xl border border-border/30 performance-surface">
                  <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    {language === "el" ? "Σεζόν" : "Season"} {currentSeason}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{language === "el" ? "Επεισόδια" : "Episodes"}</span>
                      <span className="font-medium">{episodes?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{language === "el" ? "Τρέχον" : "Current"}</span>
                      <span className="font-medium">E{currentEpisode}</span>
                    </div>
                    {episodes?.length && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <span>{language === "el" ? "Πρόοδος" : "Progress"}</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-[width] duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {autoPlayEnabled && (
                      <div className="flex items-center gap-1.5 text-xs text-primary mt-2 pt-2 border-t border-border/30">
                        <Play className="w-3 h-3 fill-current" />
                        {t("autoPlay")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Seasons Switcher */}
              {mediaType === "tv" && seasons.length > 1 && (
                <div className="p-4 rounded-2xl border border-border/30 performance-surface">
                  <h3 className="font-semibold mb-3 text-sm">
                    {language === "el" ? "Αλλαγή Σεζόν" : "Switch Season"}
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5">
                    {seasons.slice(0, 12).map((s: any) => (
                      <button
                        key={s.season_number}
                        onClick={() => goToSeason(s.season_number)}
                        className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                          s.season_number === currentSeason
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        S{s.season_number}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* Similar Content */}
          {similar && similar.length > 0 && (
            <div className="mt-10 sm:mt-14 performance-page-enter">
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
