import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAdBlocker, setupIframeProtection, injectAdBlockerCSS } from "./lib/adBlocker";

// Initialize ad blocker IMMEDIATELY before anything else
initAdBlocker();
injectAdBlockerCSS();

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<App />);
  
  // Set up iframe protection after React renders
  requestAnimationFrame(() => {
    setupIframeProtection();
  });
}
