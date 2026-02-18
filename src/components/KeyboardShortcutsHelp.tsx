import { useState } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";

const shortcuts = [
  { keys: ["Ctrl", "K"], en: "Open search", el: "Άνοιγμα αναζήτησης" },
  { keys: ["/"], en: "Quick search", el: "Γρήγορη αναζήτηση" },
  { keys: ["Esc"], en: "Close dialog / menu", el: "Κλείσιμο διαλόγου / μενού" },
  { keys: ["Alt", "1-6"], en: "Navigate pages", el: "Πλοήγηση σελίδων" },
  { keys: ["F"], en: "Fullscreen (player)", el: "Πλήρης οθόνη (player)" },
  { keys: ["N"], en: "Next episode (player)", el: "Επόμενο επεισόδιο (player)" },
];

const KeyboardShortcutsHelp = () => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors"
          title={language === "el" ? "Συντομεύσεις" : "Shortcuts"}
        >
          <Keyboard className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {language === "el" ? "Συντομεύσεις Πληκτρολογίου" : "Keyboard Shortcuts"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {language === "el" ? s.el : s.en}
              </span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-1 text-xs font-mono rounded bg-secondary border border-border"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;
