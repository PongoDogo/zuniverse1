import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pin } from "lucide-react";
import { isPinned, pinItem, unpinItem, PinnedItem } from "@/lib/userPreferences";
import { toast } from "sonner";

interface PinButtonProps {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  className?: string;
}

const PinButton = ({ id, mediaType, title, poster_path, backdrop_path, className = "" }: PinButtonProps) => {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    setPinned(isPinned(id, mediaType));
  }, [id, mediaType]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (pinned) {
      unpinItem(id, mediaType);
      setPinned(false);
      toast.success("Removed from pinned");
    } else {
      pinItem({ id, mediaType, title, poster_path, backdrop_path });
      setPinned(true);
      toast.success("Pinned to home");
    }
  };

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
