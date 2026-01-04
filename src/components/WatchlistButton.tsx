import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/tmdb";
import {
  isInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/watchlist";

interface WatchlistButtonProps {
  item: Movie;
  mediaType: "movie" | "tv";
  variant?: "icon" | "full";
  className?: string;
}

const WatchlistButton = ({
  item,
  mediaType,
  variant = "icon",
  className = "",
}: WatchlistButtonProps) => {
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    setInWatchlist(isInWatchlist(item.id, mediaType));
  }, [item.id, mediaType]);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWatchlist) {
      removeFromWatchlist(item.id, mediaType);
      setInWatchlist(false);
      toast.success("Removed from watchlist");
    } else {
      addToWatchlist(item, mediaType);
      setInWatchlist(true);
      toast.success("Added to watchlist");
    }
  };

  if (variant === "icon") {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleWatchlist}
        className={`p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary transition-colors ${className}`}
      >
        <Heart
          className={`w-5 h-5 ${
            inWatchlist ? "fill-primary text-primary" : "text-foreground"
          }`}
        />
      </motion.button>
    );
  }

  return (
    <Button
      variant={inWatchlist ? "default" : "secondary"}
      onClick={toggleWatchlist}
      className={`gap-2 ${className}`}
    >
      <Heart
        className={`w-5 h-5 ${inWatchlist ? "fill-current" : ""}`}
      />
      {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
    </Button>
  );
};

export default WatchlistButton;
