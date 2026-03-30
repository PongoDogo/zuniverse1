import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import LayoutHeroBanner from "@/components/layouts/LayoutHeroBanner";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { getPopular, getTopRated, getOnTheAir, getTrending, getGenres, getByGenre, Movie } from "@/lib/tmdb";
import { useLanguage } from "@/hooks/useLanguage";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || "b2ec786f995dcde6d8d264ecd3cd91e9";

const getAiringToday = async () => {
  const res = await fetch(`https://api.themoviedb.org/3/tv/airing_today?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results as Movie[];
};

const TVShows = () => {
  const { t } = useLanguage();
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending", "tv"],
    queryFn: () => getTrending("tv", "week"),
  });

  const { data: popular, isLoading: popularLoading } = useQuery({
    queryKey: ["popular", "tv"],
    queryFn: () => getPopular("tv"),
  });

  const { data: topRated, isLoading: topRatedLoading } = useQuery({
    queryKey: ["topRated", "tv"],
    queryFn: () => getTopRated("tv"),
  });

  const { data: onTheAir, isLoading: onTheAirLoading } = useQuery({
    queryKey: ["onTheAir"],
    queryFn: getOnTheAir,
  });

  const { data: airingToday, isLoading: airingTodayLoading } = useQuery({
    queryKey: ["airingToday"],
    queryFn: getAiringToday,
  });

  const { data: genres } = useQuery({
    queryKey: ["genres", "tv"],
    queryFn: () => getGenres("tv"),
  });

  const { data: genreResults } = useQuery({
    queryKey: ["genreTV", selectedGenre],
    queryFn: () => getByGenre("tv", selectedGenre!, 1),
    enabled: !!selectedGenre,
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Banner */}
        {trending && trending.length > 0 && (
          <div className="min-h-[40vh] sm:min-h-[50vh]">
            <LayoutHeroBanner items={trending.slice(0, 5)} />
          </div>
        )}

        <div className="relative z-10 -mt-12 sm:-mt-16">
          <div className="container mx-auto px-4 space-y-8 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="page-header"
            >
              <h1 className="text-3xl md:text-4xl font-bold">{t("tvShows")}</h1>
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
                items={(genreResults.results || []).map((r: Movie) => ({ ...r, media_type: "tv" as const }))}
              />
            )}

            {!selectedGenre && (
              <>
                <MediaRow
                  title={t("onTheAir")}
                  items={airingToday || []}
                  isLoading={airingTodayLoading}
                />
                <MediaRow title={t("trendingNow")} items={trending || []} isLoading={trendingLoading} />
                <MediaRow title={t("onTheAir")} items={onTheAir || []} isLoading={onTheAirLoading} />
                <MediaRow title={t("popularTVShows")} items={popular || []} isLoading={popularLoading} />
                <MediaRow title={t("topRated")} items={topRated || []} isLoading={topRatedLoading} />
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TVShows;
