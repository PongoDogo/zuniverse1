import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

const AuthButton = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { t } = useLanguage();

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 ring-2 ring-primary/30 hover:ring-primary transition-all",
              userButtonPopoverCard: "bg-background border border-border shadow-xl",
              userButtonPopoverActionButton: "hover:bg-secondary",
              userButtonPopoverFooter: "hidden",
            },
          }}
          afterSignOutUrl="/"
        />
        <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">
          {user?.firstName || user?.username || "User"}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">{t("signIn")}</span>
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm" className="gap-1.5 text-sm">
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">{t("signUp")}</span>
        </Button>
      </SignUpButton>
    </motion.div>
  );
};

export default AuthButton;
