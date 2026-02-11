import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Film, Tv, Trash2, Calendar, Star, ArrowUpDown, GripVertical, Search, Grid3X3, List, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { getFavorites, removeFromFavorites, FavoriteItem } from "@/lib/favorites";
import { reorderFavorites } from "@/lib/favoritesReorder";
import { getImageUrl } from "@/lib/tmdb";
import { toast } from "sonner";

type SortOption = "dateAdded" | "titleAZ" | "rating";
type ViewMode = "grid" | "list";

// Genre name mapping for suggestions
const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 53: "Thriller",
  10752: "War", 37: "Western", 10759: "Action & Adventure", 10765: "Sci-Fi & Fantasy",
};

const Favorites = () => {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const [sortBy, setSortBy] = useState<SortOption>("dateAdded");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    setItems(getFavorites());
  }, []);

  const handleRemove = (id: number, mediaType: "movie" | "tv") => {
    removeFromFavorites(id, mediaType);
    setItems(getFavorites());
    toast.success(t("removedFromFavorites"));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newItems = reorderFavorites(dragIndex, index);
    setItems(newItems);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = filter === "all" ? items : items.filter((item) => item.mediaType === filter);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => (item.title || "").toLowerCase().includes(q));
    }

    if (sortBy === "dateAdded") return filtered; // Keep localStorage order
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "titleAZ": return (a.title || "").localeCompare(b.title || "");
        case "rating": return (b.vote_average || 0) - (a.vote_average || 0);
        default: return 0;
      }
    });
  }, [items, filter, sortBy, searchQuery]);

  // Suggested genres based on favorites
  const topGenres = useMemo(() => {
    const genreCount: Record<number, number> = {};
    items.forEach((item) => {
      item.genre_ids?.forEach((gid) => {
        genreCount[gid] = (genreCount[gid] || 0) + 1;
      });
    });
    return Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => ({ id: Number(id), name: GENRE_MAP[Number(id)] || `Genre ${id}` }));
  }, [items]);

  const movieCount = items.filter((i) => i.mediaType === "movie").length;
  const tvCount = items.filter((i) => i.mediaType === "tv").length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-8 h-8 text-primary fill-primary" />
                <h1 className="text-3xl md:text-4xl font-bold">{t("favorites")}</h1>
              </div>
              <p className="text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"} saved • Local only
              </p>
            </motion.div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <TabsList>
                  <TabsTrigger value="all">{t("all")} ({items.length})</TabsTrigger>
                  <TabsTrigger value="movie"><Film className="w-3 h-3 mr-1" />{movieCount}</TabsTrigger>
                  <TabsTrigger value="tv"><Tv className="w-3 h-3 mr-1" />{tvCount}</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={language === "el" ? "Αναζήτηση αγαπημένων..." : "Search favorites..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-40 h-9">
                  <ArrowUpDown className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dateAdded">{t("sortDateAdded")}</SelectItem>
                  <SelectItem value="titleAZ">{t("sortTitleAZ")}</SelectItem>
                  <SelectItem value="rating">{t("sortRating")}</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-1">
                <Button variant={viewMode === "grid" ? "default" : "secondary"} size="icon" className="h-9 w-9" onClick={() => setViewMode("grid")}>
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "secondary"} size="icon" className="h-9 w-9" onClick={() => setViewMode("list")}>
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Suggested Genres */}
            {topGenres.length > 0 && items.length >= 3 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-card rounded-xl border border-border/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium">
                    {language === "el" ? "Προτεινόμενα είδη βάσει αγαπημένων" : "Suggested genres based on your favorites"}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topGenres.map((genre) => (
                    <Link
                      key={genre.id}
                      to={`/discover?genre=${genre.id}`}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {filteredAndSorted.length > 0 ? (
              viewMode === "list" ? (
                <div className="space-y-2">
                  {filteredAndSorted.map((item, index) => (
                    <motion.div
                      key={`${item.mediaType}-${item.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      draggable={sortBy === "dateAdded"}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-secondary/50 transition-colors group ${
                        dragIndex === index ? "opacity-50" : ""
                      }`}
                    >
                      {sortBy === "dateAdded" && (
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
                      )}
                      <Link to={`/${item.mediaType}/${item.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={getImageUrl(item.poster_path, "w200")}
                          alt={item.title}
                          className="w-10 h-15 rounded object-cover flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm truncate">{item.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.mediaType === "movie" ? "Movie" : "TV"}</span>
                            {(item.release_date || item.first_air_date) && (
                              <span>{new Date(item.release_date || item.first_air_date || "").getFullYear()}</span>
                            )}
                            {item.vote_average && item.vote_average > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                {item.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleRemove(item.id, item.mediaType)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredAndSorted.map((item, index) => (
                      <motion.div
                        key={`${item.mediaType}-${item.id}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.03 }}
                        className="group relative"
                        draggable={sortBy === "dateAdded"}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <Link to={`/${item.mediaType}/${item.id}`}>
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                            {item.poster_path ? (
                              <img src={getImageUrl(item.poster_path, "w500")} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {item.mediaType === "movie" ? <Film className="w-12 h-12 text-muted-foreground" /> : <Tv className="w-12 h-12 text-muted-foreground" />}
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-primary rounded-full p-1.5">
                              <Heart className="w-3 h-3 fill-primary-foreground text-primary-foreground" />
                            </div>
                            {sortBy === "dateAdded" && (
                              <div className="absolute top-2 right-10 p-1 rounded bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                                <GripVertical className="w-3 h-3" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className="font-semibold text-sm truncate">{item.title}</h3>
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
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemove(item.id, item.mediaType)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 hover:bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-destructive-foreground" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">{searchQuery ? t("noResults") : t("noFavorites")}</h2>
                {!searchQuery && <p className="text-muted-foreground mb-6">{t("addFavoritesToStart")}</p>}
                <Button asChild><Link to="/discover">{t("browseContent")}</Link></Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Favorites;
