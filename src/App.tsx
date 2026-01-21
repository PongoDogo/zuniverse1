import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import Discover from "./pages/Discover";
import Watchlist from "./pages/Watchlist";
import MovieDetails from "./pages/MovieDetails";
import TVDetails from "./pages/TVDetails";
import Watch from "./pages/Watch";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Get Clerk publishable key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Wrapper component to conditionally use ClerkProvider
const AppContent = ({ children }: { children: React.ReactNode }) => {
  if (clerkPubKey) {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ClerkProvider>
    );
  }
  // If no Clerk key, render without auth (fallback mode)
  return <>{children}</>;
};

const App = () => (
  <AppContent>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<TVDetails />} />
            <Route path="/:type/:id/watch" element={<Watch />} />
            <Route path="/:type/:id/watch/:season/:episode" element={<Watch />} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AppContent>
);

export default App;
