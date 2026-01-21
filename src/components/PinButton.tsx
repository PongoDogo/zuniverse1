import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pin } from "lucide-react";
import { isPinned, pinItem, unpinItem } from "@/lib/userPreferences";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PinButtonProps {
  item: {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
  mediaType: "movie" | "tv";
  className?: string;
  variant?: "icon" | "full";
}

const PinButton = ({ item, mediaType, className = "", variant = "icon" }: PinButtonProps) => {
  const [pinned, setPinned] = useState(false);
  const title = item.title || item.name || "Unknown";

  useEffect(() => {
    setPinned(isPinned(item.id, mediaType));
  }, [item.id, mediaType]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (pinned) {
      unpinItem(item.id, mediaType);
      setPinned(false);
      toast.success("Removed from pinned");
    } else {
      pinItem({ 
        id: item.id, 
        mediaType, 
        title, 
        poster_path: item.poster_path, 
        backdrop_path: item.backdrop_path 
      });
      setPinned(true);
      toast.success("Pinned to home");
    }
  };

  if (variant === "full") {
    return (
      <Button
        variant={pinned ? "default" : "outline"}
        size="lg"
        onClick={handleClick}
        className={`gap-2 h-12 ${className}`}
      >
        <Pin className={`w-4 h-4 ${pinned ? "fill-current" : ""}`} />
        {pinned ? "Pinned" : "Pin"}
      </Button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={`p-2 rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-primary ${className}`}
      aria-label={pinned ? "Unpin from home" : "Pin to home"}
    >
      <Pin
        className={`w-4 h-4 transition-colors ${
          pinned ? "fill-primary text-primary" : "text-foreground"
        }`}
      />
    </motion.button>
  );
};

export default PinButton;
