import { Check, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Movie, MovieDetails } from "@/lib/tmdb";
import { useUserData } from "@/hooks/useUserData";
import { useLanguage } from "@/hooks/useLanguage";

interface MarkAsWatchedButtonProps {
  item: Movie | MovieDetails;
  mediaType: "movie" | "tv";
  variant?: "icon" | "full";
  className?: string;
}

const MarkAsWatchedButton = ({
  item,
  mediaType,
  variant = "icon",
  className = "",
}: MarkAsWatchedButtonProps) => {
  const { isWatched, markAsWatched, unmarkAsWatched, isSignedIn } = useUserData();
  const { t } = useLanguage();
  const watched = isWatched(item.id, mediaType);

  const toggleWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error(t("signInToSync"));
      return;
    }

    if (watched) {
      await unmarkAsWatched(item.id, mediaType);
      toast.success(t("removedFromCollection"));
    } else {
      await markAsWatched(item, mediaType);
      toast.success(t("addedToCollection"));
    }
  };

  if (variant === "icon") {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleWatched}
        className={`p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-success transition-colors ${className}`}
        title={watched ? t("markAsUnwatched") : t("markAsWatched")}
      >
        {watched ? (
          <Check className="w-5 h-5 text-success" />
        ) : (
          <Eye className="w-5 h-5 text-foreground" />
        )}
      </motion.button>
    );
  }

  return (
    <Button
      variant={watched ? "default" : "secondary"}
      onClick={toggleWatched}
      className={`gap-2 ${watched ? "bg-success hover:bg-success/90 text-success-foreground" : ""} ${className}`}
    >
      {watched ? (
        <Check className="w-5 h-5" />
      ) : (
        <Eye className="w-5 h-5" />
      )}
      {watched ? t("watched") : t("markAsWatched")}
    </Button>
  );
};

export default MarkAsWatchedButton;
