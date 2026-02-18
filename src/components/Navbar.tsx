import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X, Film, Tv, Home, Compass, Heart, Sparkles, Star, Moon, Orbit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import ThemeSwitcher from "./ThemeSwitcher";
import NotificationCenter from "./NotificationCenter";
import LanguageSwitcher from "./LanguageSwitcher";
import UILayoutSwitcher from "./UILayoutSwitcher";
import SupabaseAuthButton from "./SupabaseAuthButton";
import SyncStatus from "./SyncStatus";
import KeyboardShortcutsHelp from "./KeyboardShortcutsHelp";
import { useLanguage } from "@/hooks/useLanguage";
import { useUILayout } from "@/hooks/useUILayout";

const Navbar = () => {
  const { t } = useLanguage();
  const { layout, config } = useUILayout();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Ctrl+K keyboard shortcut + openSearch event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
      }
    };
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("openSearch", handleOpenSearch);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("openSearch", handleOpenSearch);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { href: "/", labelKey: "home" as const, icon: Home },
    { href: "/movies", labelKey: "movies" as const, icon: Film },
    { href: "/tv", labelKey: "tvShows" as const, icon: Tv },
    { href: "/discover", labelKey: "discover" as const, icon: Compass },
    { href: "/favorites", labelKey: "favorites" as const, icon: Heart },
    { href: "/collection", labelKey: "myCollection" as const, icon: Sparkles },
  ];

  const isActive = (href: string) => location.pathname === href;

  // Dynamic logo based on layout
  const layoutLogos: Record<string, { icon: React.ReactNode; name: string; gradient: string }> = {
    cinetorrio: { 
      icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, 
      name: "CineTorrio",
      gradient: "from-violet-600 to-purple-700"
    },
    galaxia: { 
      icon: <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, 
      name: "Galaxia",
      gradient: "from-red-600 to-rose-700"
    },
    cosmos: { 
      icon: <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, 
      name: "Cosmos",
      gradient: "from-blue-500 to-cyan-600"
    },
    planitor: { 
      icon: <Orbit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, 
      name: "Planitor",
      gradient: "from-teal-500 to-emerald-600"
    },
  };

  const currentLogo = layoutLogos[layout] || layoutLogos.cinetorrio;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-top ${
          isScrolled || isMenuOpen ? "glass" : "bg-gradient-to-b from-background/80 to-transparent"
        }`}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Dynamic Logo based on Layout */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <motion.div 
                key={layout}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${currentLogo.gradient} flex items-center justify-center glow-shadow`}
              >
                {currentLogo.icon}
              </motion.div>
              <motion.span 
                key={`name-${layout}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg sm:text-xl font-bold hidden xs:block text-gradient"
              >
                {currentLogo.name}
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>

            {/* Search, Language, Theme, Profile & Menu */}
            <div className="flex items-center gap-1 sm:gap-2">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    style={{ originX: 1 }}
                    onSubmit={handleSearch}
                    className="absolute left-3 right-14 top-1/2 -translate-y-1/2 sm:relative sm:left-auto sm:right-auto sm:top-auto sm:translate-y-0 sm:w-[250px]"
                  >
                    <Input
                      type="text"
                      placeholder={t("searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-secondary border-0 focus-visible:ring-primary h-10"
                      autoFocus
                    />
                  </motion.form>
                )}
              </AnimatePresence>
              
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 rounded-lg hover:bg-secondary transition-colors flex items-center gap-1"
                aria-label={isSearchOpen ? "Close search" : "Open search"}
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : (
                  <>
                    <Search className="w-5 h-5" />
                    <span className="hidden lg:inline text-[10px] text-muted-foreground border border-border rounded px-1 py-0.5">
                      {t("searchShortcut")}
                    </span>
                  </>
                )}
              </button>

              {/* UI Layout, Language, Theme, Notifications, Auth - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-1">
                <SyncStatus />
                <KeyboardShortcutsHelp />
                <UILayoutSwitcher />
                <LanguageSwitcher />
                <ThemeSwitcher />
                <NotificationCenter />
                <SupabaseAuthButton />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-lg hover:bg-secondary transition-colors md:hidden"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation - Full Screen Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg md:hidden pt-16 safe-top"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="container mx-auto px-4 py-6"
            >
              {/* Mobile Settings Row */}
              <div className="flex items-center justify-center gap-2 mb-6 pb-4 border-b border-border">
                <SyncStatus />
                <UILayoutSwitcher />
                <LanguageSwitcher />
                <ThemeSwitcher />
                <NotificationCenter />
                <SupabaseAuthButton />
              </div>

              <div className="space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-colors text-lg ${
                        isActive(link.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <link.icon className="w-6 h-6" />
                      {t(link.labelKey)}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
