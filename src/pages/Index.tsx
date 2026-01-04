import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import MediaRow from "@/components/MediaRow";
import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getOnTheAir,
} from "@/lib/tmdb";

const Index = () => {
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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      {trending && <HeroBanner items={trending} />}

      {/* Content Rows */}
      <div className="relative z-10 -mt-20 space-y-8 pb-16">
        <div className="container mx-auto px-4 space-y-10">
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

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 StreamVix. Powered by TMDB.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
