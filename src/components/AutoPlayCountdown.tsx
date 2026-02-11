import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

interface AutoPlayCountdownProps {
  seconds?: number;
  onComplete: () => void;
  onCancel: () => void;
  nextEpisodeName?: string;
}

const AutoPlayCountdown = ({
  seconds = 10,
  onComplete,
  onCancel,
  nextEpisodeName,
}: AutoPlayCountdownProps) => {
  const [remaining, setRemaining] = useState(seconds);
  const { language } = useLanguage();

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex items-center gap-3 p-4 bg-card/95 backdrop-blur-sm rounded-xl border border-primary/30 shadow-lg"
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
          <circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - remaining / seconds)}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          {remaining}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {language === "el" ? "Επόμενο επεισόδιο σε" : "Next episode in"} {remaining}s
        </p>
        {nextEpisodeName && (
          <p className="text-xs text-muted-foreground truncate">{nextEpisodeName}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button size="sm" onClick={onComplete} className="gap-1.5">
          <SkipForward className="w-3.5 h-3.5" />
          {language === "el" ? "Τώρα" : "Now"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default AutoPlayCountdown;
