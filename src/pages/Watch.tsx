import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <Link
            to={`/${mediaType}/${mediaId}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to details
          </Link>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            {mediaType === "tv" && currentEpisodeData && (
              <p className="text-muted-foreground mt-1">
                Season {currentSeason}, Episode {currentEpisode}:{" "}
                {currentEpisodeData.name}
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
              className="mt-6 flex flex-wrap items-center justify-between gap-4"
            >
              {/* Season/Episode Selectors */}
              <div className="flex items-center gap-4">
                <Select
                  value={currentSeason.toString()}
                  onValueChange={(v) => goToSeason(parseInt(v))}
                >
                  <SelectTrigger className="w-36">
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
                    <SelectTrigger className="w-48">
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
                  disabled={!hasPrevEpisode}
                  onClick={() => goToEpisode(currentEpisode - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={!hasNextEpisode}
                  onClick={() => goToEpisode(currentEpisode + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Episode Description */}
          {currentEpisodeData?.overview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-card rounded-lg"
            >
              <h3 className="font-medium mb-2">Episode Synopsis</h3>
              <p className="text-muted-foreground text-sm">
                {currentEpisodeData.overview}
              </p>
            </motion.div>
          )}

          {/* Similar Content */}
          {similar && similar.length > 0 && (
            <div className="mt-12">
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
