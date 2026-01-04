import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import { getPopular, getTopRated, getOnTheAir, getTrending } from "@/lib/tmdb";

const TVShows = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-10">
          <h1 className="text-3xl md:text-4xl font-bold">TV Shows</h1>

          <MediaRow
            title="Trending This Week"
            items={trending || []}
            isLoading={trendingLoading}
          />

          <MediaRow
            title="On The Air"
            items={onTheAir || []}
            isLoading={onTheAirLoading}
          />

          <MediaRow
            title="Popular"
            items={popular || []}
            isLoading={popularLoading}
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

export default TVShows;
