import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Sparkles, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getGenres } from "@/lib/tmdb";
import { useLanguage } from "@/hooks/useLanguage";
import { Movie } from "@/lib/tmdb";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || "b2ec786f995dcde6d8d264ecd3cd91e9";

const discoverFetch = async (
  mediaType: string, genreId: number | null, page: number,
  sortBy: string, minRating: number, yearRange: [number, number]
) => {
  const params = new URLSearchParams({
    api_key: API_KEY,
    page: page.toString(),
    sort_by: sortBy,
    "vote_average.gte": minRating.toString(),
    "primary_release_date.gte": `${yearRange[0]}-01-01`,
    "primary_release_date.lte": `${yearRange[1]}-12-31`,
    ...(genreId ? { with_genres: genreId.toString() } : {}),
  });
  const res = await fetch(`https://api.themoviedb.org/3/discover/${mediaType}?${params}`);
  return res.json() as Promise<{ results: Movie[]; total_pages: number; total_results: number }>;
};

const Discover = () => {
  const { t } = useLanguage();
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [minRating, setMinRating] = useState(0);
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2026]);
  const [allResults, setAllResults] = useState<Movie[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: genres } = useQuery({
    queryKey: ["genres", mediaType],
    queryFn: () => getGenres(mediaType),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["discover", mediaType, selectedGenre, page, sortBy, minRating, yearRange],
    queryFn: async () => {
      const result = await discoverFetch(mediaType, selectedGenre, page, sortBy, minRating, yearRange);
      if (page === 1) {
        setAllResults(result.results);
      } else {
        setAllResults((prev) => [...prev, ...result.results]);
      }
      return result;
    },
    enabled: !!selectedGenre,
  });

  const handleGenreChange = (genreId: string) => {
    setSelectedGenre(parseInt(genreId));
    setPage(1);
    setAllResults([]);
  };

  const resetFilters = () => {
    setSelectedGenre(null);
    setPage(1);
    setSortBy("popularity.desc");
    setMinRating(0);
    setYearRange([2000, 2026]);
    setAllResults([]);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background gradient-mesh">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-primary" />
                  <h1 className="text-3xl md:text-4xl font-bold">{t("discover")}</h1>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 self-start sm:self-auto"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              {/* Filters Row */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-3 items-end pt-4">
                      <div className="flex gap-2">
                        <Button
                          variant={mediaType === "movie" ? "default" : "secondary"}
                          className="btn-ripple"
                          onClick={() => { setMediaType("movie"); resetFilters(); }}
                        >
                          {t("movies")}
                        </Button>
                        <Button
                          variant={mediaType === "tv" ? "default" : "secondary"}
                          className="btn-ripple"
                          onClick={() => { setMediaType("tv"); resetFilters(); }}
                        >
                          {t("tvShows")}
                        </Button>
                      </div>

                      <Select value={selectedGenre?.toString() || ""} onValueChange={handleGenreChange}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder={t("selectGenre")} />
                        </SelectTrigger>
                        <SelectContent>
                          {genres?.map((genre) => (
                            <SelectItem key={genre.id} value={genre.id.toString()}>{genre.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); setAllResults([]); }}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="popularity.desc">{t("popularity")} ↓</SelectItem>
                          <SelectItem value="vote_average.desc">{t("rating")} ↓</SelectItem>
                          <SelectItem value="primary_release_date.desc">{t("releaseDate")} ↓</SelectItem>
                          <SelectItem value="revenue.desc">{t("revenue")} ↓</SelectItem>
                        </SelectContent>
                      </Select>

                      {selectedGenre && (
                        <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-destructive">
                          <X className="w-3 h-3" /> Reset
                        </Button>
                      )}
                    </div>

                    {/* Advanced Filters */}
                    {selectedGenre && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex flex-wrap gap-6 items-center p-4 rounded-xl bg-card/50 border border-border/50 glass-panel">
                        <div className="space-y-1.5 w-48">
                          <label className="text-xs text-muted-foreground font-medium">{t("minimumRating")}: {minRating}</label>
                          <Slider
                            value={[minRating]}
                            onValueChange={([v]) => { setMinRating(v); setPage(1); setAllResults([]); }}
                            max={9}
                            step={0.5}
                          />
                        </div>
                        <div className="space-y-1.5 w-64">
                          <label className="text-xs text-muted-foreground font-medium">{t("yearRange")}: {yearRange[0]} - {yearRange[1]}</label>
                          <Slider
                            value={yearRange}
                            onValueChange={(v) => { setYearRange(v as [number, number]); setPage(1); setAllResults([]); }}
                            min={1970}
                            max={2026}
                            step={1}
                          />
                        </div>
                        {data && (
                          <p className="text-sm text-muted-foreground">
                            {data.total_results.toLocaleString()} {t("totalResults")}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Genre Chips */}
            {!selectedGenre && genres && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2.5 mb-8">
                {genres.map((genre, i) => (
                  <motion.div
                    key={genre.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => { setSelectedGenre(genre.id); setShowFilters(true); }}
                      className="rounded-full btn-ripple hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all"
                    >
                      {genre.name}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {isLoading && page === 1 && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="spinner-fancy" />
                <p className="text-sm text-muted-foreground">{t("loading")}...</p>
              </div>
            )}

            {allResults.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
                  {allResults.map((item, index) => (
                    <MediaCard key={`${item.id}-${index}`} item={{ ...item, media_type: mediaType }} index={index} />
                  ))}
                </div>

                {data && page < Math.min(data.total_pages, 500) && (
                  <div className="flex justify-center mt-12">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={isLoading}
                      className="px-8 btn-magnetic"
                    >
                      {isLoading ? t("loading") : t("loadMore")}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {!selectedGenre && !isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                <div className="empty-state-icon">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  {t("selectGenre")}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Discover;
