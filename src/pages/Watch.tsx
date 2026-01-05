import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
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
import { getDetails, getSeasonDetails, getSimilar } from "@/lib/tmdb";
import { toast } from "sonner";

const Watch = () => {
  const { type, id, season, episode } = useParams<{
    type: string;
    id: string;
    season?: string;
    episode?: string;
  }>();
  const navigate = useNavigate();

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

  const currentEpisodeData = episodes?.find(
    (ep) => ep.episode_number === currentEpisode
  );

  const hasPrevEpisode = currentEpisode > 1;
  const hasNextEpisode = episodes && currentEpisode < episodes.length;

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
          text: `Watch ${title} on Zuniverse`,
          url: url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16 sm:pt-20 pb-8 sm:pb-16 safe-bottom">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Back Link & Share */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Link
              to={`/${mediaType}/${mediaId}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to details</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 sm:mb-4"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold line-clamp-1">{title}</h1>
            {mediaType === "tv" && currentEpisodeData && (
              <p className="text-sm text-muted-foreground mt-1">
                S{currentSeason}:E{currentEpisode} - {currentEpisodeData.name}
              </p>
            )}
          </motion.div>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
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
              className="mt-4 sm:mt-6 space-y-4"
            >
              {/* Season/Episode Selectors */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <Select
                    value={currentSeason.toString()}
                    onValueChange={(v) => goToSeason(parseInt(v))}
                  >
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Season" />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((s) => (
                        <SelectItem key={s.season_number} value={s.season_number.toString()}>
                          Season {s.season_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {episodes && (
                    <Select
                      value={currentEpisode.toString()}
                      onValueChange={(v) => goToEpisode(parseInt(v))}
                    >
                      <SelectTrigger className="w-full sm:w-44">
                        <SelectValue placeholder="Episode" />
                      </SelectTrigger>
                      <SelectContent>
                        {episodes.map((ep) => (
                          <SelectItem
                            key={ep.episode_number}
                            value={ep.episode_number.toString()}
                          >
                            Ep {ep.episode_number}: {ep.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!hasPrevEpisode}
                    onClick={() => goToEpisode(currentEpisode - 1)}
                    className="flex-1 sm:flex-initial"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!hasNextEpisode}
                    onClick={() => goToEpisode(currentEpisode + 1)}
                    className="flex-1 sm:flex-initial"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Episode Description */}
          {currentEpisodeData?.overview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 sm:mt-6 p-3 sm:p-4 bg-card rounded-lg"
            >
              <h3 className="font-medium mb-2 text-sm sm:text-base">Episode Synopsis</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {currentEpisodeData.overview}
              </p>
            </motion.div>
          )}

          {/* Similar Content */}
          {similar && similar.length > 0 && (
            <div className="mt-8 sm:mt-12">
              <MediaRow
                title={`More ${mediaType === "tv" ? "TV Shows" : "Movies"} Like This`}
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
