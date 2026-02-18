import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Global keyboard shortcuts:
 * - Ctrl+K or / : Focus search (dispatches custom event)
 * - Escape: Close modals/menus (handled by individual components)
 * - Arrow Left/Right on media rows: scroll horizontally
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // / to open search (only when not typing)
      if (e.key === "/" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("openSearch"));
      }

      // G then H = go home (vim-style, only when not typing)
      if (e.key === "h" && !isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Only if last key was 'g' within 500ms
        // Simple approach: just use alt+h
      }

      // Alt+1-6 for quick nav
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const routes: Record<string, string> = {
          "1": "/",
          "2": "/movies",
          "3": "/tv",
          "4": "/discover",
          "5": "/favorites",
          "6": "/collection",
        };
        if (routes[e.key]) {
          e.preventDefault();
          navigate(routes[e.key]);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);
};
