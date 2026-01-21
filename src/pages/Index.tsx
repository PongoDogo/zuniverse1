import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import LayoutHeroBanner from "@/components/layouts/LayoutHeroBanner";
import MediaRow from "@/components/MediaRow";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import PinnedFavorites from "@/components/PinnedFavorites";
import ScrollToTop from "@/components/ScrollToTop";
import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getOnTheAir,
} from "@/lib/tmdb";
import { applyTheme, getTheme } from "@/lib/userPreferences";
import { applyUILayout, getUILayout } from "@/lib/uiLayout";
import { useLanguage } from "@/hooks/useLanguage";

const Index = () => {
  const { t } = useLanguage();

  // Apply saved theme and layout on mount
  useEffect(() => {
    applyTheme(getTheme());
    applyUILayout(getUILayout());
  }, []);

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => getTrending("all", "week"),
  });

  const { data: popularMovies, isLoading: popularMoviesLoading } = useQuery({
    queryKey: ["popular", "movie"],
    queryFn: () => getPopular("movie"),
  });

  const { data: popularTV, isLoading: popularTVLoading } = useQuery({
    queryKey: ["popular", "tv"],
    queryFn: () => getPopular("tv"),
  });

  const { data: topRatedMovies, isLoading: topRatedMoviesLoading } = useQuery({
    queryKey: ["topRated", "movie"],
    queryFn: () => getTopRated("movie"),
  });

  const { data: nowPlaying, isLoading: nowPlayingLoading } = useQuery({
    queryKey: ["nowPlaying"],
    queryFn: getNowPlaying,
  });

  const { data: onTheAir, isLoading: onTheAirLoading } = useQuery({
    queryKey: ["onTheAir"],
    queryFn: getOnTheAir,
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden transition-colors duration-300">
      <Navbar />

      {/* Hero Banner */}
      <div className="min-h-[50vh] sm:min-h-[60vh] md:min-h-[75vh]">
        {trending && <LayoutHeroBanner items={trending} />}
      </div>

      {/* Content Rows */}
      <div className="relative z-10 -mt-16 sm:-mt-20 space-y-6 sm:space-y-8 pb-8 sm:pb-16">
        <div className="container mx-auto px-3 sm:px-4 space-y-6 sm:space-y-10">
          
          {/* Pinned Favorites - Only show if user has pinned items */}
          <PinnedFavorites />

          {/* Continue Watching */}
          <ContinueWatchingRow />

          <MediaRow
            title={t("trendingNow")}
            items={trending || []}
            isLoading={trendingLoading}
          />

          <MediaRow
            title={t("popularMovies")}
            items={popularMovies || []}
            isLoading={popularMoviesLoading}
          />

          <MediaRow
            title={t("nowPlaying")}
            items={nowPlaying || []}
            isLoading={nowPlayingLoading}
          />

          <MediaRow
            title={t("popularTVShows")}
            items={popularTV || []}
            isLoading={popularTVLoading}
          />

          <MediaRow
            title={t("onTheAir")}
            items={onTheAir || []}
            isLoading={onTheAirLoading}
          />

          <MediaRow
            title={t("topRated")}
            items={topRatedMovies || []}
            isLoading={topRatedMoviesLoading}
          />
        </div>
      </div>

      {/* Scroll To Top */}
      <ScrollToTop />

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-10 safe-bottom bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Zuniverse. {t("poweredBy")}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
