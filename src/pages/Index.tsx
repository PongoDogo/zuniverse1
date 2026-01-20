import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import MediaRow from "@/components/MediaRow";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import PinnedFavorites from "@/components/PinnedFavorites";
import RecommendationRow from "@/components/RecommendationRow";
import QuickAccessBar from "@/components/QuickAccessBar";
import AchievementsBadge from "@/components/AchievementsBadge";
import StatsWidget from "@/components/StatsWidget";
import RandomPicker from "@/components/RandomPicker";
import ScrollToTop from "@/components/ScrollToTop";
import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getOnTheAir,
} from "@/lib/tmdb";
import { applyTheme, getTheme } from "@/lib/userPreferences";
import { useLanguage } from "@/hooks/useLanguage";
import { getSourceCount } from "@/lib/streamingSources";

const Index = () => {
  const { t } = useLanguage();

  // Apply saved theme on mount
  useEffect(() => {
    applyTheme(getTheme());
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

  const sourceCount = getSourceCount();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden transition-colors duration-300">
      <Navbar />

      {/* Hero Banner */}
      <div className="min-h-[55vh] sm:min-h-[65vh] md:min-h-[80vh]">
        {trending && <HeroBanner items={trending} />}
      </div>

      {/* Content Rows */}
      <div className="relative z-10 -mt-12 sm:-mt-16 space-y-4 sm:space-y-6 pb-6 sm:pb-12">
        <div className="container mx-auto px-2 sm:px-4 space-y-4 sm:space-y-8">
          {/* Top Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <AchievementsBadge />
              <RandomPicker />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-secondary rounded-full">
                📺 {sourceCount} streaming sources
              </span>
            </div>
          </div>

          {/* Stats Widget */}
          <StatsWidget />

          {/* Pinned Favorites */}
          <PinnedFavorites />

          {/* Continue Watching */}
          <ContinueWatchingRow />

          {/* Personalized Recommendations */}
          <RecommendationRow />

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

      {/* Quick Access Bar */}
      <QuickAccessBar />
      
      {/* Scroll To Top */}
      <ScrollToTop />

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8 safe-bottom">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-muted-foreground text-xs sm:text-sm">
            <p>© 2024 Zuniverse. {t("poweredBy")}</p>
            <span className="hidden sm:inline">•</span>
            <p className="text-primary">{sourceCount} streaming sources available</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
