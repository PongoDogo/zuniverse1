import { motion } from "framer-motion";
import { Film, Tv, Clock, Trophy } from "lucide-react";
import { useSupabaseAuthSafe } from "@/contexts/SupabaseAuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useLanguage } from "@/hooks/useLanguage";

const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => (
  <span className="tabular-nums">{value}{suffix}</span>
);

const WelcomeSection = () => {
  const { t, language } = useLanguage();
  const auth = useSupabaseAuthSafe();
  const { getWatchStats, getAchievements, getCollection } = useUserData();

  if (!auth?.isSignedIn) return null;

  const stats = getWatchStats();
  const achievements = getAchievements();
  const collection = getCollection();
  const displayName = auth.user?.email?.split("@")[0] || (language === "el" ? "Χρήστη" : "User");

  const statItems = [
    { icon: Film, value: stats.moviesWatched, label: t("moviesCount"), color: "text-blue-400", bg: "from-blue-500/20 to-blue-600/5" },
    { icon: Tv, value: stats.episodesWatched, label: t("episodesCount"), color: "text-purple-400", bg: "from-purple-500/20 to-purple-600/5" },
    { icon: Clock, value: Math.round(stats.totalWatchTime / 60), label: language === "el" ? "Ώρες" : "Hours", color: "text-green-400", bg: "from-green-500/20 to-green-600/5" },
    { icon: Trophy, value: achievements.length, label: t("achievements"), color: "text-yellow-400", bg: "from-yellow-500/20 to-yellow-600/5" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">
          {language === "el" ? `Καλώς ήρθες, ${displayName}! 👋` : `Welcome back, ${displayName}! 👋`}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {language === "el"
            ? `Έχεις ${collection.length} στοιχεία στη συλλογή σου`
            : `You have ${collection.length} items in your collection`}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className={`bg-gradient-to-br ${item.bg} rounded-xl p-3 flex items-center gap-3 border border-border/30 card-fancy backdrop-blur-sm`}
          >
            <motion.div 
              className="p-2.5 rounded-lg bg-background/40"
              whileHover={{ rotate: 12 }}
            >
              <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
            </motion.div>
            <div>
              <p className="text-lg font-bold leading-none">
                <AnimatedCounter value={item.value} />
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WelcomeSection;
