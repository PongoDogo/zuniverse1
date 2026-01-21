import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, Heart, Pin, ChevronUp, X } from "lucide-react";
import { getContinueWatching, ContinueWatchingItem, getWatchlist, WatchlistItem } from "@/lib/watchlist";
import { getPinnedItems, PinnedItem } from "@/lib/userPreferences";
import { getImageUrl } from "@/lib/tmdb";
import { useLanguage } from "@/hooks/useLanguage";

type Tab = "continue" | "watchlist" | "pinned";

const QuickAccessBar = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("continue");
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [pinned, setPinned] = useState<PinnedItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setContinueWatching(getContinueWatching().slice(0, 5));
      setWatchlist(getWatchlist().slice(0, 5));
      setPinned(getPinnedItems());
    }
  }, [isOpen]);

  const tabs = [
    { id: "continue" as Tab, label: t("continueWatching").split(" ")[0], icon: Play, count: continueWatching.length },
    { id: "watchlist" as Tab, label: t("favorites"), icon: Heart, count: watchlist.length },
    { id: "pinned" as Tab, label: t("pinned"), icon: Pin, count: pinned.length },
  ];

  const getActiveItems = () => {
    switch (activeTab) {
      case "continue":
        return continueWatching.map(item => ({
          id: item.id,
          mediaType: item.mediaType,
          title: item.title,
          image: item.backdrop_path || item.poster_path,
          subtitle: item.mediaType === "tv" ? `S${item.season} E${item.episode}` : `${Math.round((item.duration - item.currentTime) / 60)}m`,
          link: item.mediaType === "tv" 
            ? `/tv/${item.id}/watch/${item.season}/${item.episode}` 
            : `/movie/${item.id}/watch`,
          progress: item.progress,
        }));
      case "watchlist":
        return watchlist.map(item => ({
          id: item.id,
          mediaType: item.mediaType,
          title: item.title || item.name || "Unknown",
          image: item.poster_path,
          subtitle: item.mediaType === "tv" ? t("tvShows") : t("movies"),
          link: `/${item.mediaType}/${item.id}`,
        }));
      case "pinned":
        return pinned.map(item => ({
          id: item.id,
          mediaType: item.mediaType,
          title: item.title,
          image: item.poster_path || item.backdrop_path,
          subtitle: item.mediaType === "tv" ? t("tvShows") : t("movies"),
          link: `/${item.mediaType}/${item.id}`,
        }));
      default:
        return [];
    }
  };

  const items = getActiveItems();

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary shadow-lg flex items-center justify-center glow-shadow"
        aria-label={t("quickAccess")}
      >
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-80 max-h-[60vh] bg-card rounded-xl overflow-hidden shadow-2xl border border-border"
            >
              <div className="flex border-b border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === tab.id ? "text-primary border-b-2 border-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {tab.count > 0 && <span className="px-1.5 py-0.5 text-[10px] bg-muted rounded-full">{tab.count}</span>}
                  </button>
                ))}
              </div>
              <div className="max-h-[calc(60vh-50px)] overflow-y-auto p-2 space-y-1">
                {items.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">{t("noResults")}</div>
                ) : (
                  items.map((item) => (
                    <Link
                      key={`${item.mediaType}-${item.id}`}
                      to={item.link}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/60 transition-colors group"
                    >
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <img src={getImageUrl(item.image, "w200")} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                        {"progress" in item && item.progress && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                            <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                      <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickAccessBar;
