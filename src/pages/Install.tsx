import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check, Smartphone, Monitor, Share, Zap, Wifi, Maximize2, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const benefits = [
    { icon: Zap, label: "Faster loading", desc: "Instant launch from home screen" },
    { icon: Wifi, label: "Works offline", desc: "Browse your collection without internet" },
    { icon: Maximize2, label: "Full screen", desc: "Immersive viewing experience" },
    { icon: Shield, label: "Native feel", desc: "Just like a real app" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background gradient-mesh">
        <Navbar />
        <div className="pt-24 px-4 pb-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-shadow"
              >
                <Smartphone className="w-12 h-12 text-primary-foreground" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">Install CineTorrio</h1>
              <p className="text-muted-foreground text-lg">
                Get the full app experience on your device
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 gap-3 mb-8"
            >
              {benefits.map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="p-4 rounded-xl bg-card border border-border/50 card-elevated text-center"
                >
                  <b.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-sm">{b.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {isInstalled ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-success/10 border border-success/20 rounded-xl p-6 text-center glass-premium"
              >
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Already Installed!</h2>
                <p className="text-muted-foreground">
                  CineTorrio is installed on your device. Open it from your home screen.
                </p>
              </motion.div>
            ) : isIOS ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-xl p-6 glass-panel"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Share className="w-5 h-5 text-primary" />
                  Install on iOS
                </h2>
                <ol className="space-y-4">
                  {[
                    <>Tap the <strong className="text-primary">Share</strong> button in Safari's toolbar</>,
                    <>Scroll down and tap <strong className="text-primary">"Add to Home Screen"</strong></>,
                    <>Tap <strong className="text-primary">"Add"</strong> in the top right corner</>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            ) : deferredPrompt ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleInstall}
                  size="lg"
                  className="w-full h-14 text-lg gap-3 btn-fancy"
                >
                  <Download className="w-6 h-6" />
                  Install App
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-xl p-6 glass-panel"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Monitor className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">Desktop or Android</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  To install, look for the install icon in your browser's address bar, or:
                </p>
                <ol className="space-y-3">
                  {[
                    "Open the browser menu (three dots)",
                    <>Look for <strong className="text-primary">"Install app"</strong> or <strong className="text-primary">"Add to Home Screen"</strong></>,
                    <>Tap <strong className="text-primary">"Install"</strong></>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Install;
