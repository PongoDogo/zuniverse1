import { useState, useEffect, useCallback } from "react";
import { Language, getLanguage, setLanguage as saveLanguage, translations } from "@/lib/i18n";

export const useLanguage = () => {
  const [language, setLanguageState] = useState<Language>(getLanguage);

  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguageState(e.detail);
    };

    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener("languageChange", handleLanguageChange as EventListener);
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    saveLanguage(lang);
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: keyof typeof translations.en): string => {
    return translations[language][key] as string;
  }, [language]);

  return { language, setLanguage, t, translations: translations[language] };
};
