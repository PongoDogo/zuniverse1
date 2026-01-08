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
import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getOnTheAir,
} from "@/lib/tmdb";
import { applyTheme, getTheme } from "@/lib/userPreferences";

const Index = () => {
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
          {/* Achievements Badge */}
          <div className="flex justify-end">
            <AchievementsBadge />
          </div>

          {/* Pinned Favorites */}
          <PinnedFavorites />

          {/* Continue Watching */}
          <ContinueWatchingRow />

          {/* Personalized Recommendations */}
          <RecommendationRow />

          <MediaRow
            title="Trending Now"
            items={trending || []}
            isLoading={trendingLoading}
          />

          <MediaRow
            title="Popular Movies"
            items={popularMovies || []}
            isLoading={popularMoviesLoading}
          />

          <MediaRow
            title="Now Playing in Theaters"
            items={nowPlaying || []}
            isLoading={nowPlayingLoading}
          />

          <MediaRow
            title="Popular TV Shows"
            items={popularTV || []}
            isLoading={popularTVLoading}
          />

          <MediaRow
            title="On The Air"
            items={onTheAir || []}
            isLoading={onTheAirLoading}
          />

          <MediaRow
            title="Top Rated Movies"
            items={topRatedMovies || []}
            isLoading={topRatedMoviesLoading}
          />
        </div>
      </div>

      {/* Quick Access Bar */}
      <QuickAccessBar />

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8 safe-bottom">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-xs sm:text-sm">
          <p>© 2024 Zuniverse. Powered by TMDB.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
