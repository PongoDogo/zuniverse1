import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getGenres, getByGenre } from "@/lib/tmdb";

const Discover = () => {
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { data: genres } = useQuery({
    queryKey: ["genres", mediaType],
    queryFn: () => getGenres(mediaType),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["discover", mediaType, selectedGenre, page],
    queryFn: () => getByGenre(mediaType, selectedGenre || 28, page),
    enabled: !!selectedGenre,
  });

  const handleGenreChange = (genreId: string) => {
    setSelectedGenre(parseInt(genreId));
    setPage(1);
  };

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
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Discover</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                <Button
                  variant={mediaType === "movie" ? "default" : "secondary"}
                  onClick={() => {
                    setMediaType("movie");
                    setSelectedGenre(null);
                    setPage(1);
                  }}
                >
                  Movies
                </Button>
                <Button
                  variant={mediaType === "tv" ? "default" : "secondary"}
                  onClick={() => {
                    setMediaType("tv");
                    setSelectedGenre(null);
                    setPage(1);
                  }}
                >
                  TV Shows
                </Button>
              </div>

              <Select
                value={selectedGenre?.toString() || ""}
                onValueChange={handleGenreChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres?.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id.toString()}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Genre Chips */}
          {!selectedGenre && genres && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-3 mb-8"
            >
              {genres.map((genre) => (
                <Button
                  key={genre.id}
                  variant="outline"
                  onClick={() => setSelectedGenre(genre.id)}
                  className="rounded-full"
                >
                  {genre.name}
                </Button>
              ))}
            </motion.div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Results Grid */}
          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {data.results.map((item, index) => (
                  <MediaCard
                    key={item.id}
                    item={{ ...item, media_type: mediaType }}
                    index={index}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="flex justify-center gap-4 mt-12">
                  <Button
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-muted-foreground">
                    Page {page} of {Math.min(data.total_pages, 500)}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={page >= Math.min(data.total_pages, 500)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {!selectedGenre && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-muted-foreground text-lg">
                Select a genre to discover {mediaType === "movie" ? "movies" : "TV shows"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
