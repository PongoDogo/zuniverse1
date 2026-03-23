import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Loader2, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { lovable } from "@/integrations/lovable/index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const SupabaseAuthButton = () => {
  const { user, isLoading, isSignedIn, signIn, signUp, signOut, userData } = useSupabaseAuth();
  const { t, language } = useLanguage();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
    } catch (e) {
      console.error("Google sign-in error:", e);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (!error) {
      setIsSignInOpen(false);
      setEmail("");
      setPassword("");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (!error) {
      setIsSignUpOpen(false);
      setEmail("");
      setPassword("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isSignedIn && user) {
    const displayName = userData?.preferences?.display_name || user.email?.split("@")[0] || "User";
    const avatarUrl = userData?.preferences?.avatar_url;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 px-2">
              <Avatar className="w-7 h-7 ring-2 ring-primary/30">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2">
              <User className="w-4 h-4" />
              {user.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive">
              <LogOut className="w-4 h-4" />
              {language === "el" ? "Αποσύνδεση" : "Sign Out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">{t("signIn")}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{language === "el" ? "Σύνδεση" : "Sign In"}</DialogTitle>
            <DialogDescription>
              {language === "el" ? "Συνδεθείτε στον λογαριασμό σας" : "Sign in to your account"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSignIn} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">{language === "el" ? "Κωδικός" : "Password"}</Label>
              <Input
                id="signin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {language === "el" ? "Σύνδεση" : "Sign In"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1.5 text-sm">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{t("signUp")}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{language === "el" ? "Εγγραφή" : "Sign Up"}</DialogTitle>
            <DialogDescription>
              {language === "el" ? "Δημιουργήστε νέο λογαριασμό" : "Create a new account"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSignUp} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">{language === "el" ? "Κωδικός" : "Password"}</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {language === "el" ? "Εγγραφή" : "Sign Up"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SupabaseAuthButton;
