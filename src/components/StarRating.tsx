import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number) => void;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  className?: string;
}

const StarRating = ({
  value,
  onChange,
  maxStars = 10,
  size = "md",
  readonly = false,
  className = "",
}: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value ?? 0;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const gapClasses = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5",
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      // Allow toggling off if clicking the same star
      if (rating === value) {
        onChange(0);
      } else {
        onChange(rating);
      }
    }
  };

  return (
    <div
      className={cn("flex items-center", gapClasses[size], className)}
      onMouseLeave={() => !readonly && setHoverValue(null)}
    >
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayValue;
        const isHalf = starValue - 0.5 === displayValue;

        return (
          <motion.button
            key={index}
            type="button"
            disabled={readonly}
            whileHover={readonly ? {} : { scale: 1.15 }}
            whileTap={readonly ? {} : { scale: 0.95 }}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            className={cn(
              "transition-colors focus:outline-none",
              readonly ? "cursor-default" : "cursor-pointer"
            )}
            aria-label={`Rate ${starValue} out of ${maxStars}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                isFilled
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-muted-foreground hover:text-yellow-500/50"
              )}
            />
          </motion.button>
        );
      })}
      {value !== null && value > 0 && (
        <span className={cn(
          "ml-2 font-medium text-muted-foreground",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base"
        )}>
          {value}/{maxStars}
        </span>
      )}
    </div>
  );
};

export default StarRating;
