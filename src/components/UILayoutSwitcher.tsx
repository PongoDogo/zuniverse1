import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, Sparkles, Star, Moon, Orbit } from "lucide-react";
import { useUILayout } from "@/hooks/useUILayout";
import { UILayout } from "@/lib/uiLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";

const layoutIcons: Record<UILayout, React.ReactNode> = {
  cinetorrio: <Sparkles className="w-4 h-4" />,
  galaxia: <Star className="w-4 h-4" />,
  cosmos: <Moon className="w-4 h-4" />,
  planitor: <Orbit className="w-4 h-4" />,
};

const layoutColors: Record<UILayout, string> = {
  cinetorrio: "from-violet-500 to-purple-600",
  galaxia: "from-red-500 to-rose-600",
  cosmos: "from-blue-500 to-cyan-500",
  planitor: "from-teal-500 to-emerald-500",
};

const UILayoutSwitcher = () => {
  const { layout, setLayout, allLayouts } = useUILayout();
  const { language } = useLanguage();

  const descriptions: Record<UILayout, { en: string; el: string }> = {
    cinetorrio: { en: "Modern & Premium", el: "Μοντέρνο & Premium" },
    galaxia: { en: "Netflix-style Bold", el: "Έντονο στυλ Netflix" },
    cosmos: { en: "Disney+ Magical", el: "Μαγικό Disney+" },
    planitor: { en: "Prime Video Clean", el: "Καθαρό Prime Video" },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          className={`p-2 rounded-lg bg-gradient-to-r ${layoutColors[layout]} text-white transition-all shadow-lg hover:shadow-xl`}
          aria-label="Switch UI Layout"
        >
          <motion.div
            key={layout}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {layoutIcons[layout]}
          </motion.div>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          {language === "el" ? "Επιλογή Interface" : "Choose Interface"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allLayouts.map((l) => (
          <DropdownMenuItem
            key={l.id}
            onClick={() => setLayout(l.id)}
            className={`flex items-center gap-3 cursor-pointer py-3 ${
              layout === l.id ? "bg-primary/10" : ""
            }`}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${layoutColors[l.id]} flex items-center justify-center text-white`}>
              {l.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{l.name}</span>
                {layout === l.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {descriptions[l.id][language === "el" ? "el" : "en"]}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UILayoutSwitcher;
