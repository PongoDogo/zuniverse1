import { useAuthContext } from "@/contexts/AuthContext";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const SyncStatus = () => {
  const { isSignedIn, syncInProgress } = useAuthContext();
  const { language } = useLanguage();

  if (!isSignedIn) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 bg-secondary/50 rounded-full"
      >
        <CloudOff className="w-3 h-3" />
        <span>{language === "el" ? "Τοπικά" : "Local"}</span>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {syncInProgress ? (
        <motion.div
          key="syncing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 text-xs text-primary px-2 py-1 bg-primary/10 rounded-full"
        >
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>{language === "el" ? "Συγχρονισμός..." : "Syncing..."}</span>
        </motion.div>
      ) : (
        <motion.div
          key="synced"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 text-xs text-primary px-2 py-1 bg-primary/10 rounded-full"
        >
          <Cloud className="w-3 h-3" />
          <span>{language === "el" ? "Συγχρονισμένο" : "Synced"}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SyncStatus;
