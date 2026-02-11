import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Film, Tv, Check, Trash2, Calendar, Star, Search, Download, Grid3X3, List, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import StarRating from "@/components/StarRating";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserData, CollectionItem } from "@/hooks/useUserData";
import { getImageUrl } from "@/lib/tmdb";
import { toast } from "sonner";

type SortOption = "watchedAt" | "rating" | "titleAZ" | "releaseDate";
type ViewMode = "grid" | "list";

const Collection = () => {
  const { t, language } = useLanguage();
  const { getCollection, unmarkAsWatched, updateRating, loading, isSignedIn } = useUserData();
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const [sortBy, setSortBy] = useState<SortOption>("watchedAt");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const collection = getCollection();

  const filteredAndSorted = useMemo(() => {
    let items = filter === "all" ? collection : collection.filter((i) => i.mediaType === filter);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((i) => (i.title || i.name || "").toLowerCase().includes(q));
    }

    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "rating": return (b.rating ?? 0) - (a.rating ?? 0);
        case "titleAZ": return (a.title || a.name || "").localeCompare(b.title || b.name || "");
        case "releaseDate": return (b.release_date || "").localeCompare(a.release_date || "");
        default: return (b.watchedAt || b.addedAt) - (a.watchedAt || a.addedAt);
      }
    });
  }, [collection, filter, sortBy, searchQuery]);

  const handleRemove = async (id: number, mediaType: "movie" | "tv") => {
    await unmarkAsWatched(id, mediaType);
    toast.success(t("removedFromCollection"));
  };

  const handleRatingChange = async (id: number, mediaType: "movie" | "tv", rating: number) => {
    await updateRating(id, mediaType, rating);
    toast.success(t("ratingUpdated"));
  };

  const handleExport = () => {
    const data = JSON.stringify(collection, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cinetorrio-collection-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(language === "el" ? "Η συλλογή εξήχθη" : "Collection exported");
  };

  const movieCount = collection.filter((i) => i.mediaType === "movie").length;
  const tvCount = collection.filter((i) => i.mediaType === "tv").length;
  const avgRating = collection.filter((i) => i.rating).length > 0
    ? (collection.reduce((sum, i) => sum + (i.rating || 0), 0) / collection.filter((i) => i.rating).length).toFixed(1)
    : "—";

  if (!isSignedIn) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="pt-24 pb-16 container mx-auto px-4 text-center py-20">
            <Check className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">{t("signInToSeeCollection")}</h2>
            <p className="text-muted-foreground">{t("signInToSync")}</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4">
          {/* Header with Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Check className="w-8 h-8 text-success" />
                {t("myCollection")}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{collection.length} {t("itemsWatched")}</span>
                <span>⭐ {t("avgRating")}: {avgRating}</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" /> {t("exportCollection")}
            </Button>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="all">{t("all")} ({collection.length})</TabsTrigger>
                <TabsTrigger value="movie"><Film className="w-3 h-3 mr-1" />{movieCount}</TabsTrigger>
                <TabsTrigger value="tv"><Tv className="w-3 h-3 mr-1" />{tvCount}</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("searchCollection")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-44 h-9">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="watchedAt">{t("sortDateWatched")}</SelectItem>
                <SelectItem value="rating">{t("sortRating")}</SelectItem>
                <SelectItem value="titleAZ">{t("sortTitleAZ")}</SelectItem>
                <SelectItem value="releaseDate">{t("sortReleaseDate")}</SelectItem>
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

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-20">
              <Check className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">{searchQuery ? t("noResults") : t("noWatchedItems")}</h2>
              {!searchQuery && (
                <>
                  <p className="text-muted-foreground mb-6">{t("markMoviesAsWatched")}</p>
                  <Link to="/"><Button>{t("browseContent")}</Button></Link>
                </>
              )}
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-2">
              {filteredAndSorted.map((item) => (
                <motion.div
                  key={`${item.mediaType}-${item.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border hover:bg-secondary/50 transition-colors group"
                >
                  <Link to={`/${item.mediaType}/${item.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={getImageUrl(item.poster_path, "w200")}
                      alt={item.title || item.name}
                      className="w-12 h-18 rounded object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">{item.title || item.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{item.mediaType === "movie" ? "Movie" : "TV"}</span>
                        {item.release_date && <span>{new Date(item.release_date).getFullYear()}</span>}
                        {item.vote_average > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {item.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StarRating value={item.rating ?? 0} onChange={(r) => handleRatingChange(item.id, item.mediaType, r)} maxStars={10} size="sm" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleRemove(item.id, item.mediaType)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
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
                    transition={{ delay: index * 0.02 }}
                    className="group relative"
                  >
                    <Link to={`/${item.mediaType}/${item.id}`}>
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                        {item.poster_path ? (
                          <img src={getImageUrl(item.poster_path, "w500")} alt={item.title || item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {item.mediaType === "movie" ? <Film className="w-12 h-12 text-muted-foreground" /> : <Tv className="w-12 h-12 text-muted-foreground" />}
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-success rounded-full p-1.5"><Check className="w-3 h-3 text-success-foreground" /></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="font-semibold text-sm truncate">{item.title || item.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              {item.release_date && <span><Calendar className="w-3 h-3 inline mr-0.5" />{new Date(item.release_date).getFullYear()}</span>}
                              {item.rating != null && item.rating > 0 && <span className="text-yellow-500">{item.rating}/10</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity border-t border-border/50">
                      <StarRating value={item.rating ?? 0} onChange={(r) => handleRatingChange(item.id, item.mediaType, r)} maxStars={10} size="sm" />
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRemove(item.id, item.mediaType)} className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 hover:bg-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3 text-destructive-foreground" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Collection;
