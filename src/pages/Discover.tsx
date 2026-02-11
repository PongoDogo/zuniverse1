import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">{t("discover")}</h1>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex gap-2">
                  <Button variant={mediaType === "movie" ? "default" : "secondary"} onClick={() => { setMediaType("movie"); resetFilters(); }}>
                    {t("movies")}
                  </Button>
                  <Button variant={mediaType === "tv" ? "default" : "secondary"} onClick={() => { setMediaType("tv"); resetFilters(); }}>
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
              </div>

              {/* Advanced Filters */}
              {selectedGenre && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 flex flex-wrap gap-6 items-center p-4 rounded-xl bg-card border border-border">
                  <div className="space-y-1 w-48">
                    <label className="text-xs text-muted-foreground">{t("minimumRating")}: {minRating}</label>
                    <Slider
                      value={[minRating]}
                      onValueChange={([v]) => { setMinRating(v); setPage(1); setAllResults([]); }}
                      max={9}
                      step={0.5}
                    />
                  </div>
                  <div className="space-y-1 w-64">
                    <label className="text-xs text-muted-foreground">{t("yearRange")}: {yearRange[0]} - {yearRange[1]}</label>
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

            {/* Genre Chips */}
            {!selectedGenre && genres && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-3 mb-8">
                {genres.map((genre) => (
                  <Button key={genre.id} variant="outline" onClick={() => setSelectedGenre(genre.id)} className="rounded-full">
                    {genre.name}
                  </Button>
                ))}
              </motion.div>
            )}

            {isLoading && page === 1 && (
              <div className="flex justify-center py-16">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {allResults.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
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
                      className="px-8"
                    >
                      {isLoading ? t("loading") : t("loadMore")}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {!selectedGenre && !isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
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
