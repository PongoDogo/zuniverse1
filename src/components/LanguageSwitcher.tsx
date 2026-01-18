import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { Language } from "@/lib/i18n";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; flag: string; label: string }[] = [
    { code: "en", flag: "🇬🇧", label: "EN" },
    { code: "el", flag: "🇬🇷", label: "ΕΛ" },
  ];

  const currentIndex = languages.findIndex(l => l.code === language);

  const handleToggle = () => {
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-200 group"
      aria-label="Toggle language"
    >
      <motion.span
        key={language}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="text-lg leading-none"
      >
        {languages[currentIndex].flag}
      </motion.span>
      <motion.span
        key={`label-${language}`}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors"
      >
        {languages[currentIndex].label}
      </motion.span>
    </button>
  );
};

export default LanguageSwitcher;