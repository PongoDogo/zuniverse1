import { useState, useEffect } from "react";
import { SkipForward, X, Play } from "lucide-react";
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

  const progress = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="relative overflow-hidden rounded-2xl performance-surface-strong shadow-2xl shadow-primary/10 performance-page-enter">
      {/* Progress bar bg */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-secondary/30">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/60"
          style={{ width: `${progress}%`, transition: "width 1s linear" }}
        />
      </div>

      <div className="flex items-center gap-4 p-4 sm:p-5">
        {/* Countdown circle */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" opacity="0.3" />
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - remaining / seconds)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
              style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.5))" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold tabular-nums">
            {remaining}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 fill-current text-primary" />
            {language === "el" ? "Επόμενο επεισόδιο" : "Next episode"}
          </p>
          {nextEpisodeName && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">"{nextEpisodeName}"</p>
          )}
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {language === "el" ? `σε ${remaining} δευτερόλεπτα...` : `in ${remaining} seconds...`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onComplete} className="gap-1.5 rounded-xl shadow-lg shadow-primary/20">
            <SkipForward className="w-3.5 h-3.5" />
            {language === "el" ? "Τώρα" : "Now"}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel} className="rounded-xl h-9 w-9 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AutoPlayCountdown;
