import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

const CustomRecommendsButton = () => {
  const { language } = useLanguage();

  const handleClick = () => {
    window.open("https://cinetorriovault.lovable.app", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 safe-bottom">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        {/* Animated glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-primary opacity-50 blur-lg animated-gradient" />
        
        <Button
          onClick={handleClick}
          size="lg"
          className="relative gap-2 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-6 btn-neon btn-ripple"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
          {language === "el" ? "Προσαρμοσμένες Προτάσεις" : "Custom Recommends"}
        </Button>
      </motion.div>
    </div>
  );
};

export default CustomRecommendsButton;
