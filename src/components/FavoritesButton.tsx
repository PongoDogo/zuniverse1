import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/tmdb";
import {
  isInFavorites,
  addToFavorites,
  removeFromFavorites,
} from "@/lib/favorites";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";

interface FavoritesButtonProps {
  item: Movie;
  mediaType: "movie" | "tv";
  variant?: "icon" | "full";
  className?: string;
}

const FavoritesButton = ({
  item,
  mediaType,
  variant = "icon",
  className = "",
}: FavoritesButtonProps) => {
  const { t } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(isInFavorites(item.id, mediaType));
  }, [item.id, mediaType]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite) {
      removeFromFavorites(item.id, mediaType);
      setIsFavorite(false);
      toast.success(t("removedFromFavorites"));
    } else {
      addToFavorites(item, mediaType);
      setIsFavorite(true);
      toast.success(t("addedToFavorites"));
    }
  };

  if (variant === "icon") {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleFavorite}
        className={`p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary transition-colors ${className}`}
        title={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
      >
        <Heart
          className={`w-5 h-5 ${
            isFavorite ? "fill-primary text-primary" : "text-foreground"
          }`}
        />
      </motion.button>
    );
  }

  return (
    <Button
      variant={isFavorite ? "default" : "secondary"}
      onClick={toggleFavorite}
      className={`gap-2 ${className}`}
    >
      <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
      {isFavorite ? t("inFavorites") : t("addToFavorites")}
    </Button>
  );
};

export default FavoritesButton;
