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
    { icon: Film, value: stats.moviesWatched, label: t("moviesCount"), color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: Tv, value: stats.episodesWatched, label: t("episodesCount"), color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: Clock, value: Math.round(stats.totalWatchTime / 60), label: language === "el" ? "Ώρες" : "Hours", color: "text-green-400", bg: "bg-green-500/10" },
    { icon: Trophy, value: achievements.length, label: t("achievements"), color: "text-yellow-400", bg: "bg-yellow-500/10" },
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`${item.bg} rounded-xl p-3 flex items-center gap-3`}
          >
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
            </div>
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
