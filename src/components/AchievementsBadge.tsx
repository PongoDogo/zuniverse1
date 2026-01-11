import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Sparkles } from "lucide-react";
import { 
  getAchievementProgress, 
  getWatchStats, 
  WatchStats,
  Achievement
} from "@/lib/userPreferences";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

const AchievementsBadge = () => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [achievements, setAchievements] = useState<ReturnType<typeof getAchievementProgress>>();
  const [stats, setStats] = useState<WatchStats>();

  // Listen for achievement unlocks
  useEffect(() => {
    const handleAchievementUnlocked = (e: CustomEvent<Achievement>) => {
      const achievement = e.detail;
      const title = language === "el" && achievement.titleEl ? achievement.titleEl : achievement.title;
      toast.success(`🎉 ${t("achievements")}: ${title}`, {
        description: language === "el" && achievement.descriptionEl ? achievement.descriptionEl : achievement.description,
        icon: <span className="text-2xl">{achievement.icon}</span>,
        duration: 5000,
      });
      // Refresh achievements
      setAchievements(getAchievementProgress());
    };

    window.addEventListener("achievementUnlocked", handleAchievementUnlocked as EventListener);
    return () => {
      window.removeEventListener("achievementUnlocked", handleAchievementUnlocked as EventListener);
    };
  }, [language, t]);

  useEffect(() => {
    setAchievements(getAchievementProgress());
    setStats(getWatchStats());
  }, [isOpen]);

  const unlockedCount = achievements?.unlocked.length || 0;

  const getTitle = (item: { title: string; titleEl?: string }) => {
    return language === "el" && item.titleEl ? item.titleEl : item.title;
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
      >
        <Trophy className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-medium">{unlockedCount} {t("achievements")}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-md bg-card rounded-xl overflow-hidden shadow-2xl border border-border max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold">{t("achievementsAndStats")}</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-4 space-y-6">
                {/* Stats */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("yourStats")}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{stats?.moviesWatched || 0}</p>
                      <p className="text-xs text-muted-foreground">{t("moviesCount")}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{stats?.episodesWatched || 0}</p>
                      <p className="text-xs text-muted-foreground">{t("episodesCount")}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{stats?.seasonsCompleted || 0}</p>
                      <p className="text-xs text-muted-foreground">{t("seasonsCount")}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{Math.round((stats?.totalWatchTime || 0) / 60)}h</p>
                      <p className="text-xs text-muted-foreground">{t("watchTime")}</p>
                    </div>
                  </div>
                </div>

                {/* In Progress */}
                {achievements?.inProgress && achievements.inProgress.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t("inProgress")}
                    </h3>
                    <div className="space-y-3">
                      {achievements.inProgress.map((a) => (
                        <div key={a.id} className="bg-secondary/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{a.icon}</span>
                            <span className="text-sm font-medium">{getTitle(a)}</span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {a.progress}/{a.target}
                            </span>
                          </div>
                          <Progress value={(a.progress / a.target) * 100} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unlocked */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {t("unlocked")} ({unlockedCount})
                  </h3>
                  {unlockedCount === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t("startWatching")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {achievements?.unlocked.map((a) => (
                        <motion.div
                          key={a.id}
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-3 text-center"
                        >
                          <span className="text-2xl">{a.icon}</span>
                          <p className="text-[10px] font-medium mt-1 truncate">
                            {language === "el" && a.titleEl ? a.titleEl : a.title}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementsBadge;
