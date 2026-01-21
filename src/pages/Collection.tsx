import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Film, Tv, Check, Trash2, Calendar, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserData, CollectionItem } from "@/hooks/useUserData";
import { getImageUrl } from "@/lib/tmdb";
import { toast } from "sonner";

const Collection = () => {
  const { t } = useLanguage();
  const { getCollection, unmarkAsWatched, updateRating, loading, isSignedIn } = useUserData();
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  const collection = getCollection();

  const filteredItems = useMemo(() => {
    if (filter === "all") return collection;
    return collection.filter((item) => item.mediaType === filter);
  }, [collection, filter]);

  const handleRemove = async (id: number, mediaType: "movie" | "tv") => {
    await unmarkAsWatched(id, mediaType);
    toast.success(t("removedFromCollection"));
  };

  const handleRatingChange = async (id: number, mediaType: "movie" | "tv", rating: number) => {
    await updateRating(id, mediaType, rating);
    toast.success(t("ratingUpdated"));
  };

  const movieCount = collection.filter((i) => i.mediaType === "movie").length;
  const tvCount = collection.filter((i) => i.mediaType === "tv").length;

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4">
          <div className="text-center py-20">
            <Check className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">{t("signInToSeeCollection")}</h2>
            <p className="text-muted-foreground">{t("signInToSync")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Check className="w-8 h-8 text-success" />
              {t("myCollection")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {collection.length} {t("itemsWatched")}
            </p>
          </div>
        </div>

        {/* Tabs for filtering */}
        <Tabs defaultValue="all" className="mb-8" onValueChange={(v) => setFilter(v as "all" | "movie" | "tv")}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              {t("all")} ({collection.length})
            </TabsTrigger>
            <TabsTrigger value="movie" className="gap-2">
              <Film className="w-4 h-4" />
              {t("movies")} ({movieCount})
            </TabsTrigger>
            <TabsTrigger value="tv" className="gap-2">
              <Tv className="w-4 h-4" />
              {t("tvShows")} ({tvCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <Check className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">{t("noWatchedItems")}</h2>
            <p className="text-muted-foreground mb-6">{t("markMoviesAsWatched")}</p>
            <Link to="/">
              <Button>{t("browseContent")}</Button>
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={`${item.mediaType}-${item.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  className="group relative"
                >
                  <Link to={`/${item.mediaType}/${item.id}`}>
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                      {item.poster_path ? (
                        <img
                          src={getImageUrl(item.poster_path, "w500")}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {item.mediaType === "movie" ? (
                            <Film className="w-12 h-12 text-muted-foreground" />
                          ) : (
                            <Tv className="w-12 h-12 text-muted-foreground" />
                          )}
                        </div>
                      )}

                      {/* Watched badge */}
                      <div className="absolute top-2 left-2 bg-success rounded-full p-1.5">
                        <Check className="w-3 h-3 text-success-foreground" />
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="font-semibold text-foreground text-sm truncate">
                            {item.title || item.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            {item.release_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.release_date).getFullYear()}
                              </span>
                            )}
                            {item.vote_average > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-primary text-primary" />
                                {item.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>
                          {/* User Rating */}
                          {item.rating !== null && item.rating !== undefined && item.rating > 0 && (
                            <div className="mt-2 flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">{t("yourRating")}:</span>
                              <span className="text-xs font-medium text-yellow-500">{item.rating}/10</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Rating Controls - Show on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity border-t border-border/50">
                    <StarRating
                      value={item.rating ?? 0}
                      onChange={(rating) => handleRatingChange(item.id, item.mediaType, rating)}
                      maxStars={10}
                      size="sm"
                    />
                  </div>

                  {/* Remove button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemove(item.id, item.mediaType)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 hover:bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t("removeFromCollection")}
                  >
                    <Trash2 className="w-3 h-3 text-destructive-foreground" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Collection;
