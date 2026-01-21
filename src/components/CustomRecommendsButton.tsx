import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

const CustomRecommendsButton = () => {
  const { language } = useLanguage();

  const handleClick = () => {
    window.open("https://cinetorriovault.lovable.app", "_blank");
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 safe-bottom">
      <Button
        onClick={handleClick}
        size="lg"
        className="gap-2 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-6 glow-shadow"
      >
        <Sparkles className="w-5 h-5" />
        {language === "el" ? "Προσαρμοσμένες Προτάσεις" : "Custom Recommends"}
      </Button>
    </div>
  );
};

export default CustomRecommendsButton;
