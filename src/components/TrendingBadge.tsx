import { motion } from "framer-motion";
import { TrendingUp, Flame, Sparkles } from "lucide-react";

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
      icon: Sparkles,
      bg: "bg-gradient-to-r from-green-500 to-emerald-500",
      text: "New",
    },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -12 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      whileHover={{ scale: 1.1 }}
      className={`badge-neon inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white ${badge.bg}`}
    >
      <Icon className="w-3 h-3" />
      {rank ? `#${rank}` : badge.text}
    </motion.div>
  );
};

export default TrendingBadge;
