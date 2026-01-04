import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getVideos } from "@/lib/tmdb";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
}

const TrailerModal = ({
  isOpen,
  onClose,
  mediaType,
  mediaId,
  title,
}: TrailerModalProps) => {
  const { data: videos } = useQuery({
    queryKey: ["videos", mediaType, mediaId],
    queryFn: () => getVideos(mediaType, mediaId),
    enabled: isOpen && !!mediaId,
  });

  const trailer = videos?.find(
    (v) => v.type === "Trailer" || v.type === "Teaser"
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl aspect-video bg-card rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {trailer ? (
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground">
                  No trailer available for {title}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrailerModal;
