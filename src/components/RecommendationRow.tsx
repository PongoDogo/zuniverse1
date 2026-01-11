import { useQuery } from "@tanstack/react-query";
import { getContinueWatching, getWatchlist } from "@/lib/watchlist";
import { getSimilar } from "@/lib/tmdb";
import MediaRow from "./MediaRow";
import { useLanguage } from "@/hooks/useLanguage";

const RecommendationRow = () => {
  const { t } = useLanguage();

  const getRecentMedia = () => {
    const continueWatching = getContinueWatching();
    const watchlist = getWatchlist();
    
    const allItems = [
      ...continueWatching.map(c => ({ id: c.id, mediaType: c.mediaType, title: c.title })),
      ...watchlist.slice(0, 5).map(w => ({ id: w.id, mediaType: w.mediaType, title: w.title || w.name || "Unknown" })),
    ];
    
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
      return await getSimilar(primaryItem.mediaType, primaryItem.id);
    },
    enabled: !!primaryItem,
    staleTime: 1000 * 60 * 10,
  });

  if (!primaryItem || (!isLoading && (!recommendations || recommendations.length === 0))) {
    return null;
  }

  const displayTitle = `${t("becauseYouWatched")} ${primaryItem.title}`;

  return (
    <MediaRow
      title={displayTitle}
      items={recommendations || []}
      isLoading={isLoading}
    />
  );
};

export default RecommendationRow;
