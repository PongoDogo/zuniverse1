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
            <div className="relative my-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                {language === "el" ? "ή" : "or"}
              </span>
            </div>
            <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn} disabled={googleLoading}>
              {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {language === "el" ? "Συνέχεια με Google" : "Continue with Google"}
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
