import { useQuery } from "@tanstack/react-query";
import { getContinueWatching, getWatchlist } from "@/lib/watchlist";
import { getSimilar, Movie } from "@/lib/tmdb";
import MediaRow from "./MediaRow";

interface RecommendationRowProps {
  title?: string;
}

const RecommendationRow = ({ title }: RecommendationRowProps) => {
  // Get user's watched/watchlist items for recommendations
  const getRecentMedia = () => {
    const continueWatching = getContinueWatching();
    const watchlist = getWatchlist();
    
    // Combine and get unique items, prioritize recently watched
    const allItems = [
      ...continueWatching.map(c => ({ id: c.id, mediaType: c.mediaType, title: c.title })),
      ...watchlist.slice(0, 5).map(w => ({ id: w.id, mediaType: w.mediaType, title: w.title || w.name || "Unknown" })),
    ];
    
    // Get unique items
    const seen = new Set<string>();
    return allItems.filter(item => {
      const key = `${item.mediaType}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 3);
  };

  const recentMedia = getRecentMedia();
  const primaryItem = recentMedia[0];

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommendations", primaryItem?.id, primaryItem?.mediaType],
    queryFn: async () => {
      if (!primaryItem) return [];
      const similar = await getSimilar(primaryItem.mediaType, primaryItem.id);
      return similar;
    },
    enabled: !!primaryItem,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  if (!primaryItem || (!isLoading && (!recommendations || recommendations.length === 0))) {
    return null;
  }

  const displayTitle = title || `Because you watched ${primaryItem.title}`;

  return (
    <MediaRow
      title={displayTitle}
      items={recommendations || []}
      isLoading={isLoading}
    />
  );
};

export default RecommendationRow;
