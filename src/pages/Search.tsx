import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { search } from "@/lib/tmdb";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
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

  const results =
    data?.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Search Movies & TV Shows
            </h1>

            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for movies, TV shows..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-6 text-lg bg-card border-0 rounded-xl focus-visible:ring-primary"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </motion.div>

          {/* Results */}
          {isLoading && debouncedQuery && (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && debouncedQuery && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-muted-foreground text-lg">
                No results found for "{debouncedQuery}"
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Try searching with different keywords
              </p>
            </motion.div>
          )}

          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-muted-foreground mb-6">
                Found {results.length} results for "{debouncedQuery}"
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {results.map((item, index) => (
                  <MediaCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {!debouncedQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                Start typing to search for movies and TV shows
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
