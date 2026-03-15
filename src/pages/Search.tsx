import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, Clock, TrendingUp, Film, Tv } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import PageTransition from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { search, getTrending } from "@/lib/tmdb";
import { useLanguage } from "@/hooks/useLanguage";

const HISTORY_KEY = "cinetorrio_search_history";
const MAX_HISTORY = 5;

const getSearchHistory = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch { return []; }
};

const addToHistory = (term: string) => {
  const history = getSearchHistory().filter((h) => h !== term);
  history.unshift(term);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
};

const clearHistory = () => localStorage.removeItem(HISTORY_KEY);

const Search = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [mediaFilter, setMediaFilter] = useState<"all" | "movie" | "tv">("all");
  const [history, setHistory] = useState(getSearchHistory);

  const { data: trendingData } = useQuery({
    queryKey: ["trending", "all", "day"],
    queryFn: () => getTrending("all", "day"),
    enabled: !debouncedQuery,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
        addToHistory(query);
        setHistory(getSearchHistory());
      } else {
        setSearchParams({});
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const results = useMemo(() => {
    const all = data?.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    ) || [];
    if (mediaFilter === "all") return all;
    return all.filter((item) => item.media_type === mediaFilter);
  }, [data, mediaFilter]);

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const trendingSuggestions = trendingData?.slice(0, 8).map((t) => t.title || t.name || "") || [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">{t("search")}</h1>
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-6 text-lg bg-card border-0 rounded-xl focus-visible:ring-primary"
                />
                {query && (
                  <Button variant="ghost" size="icon" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* Media type filter */}
              {debouncedQuery && (
                <Tabs value={mediaFilter} onValueChange={(v) => setMediaFilter(v as typeof mediaFilter)} className="mt-4">
                  <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto">
                    <TabsTrigger value="all">{t("filterAll")}</TabsTrigger>
                    <TabsTrigger value="movie" className="gap-1"><Film className="w-3 h-3" /> {t("movies")}</TabsTrigger>
                    <TabsTrigger value="tv" className="gap-1"><Tv className="w-3 h-3" /> {t("tvShows")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </motion.div>

            {/* Search History */}
            {!debouncedQuery && history.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {t("searchHistory")}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleClearHistory} className="text-xs">
                    {t("clearHistory")}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((term) => (
                    <Button key={term} variant="secondary" size="sm" onClick={() => setQuery(term)} className="rounded-full text-xs">
                      {term}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trending Suggestions */}
            {!debouncedQuery && trendingSuggestions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mb-8">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" /> {t("trendingSearches")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSuggestions.filter(Boolean).map((term) => (
                    <Button key={term} variant="outline" size="sm" onClick={() => setQuery(term)} className="rounded-full text-xs">
                      {term}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {isLoading && debouncedQuery && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="spinner-fancy" />
                <p className="text-sm text-muted-foreground animate-pulse">{t("search")}...</p>
              </div>
            )}

            {!isLoading && debouncedQuery && results.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <p className="text-muted-foreground text-lg">{t("noResults")} "{debouncedQuery}"</p>
              </motion.div>
            )}

            {results.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-muted-foreground mb-6">
                  {results.length} {t("resultsFor")} "{debouncedQuery}"
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {results.map((item, index) => (
                    <MediaCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </motion.div>
            )}

            {!debouncedQuery && !history.length && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">{t("searchPlaceholder")}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Search;
