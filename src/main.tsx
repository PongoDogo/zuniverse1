import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAdBlocker, setupIframeProtection } from "./lib/adBlocker";

// Initialize ad blocker to prevent external redirects
initAdBlocker();
setupIframeProtection();

createRoot(document.getElementById("root")!).render(<App />);
