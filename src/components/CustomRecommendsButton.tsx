import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsMobile } from "@/hooks/use-mobile";

const CustomRecommendsButton = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  const handleClick = () => {
    window.open("https://cinetorriovault.lovable.app", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 safe-bottom">
      <div className="relative group">
        {!isMobile && (
          <div className="absolute inset-0 rounded-full bg-primary/25 blur-xl opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
        )}
        <Button
          onClick={handleClick}
          size="lg"
          variant="premium"
          className="relative gap-2 rounded-full shadow-lg px-6 btn-ripple border border-primary/20"
        >
          <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          {language === "el" ? "Προσαρμοσμένες Προτάσεις" : "Custom Recommends"}
        </Button>
      </div>
    </div>
  );
};

export default CustomRecommendsButton;
