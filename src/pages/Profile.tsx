import { useState } from "react";
import { motion } from "framer-motion";
import { User, Settings, BarChart3, Trophy, LogOut, Mail, Save, Palette } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import UILayoutSwitcher from "@/components/UILayoutSwitcher";
import { useSupabaseAuthSafe } from "@/contexts/SupabaseAuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = [
  "hsl(262, 83%, 58%)", "hsl(0, 85%, 50%)", "hsl(210, 100%, 55%)",
  "hsl(35, 95%, 55%)", "hsl(142, 76%, 36%)", "hsl(280, 70%, 50%)",
];

const Profile = () => {
  const { t, language } = useLanguage();
  const auth = useSupabaseAuthSafe();
  const { getWatchStats, getAchievements, getCollection } = useUserData();
  const [displayName, setDisplayName] = useState(auth?.user?.email?.split("@")[0] || "");

  if (!auth?.isSignedIn) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background gradient-mesh">
          <Navbar />
          <div className="pt-24 pb-16 container mx-auto px-4">
            <div className="empty-state">
              <div className="empty-state-icon">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t("signIn")}</h2>
              <p className="text-muted-foreground">{t("signInToSync")}</p>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const stats = getWatchStats();
  const achievements = getAchievements();
  const collection = getCollection();

  const genreMap: Record<string, number> = {};
  collection.forEach((item) => {
    item.genre_ids.forEach((gid) => {
      const name = gid.toString();
      genreMap[name] = (genreMap[name] || 0) + 1;
    });
  });
  const genreData = Object.entries(genreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name: `Genre ${name}`, value }));

  const watchData = [
    { name: t("moviesCount"), value: stats.moviesWatched },
    { name: t("episodesCount"), value: stats.episodesWatched },
    { name: t("seasonsCount"), value: stats.seasonsCompleted },
  ];

  const handleSaveName = () => {
    toast.success(language === "el" ? "Το όνομα αποθηκεύτηκε" : "Display name saved");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background gradient-mesh">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-5 p-6 rounded-2xl glass-premium">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-bold glow-shadow shrink-0"
              >
                {(auth.user?.email?.[0] || "U").toUpperCase()}
              </motion.div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold truncate">{displayName}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{auth.user?.email}</span>
                </p>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="stats" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="stats" className="gap-2 text-xs sm:text-sm">
                <BarChart3 className="w-4 h-4" /> {t("watchStatistics")}
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2 text-xs sm:text-sm">
                <Trophy className="w-4 h-4" /> {t("achievements")}
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 text-xs sm:text-sm">
                <Settings className="w-4 h-4" /> {t("preferences")}
              </TabsTrigger>
            </TabsList>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: t("moviesCount"), value: stats.moviesWatched, color: "from-blue-500/20 to-blue-600/5", textColor: "text-blue-400" },
                  { label: t("episodesCount"), value: stats.episodesWatched, color: "from-purple-500/20 to-purple-600/5", textColor: "text-purple-400" },
                  { label: t("seasonsCount"), value: stats.seasonsCompleted, color: "from-green-500/20 to-green-600/5", textColor: "text-green-400" },
                  { label: t("hours"), value: Math.round(stats.totalWatchTime / 60), color: "from-orange-500/20 to-orange-600/5", textColor: "text-orange-400" },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className={`bg-gradient-to-br ${s.color} border-border/30 stat-card`}>
                      <CardContent className="p-4 text-center">
                        <p className={`text-3xl font-bold ${s.textColor}`}>{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="glass-panel border-border/30">
                <CardHeader><CardTitle className="text-sm section-heading">{t("watchStatistics")}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={watchData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {genreData.length > 0 && (
                <Card className="glass-panel border-border/30">
                  <CardHeader><CardTitle className="text-sm section-heading">{t("genreBreakdown")}</CardTitle></CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={genreData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                          {genreData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              {achievements.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Trophy className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">{t("startWatching")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {achievements.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="text-center card-elevated border-border/30">
                        <CardContent className="p-4">
                          <span className="text-3xl block mb-2">{a.icon}</span>
                          <p className="font-semibold text-sm">{a.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card className="glass-panel border-border/30">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4" /> {t("displayName")}</CardTitle></CardHeader>
                <CardContent className="flex gap-3">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t("displayName")}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveName} size="icon" className="shrink-0"><Save className="w-4 h-4" /></Button>
                </CardContent>
              </Card>

              <Card className="glass-panel border-border/30">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Palette className="w-4 h-4" /> {t("preferences")}</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <ThemeSwitcher />
                  <LanguageSwitcher />
                  <UILayoutSwitcher />
                </CardContent>
              </Card>

              <Card className="glass-panel border-border/30">
                <CardHeader><CardTitle className="text-sm">{t("accountManagement")}</CardTitle></CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    onClick={() => auth.signOut()}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" /> {t("signOut")}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
