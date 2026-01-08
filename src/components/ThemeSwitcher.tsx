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
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors"
          aria-label="Switch theme"
        >
          {currentTheme.icon}
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`flex items-center gap-2 cursor-pointer ${
              theme === t.value ? "bg-primary/20 text-primary" : ""
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
