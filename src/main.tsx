import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initNativeAdBlocker } from "./lib/nativeAdBlocker";

// Initialize native ad blocker (only works on Android)
initNativeAdBlocker();

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<App />);
}
