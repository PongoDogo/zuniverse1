import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Film, Tv, Heart, Compass, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import LayoutHeroBanner from "@/components/layouts/LayoutHeroBanner";
import MediaRow from "@/components/MediaRow";
import TopTenRow from "@/components/TopTenRow";
import WelcomeSection from "@/components/WelcomeSection";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import PinnedFavorites from "@/components/PinnedFavorites";
import ScrollToTop from "@/components/ScrollToTop";
import CustomRecommendsButton from "@/components/CustomRecommendsButton";
import PageTransition from "@/components/PageTransition";
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
import { useUILayout } from "@/hooks/useUILayout";

const Index = () => {
  const { t, language } = useLanguage();
  const { layout } = useUILayout();
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
    <PageTransition>
      <div className="min-h-screen bg-background overflow-x-hidden transition-colors duration-300">
        <Navbar />

        {/* Hero Banner */}
        <div className="min-h-[50vh] sm:min-h-[60vh] md:min-h-[75vh]">
          {trending && <LayoutHeroBanner items={trending} />}
        </div>

        {/* Content Rows */}
        <div className="relative z-10 -mt-16 sm:-mt-20 space-y-6 sm:space-y-8 pb-8 sm:pb-16">
          <div className="container mx-auto px-3 sm:px-4 space-y-6 sm:space-y-10">
            
            {/* Welcome Section - signed in users */}
            <WelcomeSection />

            {/* Pinned Favorites */}
            <PinnedFavorites />

            {/* Continue Watching */}
            <ContinueWatchingRow />

            {/* Top 10 This Week */}
            <TopTenRow items={trending || []} isLoading={trendingLoading} />

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

        <ScrollToTop />
        <CustomRecommendsButton />

        {/* Enhanced Footer */}
        <div className="section-divider" />
        <footer className="py-8 sm:py-10 pb-24 safe-bottom bg-card/30 backdrop-blur-sm footer-glow">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8">
              {/* Brand */}
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-lg mb-2 text-shimmer">CineTorrio</h3>
                <p className="text-sm text-muted-foreground">
                  {language === "el" 
                    ? "Η αγαπημένη σου πλατφόρμα streaming" 
                    : "Your favorite streaming platform"}
                </p>
              </div>

              {/* Quick Links */}
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">{t("quickLinks")}</h4>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  <Link to="/movies" className="text-sm text-muted-foreground hover-glow-text transition-all flex items-center gap-1">
                    <Film className="w-3 h-3" /> {t("movies")}
                  </Link>
                  <Link to="/tv" className="text-sm text-muted-foreground hover-glow-text transition-all flex items-center gap-1">
                    <Tv className="w-3 h-3" /> {t("tvShows")}
                  </Link>
                  <Link to="/discover" className="text-sm text-muted-foreground hover-glow-text transition-all flex items-center gap-1">
                    <Compass className="w-3 h-3" /> {t("discover")}
                  </Link>
                  <Link to="/favorites" className="text-sm text-muted-foreground hover-glow-text transition-all flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {t("favorites")}
                  </Link>
                  <Link to="/collection" className="text-sm text-muted-foreground hover-glow-text transition-all flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {t("myCollection")}
                  </Link>
                </div>
              </div>

              {/* Info */}
              <div className="text-center sm:text-right">
                <p className="text-xs text-muted-foreground">{t("version")} 2.0.0</p>
                <p className="text-xs text-muted-foreground mt-1">© 2024 CineTorrio</p>
              </div>
            </div>

            <div className="section-divider mb-4" />
            <div className="text-center">
              <p className="text-muted-foreground text-xs">
                {t("poweredBy")}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
