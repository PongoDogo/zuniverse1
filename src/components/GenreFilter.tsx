import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";

const MOVIE_GENRES = [
  { id: 28, name: "Action", nameEl: "Δράση" },
  { id: 12, name: "Adventure", nameEl: "Περιπέτεια" },
  { id: 16, name: "Animation", nameEl: "Animation" },
  { id: 35, name: "Comedy", nameEl: "Κωμωδία" },
  { id: 80, name: "Crime", nameEl: "Έγκλημα" },
  { id: 99, name: "Documentary", nameEl: "Ντοκιμαντέρ" },
  { id: 18, name: "Drama", nameEl: "Δράμα" },
  { id: 10751, name: "Family", nameEl: "Οικογενειακή" },
  { id: 14, name: "Fantasy", nameEl: "Φαντασίας" },
  { id: 36, name: "History", nameEl: "Ιστορική" },
  { id: 27, name: "Horror", nameEl: "Τρόμου" },
  { id: 10402, name: "Music", nameEl: "Μουσική" },
  { id: 9648, name: "Mystery", nameEl: "Μυστηρίου" },
  { id: 10749, name: "Romance", nameEl: "Ρομαντική" },
  { id: 878, name: "Sci-Fi", nameEl: "Επιστημονικής Φαντασίας" },
  { id: 53, name: "Thriller", nameEl: "Θρίλερ" },
  { id: 10752, name: "War", nameEl: "Πολεμική" },
  { id: 37, name: "Western", nameEl: "Western" },
];

interface GenreFilterProps {
  selectedGenres: number[];
  onGenresChange: (genres: number[]) => void;
  mediaType?: "movie" | "tv";
}

const GenreFilter = ({ selectedGenres, onGenresChange, mediaType = "movie" }: GenreFilterProps) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      onGenresChange(selectedGenres.filter(id => id !== genreId));
    } else {
      onGenresChange([...selectedGenres, genreId]);
    }
  };

  const clearFilters = () => {
    onGenresChange([]);
  };

  const getGenreName = (genre: typeof MOVIE_GENRES[0]) => {
    return language === "el" ? genre.nameEl : genre.name;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{t("genres")}</span>
            {selectedGenres.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {selectedGenres.length}
              </span>
            )}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 p-3 max-h-80 overflow-y-auto glass-panel">
          <div className="grid grid-cols-2 gap-1.5">
            {MOVIE_GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  selectedGenres.includes(genre.id)
                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
                    : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {getGenreName(genre)}
              </button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selected genres chips */}
      <AnimatePresence>
        {selectedGenres.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1 flex-wrap"
          >
            {selectedGenres.slice(0, 3).map((genreId) => {
              const genre = MOVIE_GENRES.find(g => g.id === genreId);
              if (!genre) return null;
              return (
                <span
                  key={genreId}
                  className="chip-fancy active inline-flex items-center gap-1"
                >
                  {getGenreName(genre)}
                  <button
                    onClick={() => toggleGenre(genreId)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            {selectedGenres.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{selectedGenres.length - 3}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
              {t("clearAll")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenreFilter;
