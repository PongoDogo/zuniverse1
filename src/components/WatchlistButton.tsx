import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/tmdb";
import { useUserData } from "@/hooks/useUserData";

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
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserData();
  const inWatchlist = isInWatchlist(item.id, mediaType);

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWatchlist) {
      await removeFromWatchlist(item.id, mediaType);
      toast.success("Removed from watchlist");
    } else {
      await addToWatchlist(item, mediaType);
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
