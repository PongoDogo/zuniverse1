import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Sparkles, Film, Tv, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPopular, getTopRated, Movie } from "@/lib/tmdb";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

const RandomPicker = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isSpinning, setIsSpinning] = useState(false);
  const [pickedItem, setPickedItem] = useState<Movie | null>(null);

  const pickRandom = async () => {
    setIsSpinning(true);
    setPickedItem(null);

    try {
      // Fetch random from different sources
      const sources = [
        () => getPopular("movie"),
        () => getPopular("tv"),
        () => getTopRated("movie"),
        () => getTopRated("tv"),
      ];

      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const items = await randomSource();

      if (items && items.length > 0) {
        // Add some animation delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const randomItem = items[Math.floor(Math.random() * items.length)];
        setPickedItem(randomItem);
        
        toast.success(
          language === "el" 
            ? `🎲 Βρέθηκε: ${randomItem.title || randomItem.name}!` 
            : `🎲 Found: ${randomItem.title || randomItem.name}!`,
          {
            action: {
              label: language === "el" ? "Παρακολούθηση" : "Watch Now",
              onClick: () => {
                const mediaType = randomItem.first_air_date ? "tv" : "movie";
                navigate(`/${mediaType}/${randomItem.id}/watch`);
              },
            },
            duration: 8000,
          }
        );
      }
    } catch (error) {
      toast.error(language === "el" ? "Κάτι πήγε στραβά" : "Something went wrong");
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="outline"
        onClick={pickRandom}
        disabled={isSpinning}
        className="gap-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30 hover:from-pink-500/20 hover:to-purple-500/20"
      >
        {isSpinning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">
              {language === "el" ? "Ψάχνω..." : "Finding..."}
            </span>
          </>
        ) : (
          <>
            <Shuffle className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === "el" ? "Τυχαία Επιλογή" : "Random Pick"}
            </span>
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default RandomPicker;
