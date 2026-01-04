import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import {
  getPopular,
  getTopRated,
  getNowPlaying,
  getUpcoming,
} from "@/lib/tmdb";

const Movies = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-10">
          <h1 className="text-3xl md:text-4xl font-bold">Movies</h1>

          <MediaRow
            title="Now Playing"
            items={nowPlaying || []}
            isLoading={nowPlayingLoading}
          />

          <MediaRow
            title="Popular"
            items={popular || []}
            isLoading={popularLoading}
          />

          <MediaRow
            title="Upcoming"
            items={upcoming || []}
            isLoading={upcomingLoading}
          />

          <MediaRow
            title="Top Rated"
            items={topRated || []}
            isLoading={topRatedLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Movies;
