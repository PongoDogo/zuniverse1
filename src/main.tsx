import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAdBlocker, setupIframeProtection } from "./lib/adBlocker";

// Render app first, then initialize ad blocker
const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<App />);
  
  // Initialize ad blocker after React renders
  requestAnimationFrame(() => {
    initAdBlocker();
    setupIframeProtection();
  });
}
