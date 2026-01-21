import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Loader2, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

// Clerk publishable key (safe to include in frontend code)
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_YWxpdmUtaHVtcGJhY2stMC5jbGVyay5hY2NvdW50cy5kZXYk";
const clerkAvailable = !!clerkPubKey;

// Component for when Clerk is not available
const AuthButtonDisabled = () => {
  const { language } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <Button variant="ghost" size="sm" className="gap-1.5 text-sm opacity-50" disabled>
        <CloudOff className="w-4 h-4" />
        <span className="hidden sm:inline">{language === "el" ? "Εκτός σύνδεσης" : "Auth Unavailable"}</span>
      </Button>
    </motion.div>
  );
};

// Component for when Clerk is available
const AuthButtonWithClerk = () => {
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

const AuthButton = () => {
  // If Clerk is not available, show disabled state
  if (!clerkAvailable) {
    return <AuthButtonDisabled />;
  }

  return <AuthButtonWithClerk />;
};

export default AuthButton;
