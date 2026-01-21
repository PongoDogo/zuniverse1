import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Film, Tv, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/useUserData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Watchlist = () => {
  const { getWatchlist, loading, isSignedIn, refetchWatchlist } = useUserData();
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const [items, setItems] = useState<ReturnType<typeof getWatchlist>>([]);

  useEffect(() => {
    setItems(getWatchlist());
  }, [getWatchlist, loading]);

  // Refetch when component mounts if signed in
  useEffect(() => {
    if (isSignedIn && refetchWatchlist) {
      refetchWatchlist();
    }
  }, [isSignedIn, refetchWatchlist]);

  const filteredItems =
    filter === "all" ? items : items.filter((item) => item.mediaType === filter);

  const movieCount = items.filter((i) => i.mediaType === "movie").length;
  const tvCount = items.filter((i) => i.mediaType === "tv").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">My Collection</h1>
            </div>
            <p className="text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                <>
                  {items.length} {items.length === 1 ? "item" : "items"} saved
                  {isSignedIn && " • Synced with CineVault"}
                </>
              )}
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-8">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                All ({items.length})
              </TabsTrigger>
              <TabsTrigger value="movie" className="gap-2">
                <Film className="w-4 h-4" />
                Movies ({movieCount})
              </TabsTrigger>
              <TabsTrigger value="tv" className="gap-2">
                <Tv className="w-4 h-4" />
                TV Shows ({tvCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
            >
              {filteredItems.map((item, index) => (
                <MediaCard
                  key={`${item.id}-${item.mediaType}`}
                  item={{
                    id: item.id,
                    title: item.title || item.name || "Unknown",
                    name: item.name || item.title,
                    poster_path: item.poster_path,
                    backdrop_path: item.backdrop_path,
                    overview: item.overview,
                    vote_average: item.vote_average,
                    vote_count: item.vote_count,
                    genre_ids: item.genre_ids,
                    release_date: item.release_date,
                    first_air_date: item.first_air_date,
                    media_type: item.mediaType,
                  }}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">Your collection is empty</h2>
              <p className="text-muted-foreground mb-6">
                {isSignedIn
                  ? "Start adding movies and TV shows to sync across CineTorrio and CineVault!"
                  : "Sign in to sync your collection across devices and with CineVault!"}
              </p>
              <Button asChild>
                <a href="/discover">Discover Content</a>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watchlist;
