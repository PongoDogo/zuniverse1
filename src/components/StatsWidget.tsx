import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Film, Tv, Clock, TrendingUp, Eye } from "lucide-react";
import { getWatchStats, WatchStats } from "@/lib/userPreferences";
import { getContinueWatching, getWatchlist } from "@/lib/watchlist";
import { useLanguage } from "@/hooks/useLanguage";

const StatsWidget = () => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<WatchStats | null>(null);
  const [continueCount, setContinueCount] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(0);

  useEffect(() => {
    setStats(getWatchStats());
    setContinueCount(getContinueWatching().length);
    setWatchlistCount(getWatchlist().length);
  }, []);

  if (!stats) return null;

  const statItems = [
    {
      icon: Film,
      value: stats.moviesWatched,
      label: language === "el" ? "Ταινίες" : "Movies",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Tv,
      value: stats.episodesWatched,
      label: language === "el" ? "Επεισόδια" : "Episodes",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      icon: Clock,
      value: `${Math.round(stats.totalWatchTime / 60)}h`,
      label: language === "el" ? "Χρόνος" : "Watch Time",
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      icon: Eye,
      value: continueCount,
      label: language === "el" ? "Σε εξέλιξη" : "In Progress",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  // Only show if user has some activity
  if (stats.moviesWatched === 0 && stats.episodesWatched === 0 && continueCount === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
    >
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className={`${item.bg} rounded-xl p-3 sm:p-4 flex items-center gap-3`}
        >
          <div className={`p-2 rounded-lg ${item.bg}`}>
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsWidget;
