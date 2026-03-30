import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import LayoutHeroBanner from "@/components/layouts/LayoutHeroBanner";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { getPopular, getTopRated, getNowPlaying, getUpcoming, getGenres, getByGenre, Movie } from "@/lib/tmdb";
import { useLanguage } from "@/hooks/useLanguage";

const Movies = () => {
  const { t } = useLanguage();
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  const { data: popular, isLoading: popularLoading } = useQuery({
    queryKey: ["popular", "movie"],
    queryFn: () => getPopular("movie"),
  });

  const { data: topRated, isLoading: topRatedLoading } = useQuery({
    queryKey: ["topRated", "movie"],
    queryFn: () => getTopRated("movie"),
  });

  const { data: nowPlaying, isLoading: nowPlayingLoading } = useQuery({
    queryKey: ["nowPlaying"],
    queryFn: getNowPlaying,
  });

  const { data: upcoming, isLoading: upcomingLoading } = useQuery({
    queryKey: ["upcoming"],
    queryFn: getUpcoming,
  });

  const { data: genres } = useQuery({
    queryKey: ["genres", "movie"],
    queryFn: () => getGenres("movie"),
  });

  const { data: genreResults } = useQuery({
    queryKey: ["genreMovies", selectedGenre],
    queryFn: () => getByGenre("movie", selectedGenre!, 1),
    enabled: !!selectedGenre,
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Banner */}
        {popular && popular.length > 0 && (
          <div className="min-h-[40vh] sm:min-h-[50vh]">
            <LayoutHeroBanner items={popular.slice(0, 5)} />
          </div>
        )}

        <div className="relative z-10 -mt-12 sm:-mt-16">
          <div className="container mx-auto px-4 space-y-8 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="page-header"
            >
              <h1 className="text-3xl md:text-4xl font-bold">{t("movies")}</h1>
            </motion.div>

            {/* Genre Quick Chips */}
            {genres && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-2"
              >
                <Button
                  variant={selectedGenre === null ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full text-xs btn-ripple"
                  onClick={() => setSelectedGenre(null)}
                >
                  {t("all")}
                </Button>
                {genres.slice(0, 12).map((genre) => (
                  <Button
                    key={genre.id}
                    variant={selectedGenre === genre.id ? "default" : "secondary"}
                    size="sm"
                    className="rounded-full text-xs btn-ripple"
                    onClick={() => setSelectedGenre(genre.id)}
                  >
                    {genre.name}
                  </Button>
                ))}
              </motion.div>
            )}

            {/* Genre Results */}
            {selectedGenre && genreResults && (
              <MediaRow
                title={genres?.find((g) => g.id === selectedGenre)?.name || t("filter")}
                items={(genreResults.results || []).map((r: Movie) => ({ ...r, media_type: "movie" as const }))}
              />
            )}

            {!selectedGenre && (
              <>
                <MediaRow title={t("nowPlaying")} items={nowPlaying || []} isLoading={nowPlayingLoading} />
                <MediaRow title={t("popularMovies")} items={popular || []} isLoading={popularLoading} />
                <MediaRow title={t("topRated")} items={upcoming || []} isLoading={upcomingLoading} />
                <MediaRow title={t("topRated")} items={topRated || []} isLoading={topRatedLoading} />
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Movies;
