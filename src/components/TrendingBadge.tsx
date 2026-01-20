import { motion } from "framer-motion";
import { TrendingUp, Flame } from "lucide-react";

interface TrendingBadgeProps {
  rank?: number;
  type?: "trending" | "hot" | "new";
}

const TrendingBadge = ({ rank, type = "trending" }: TrendingBadgeProps) => {
  const badges = {
    trending: {
      icon: TrendingUp,
      bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
      text: "Trending",
    },
    hot: {
      icon: Flame,
      bg: "bg-gradient-to-r from-orange-500 to-red-500",
      text: "Hot",
    },
    new: {
      icon: TrendingUp,
      bg: "bg-gradient-to-r from-green-500 to-emerald-500",
      text: "New",
    },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold text-white shadow-lg ${badge.bg}`}
    >
      <Icon className="w-3 h-3" />
      {rank ? `#${rank}` : badge.text}
    </motion.div>
  );
};

export default TrendingBadge;
