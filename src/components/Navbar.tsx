import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  Film,
  Tv,
  Home,
  Compass,
  Heart,
  Sparkles,
  Star,
  Moon,
  Orbit,
  Settings2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import ThemeSwitcher from "./ThemeSwitcher";
import NotificationCenter from "./NotificationCenter";
import LanguageSwitcher from "./LanguageSwitcher";
import UILayoutSwitcher from "./UILayoutSwitcher";
import SupabaseAuthButton from "./SupabaseAuthButton";
import SyncStatus from "./SyncStatus";
import KeyboardShortcutsHelp from "./KeyboardShortcutsHelp";
import { useLanguage } from "@/hooks/useLanguage";
import { useUILayout } from "@/hooks/useUILayout";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { t } = useLanguage();
  const { layout } = useUILayout();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let rafId = 0;
    let ticking = false;
    const update = () => {
      const next = window.scrollY > 24;
      setIsScrolled((prev) => (prev === next ? prev : next));
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
      }
    };
    const onOpen = () => setIsSearchOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("openSearch", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("openSearch", onOpen);
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
  const isSurfaceActive = isScrolled || isMenuOpen || isSearchOpen;

  const layoutLogos: Record<string, { icon: React.ReactNode; name: string; gradient: string }> = {
    cinetorrio: {
      icon: <Sparkles className="w-4 h-4 text-primary-foreground" />,
      name: "CineTorrio",
      gradient: "from-violet-600 to-purple-700",
    },
    galaxia: {
      icon: <Star className="w-4 h-4 text-primary-foreground" />,
      name: "Galaxia",
      gradient: "from-red-600 to-rose-700",
    },
    cosmos: {
      icon: <Moon className="w-4 h-4 text-primary-foreground" />,
      name: "Cosmos",
      gradient: "from-blue-500 to-cyan-600",
    },
    planitor: {
      icon: <Orbit className="w-4 h-4 text-primary-foreground" />,
      name: "Planitor",
      gradient: "from-teal-500 to-emerald-600",
    },
  };

  const currentLogo = layoutLogos[layout] || layoutLogos.cinetorrio;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-[background,border-color,backdrop-filter] duration-300 safe-top",
          isSurfaceActive
            ? "bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-[0_8px_30px_-12px_hsl(var(--background)/0.6)]"
            : "bg-gradient-to-b from-background/70 via-background/30 to-transparent border-b border-transparent"
        )}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Logo — compact */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                  "shadow-[0_4px_14px_-2px_hsl(var(--primary)/0.45)] transition-transform group-hover:scale-105",
                  currentLogo.gradient
                )}
              >
                {currentLogo.icon}
              </div>
              <span className="text-sm sm:text-base font-bold tracking-tight hidden xs:block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {currentLogo.name}
              </span>
            </Link>

            {/* Desktop Nav — segmented pill */}
            <div className="hidden md:flex items-center p-0.5 rounded-full bg-muted/30 border border-border/40 backdrop-blur-md">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-full bg-primary shadow-[0_4px_14px_-2px_hsl(var(--primary)/0.6)]" />
                    )}
                    <span className="relative">{t(link.labelKey)}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-1">
              {isSearchOpen ? (
                <form
                  onSubmit={handleSearch}
                  className="absolute left-3 right-12 top-1/2 -translate-y-1/2 sm:relative sm:left-auto sm:right-auto sm:top-auto sm:translate-y-0 sm:w-[240px] z-50"
                >
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t("searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-muted/40 border-border/50 focus-visible:ring-primary h-8 pl-8 text-xs rounded-full"
                      autoFocus
                    />
                  </div>
                </form>
              ) : null}

              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="h-8 w-8 sm:w-auto sm:px-2.5 rounded-full hover:bg-muted/60 transition-colors flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground"
                aria-label={isSearchOpen ? "Close search" : "Open search"}
              >
                {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                {!isSearchOpen && (
                  <span className="hidden lg:inline text-[10px] tabular-nums border border-border/60 rounded px-1 py-0.5 leading-none">
                    ⌘K
                  </span>
                )}
              </button>

              {/* Desktop: notifications, auth visible; rest collapsed into a Settings popover */}
              <div className="hidden sm:flex items-center gap-0.5">
                <SyncStatus />
                <NotificationCenter />

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="h-8 w-8 rounded-full hover:bg-muted/60 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label="Quick settings"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={10}
                    className="w-[260px] p-3 border-border/60 bg-popover/95 backdrop-blur-xl"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                      Quick Settings
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center justify-center"><ThemeSwitcher /></div>
                      <div className="flex items-center justify-center"><LanguageSwitcher /></div>
                      <div className="flex items-center justify-center"><UILayoutSwitcher /></div>
                      <div className="flex items-center justify-center"><KeyboardShortcutsHelp /></div>
                    </div>
                    <Separator className="my-2.5" />
                    <Link
                      to="/profile"
                      className="block text-center text-xs font-medium py-1.5 rounded-md hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      All Settings →
                    </Link>
                  </PopoverContent>
                </Popover>

                <div className="ml-0.5">
                  <SupabaseAuthButton />
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-8 w-8 rounded-full hover:bg-muted/60 transition-colors flex items-center justify-center md:hidden text-muted-foreground hover:text-foreground"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/96 backdrop-blur-xl md:hidden pt-14 safe-top performance-page-enter">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center gap-2 mb-6 pb-4 border-b border-border/40">
              <SyncStatus />
              <UILayoutSwitcher />
              <LanguageSwitcher />
              <ThemeSwitcher />
              <NotificationCenter />
              <SupabaseAuthButton />
            </div>

            <div className="space-y-1.5">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors text-base animate-fade-in",
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground shadow-[0_6px_20px_-8px_hsl(var(--primary)/0.7)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <link.icon className="w-5 h-5" />
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
