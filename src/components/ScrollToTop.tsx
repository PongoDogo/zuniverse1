import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Rocket } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    setIsLaunching(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setIsLaunching(false), 800);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0, rotate: 180 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center scroll-top-btn"
          aria-label="Scroll to top"
        >
          <motion.div
            animate={isLaunching ? { y: [-2, -20], opacity: [1, 0] } : { y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Rocket className="w-5 h-5" />
          </motion.div>
          
          {/* Particle trail on launch */}
          {isLaunching && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                  initial={{ opacity: 1, y: 0, x: 0 }}
                  animate={{ 
                    opacity: 0, 
                    y: [0, 20 + i * 8], 
                    x: [(i - 1) * 4, (i - 1) * 8],
                    scale: [1, 0]
                  }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                />
              ))}
            </>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
