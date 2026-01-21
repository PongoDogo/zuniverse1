import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Film, Tv, Trash2, Calendar, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import { getFavorites, removeFromFavorites, FavoriteItem } from "@/lib/favorites";
import { getImageUrl } from "@/lib/tmdb";
import { toast } from "sonner";

const Favorites = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  useEffect(() => {
    setItems(getFavorites());
  }, []);

  const handleRemove = (id: number, mediaType: "movie" | "tv") => {
    removeFromFavorites(id, mediaType);
    setItems(getFavorites());
    toast.success(t("removedFromFavorites"));
  };

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
              <h1 className="text-3xl md:text-4xl font-bold">{t("favorites")}</h1>
            </div>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} saved • Local only
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-8">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                {t("all")} ({items.length})
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

          {filteredItems.length > 0 ? (
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
                            alt={item.title}
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

                        {/* Favorite badge */}
                        <div className="absolute top-2 left-2 bg-primary rounded-full p-1.5">
                          <Heart className="w-3 h-3 fill-primary-foreground text-primary-foreground" />
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="font-semibold text-foreground text-sm truncate">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              {(item.release_date || item.first_air_date) && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.release_date || item.first_air_date || "").getFullYear()}
                                </span>
                              )}
                              {item.vote_average && item.vote_average > 0 && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-primary text-primary" />
                                  {item.vote_average.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Remove button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemove(item.id, item.mediaType)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 hover:bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      title={t("removeFromFavorites")}
                    >
                      <Trash2 className="w-3 h-3 text-destructive-foreground" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">{t("noFavorites")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("addFavoritesToStart")}
              </p>
              <Button asChild>
                <Link to="/discover">{t("browseContent")}</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
