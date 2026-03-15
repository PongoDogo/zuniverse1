import { Moon, Sun, Clapperboard } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/lib/userPreferences";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
  { value: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
  { value: "cinematic", label: "Cinematic", icon: <Clapperboard className="w-4 h-4" /> },
];

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.9, rotate: -15 }}
          whileHover={{ scale: 1.05 }}
          className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
          aria-label="Switch theme"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {currentTheme.icon}
          </motion.div>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px] glass-panel">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`flex items-center gap-3 cursor-pointer transition-all duration-200 ${
              theme === t.value ? "bg-primary/15 text-primary font-medium" : "hover:bg-secondary"
            }`}
          >
            <span className={`transition-transform duration-200 ${theme === t.value ? "scale-110" : ""}`}>
              {t.icon}
            </span>
            <span>{t.label}</span>
            {theme === t.value && (
              <motion.div
                layoutId="theme-indicator"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
