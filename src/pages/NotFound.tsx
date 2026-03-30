import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background gradient-mesh">
        <Navbar />
        <div className="flex min-h-[80vh] items-center justify-center px-4 pt-16">
          <div className="text-center max-w-lg">
            {/* Animated 404 */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="mb-8"
            >
              <h1 className="text-[120px] sm:text-[160px] font-black leading-none text-gradient select-none"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                404
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="empty-state-icon mx-auto">
                <Film className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Scene Not Found</h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                This scene doesn't exist in our script. Let's get you back to the main feature.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <Button asChild size="lg" className="gap-2">
                <Link to="/"><Home className="w-4 h-4" /> Go Home</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="gap-2">
                <Link to="/search"><Search className="w-4 h-4" /> Search</Link>
              </Button>
              <Button variant="outline" size="lg" className="gap-2" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" /> Go Back
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
