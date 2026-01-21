// UI Layout System - 4 distinct visual themes inspired by major streaming services

export type UILayout = "cinetorrio" | "galaxia" | "cosmos" | "planitor";

export interface LayoutConfig {
  id: UILayout;
  name: string;
  description: string;
  icon: string;
  // Navbar styles
  navStyle: "floating" | "solid" | "transparent" | "minimal";
  navPosition: "top" | "left";
  // Card styles
  cardStyle: "rounded" | "sharp" | "pill" | "glass";
  cardHover: "lift" | "scale" | "glow" | "border";
  // Hero styles
  heroStyle: "fullscreen" | "compact" | "billboard" | "carousel";
  heroPosition: "left" | "center" | "bottom";
  // Row styles
  rowStyle: "horizontal" | "grid" | "waterfall" | "featured";
  rowSpacing: "tight" | "normal" | "loose";
  // Colors (CSS custom properties)
  primaryHue: number;
  accentHue: number;
  // Typography
  fontFamily: string;
  headingWeight: "bold" | "extrabold" | "black";
  // Effects
  useGradients: boolean;
  useGlow: boolean;
  useBlur: boolean;
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
}

export const UI_LAYOUTS: Record<UILayout, LayoutConfig> = {
  cinetorrio: {
    id: "cinetorrio",
    name: "CineTorrio",
    description: "Modern & Premium",
    icon: "✨",
    navStyle: "floating",
    navPosition: "top",
    cardStyle: "rounded",
    cardHover: "lift",
    heroStyle: "fullscreen",
    heroPosition: "left",
    rowStyle: "horizontal",
    rowSpacing: "normal",
    primaryHue: 262, // Purple
    accentHue: 280,
    fontFamily: "'Inter', sans-serif",
    headingWeight: "bold",
    useGradients: true,
    useGlow: true,
    useBlur: true,
    borderRadius: "lg",
  },
  galaxia: {
    id: "galaxia",
    name: "Galaxia",
    description: "Netflix-inspired Bold",
    icon: "🌌",
    navStyle: "solid",
    navPosition: "top",
    cardStyle: "sharp",
    cardHover: "scale",
    heroStyle: "billboard",
    heroPosition: "bottom",
    rowStyle: "horizontal",
    rowSpacing: "tight",
    primaryHue: 0, // Red
    accentHue: 350,
    fontFamily: "'Inter', sans-serif",
    headingWeight: "extrabold",
    useGradients: true,
    useGlow: false,
    useBlur: false,
    borderRadius: "sm",
  },
  cosmos: {
    id: "cosmos",
    name: "Cosmos",
    description: "Disney+ Magical",
    icon: "🌠",
    navStyle: "transparent",
    navPosition: "top",
    cardStyle: "pill",
    cardHover: "glow",
    heroStyle: "carousel",
    heroPosition: "center",
    rowStyle: "featured",
    rowSpacing: "loose",
    primaryHue: 210, // Blue
    accentHue: 190,
    fontFamily: "'Space Grotesk', sans-serif",
    headingWeight: "bold",
    useGradients: true,
    useGlow: true,
    useBlur: true,
    borderRadius: "full",
  },
  planitor: {
    id: "planitor",
    name: "Planitor",
    description: "Prime Video Clean",
    icon: "🪐",
    navStyle: "minimal",
    navPosition: "top",
    cardStyle: "glass",
    cardHover: "border",
    heroStyle: "compact",
    heroPosition: "left",
    rowStyle: "grid",
    rowSpacing: "normal",
    primaryHue: 180, // Teal/Cyan
    accentHue: 160,
    fontFamily: "'Inter', sans-serif",
    headingWeight: "bold",
    useGradients: false,
    useGlow: false,
    useBlur: true,
    borderRadius: "md",
  },
};

const UI_LAYOUT_KEY = "cinetorrio_ui_layout";

export const getUILayout = (): UILayout => {
  try {
    const saved = localStorage.getItem(UI_LAYOUT_KEY);
    if (saved && saved in UI_LAYOUTS) {
      return saved as UILayout;
    }
  } catch {}
  return "cinetorrio";
};

export const setUILayout = (layout: UILayout): void => {
  try {
    localStorage.setItem(UI_LAYOUT_KEY, layout);
    applyUILayout(layout);
  } catch {}
};

export const applyUILayout = (layout: UILayout): void => {
  const config = UI_LAYOUTS[layout];
  const root = document.documentElement;
  
  // Remove all layout classes
  root.classList.remove("layout-cinetorrio", "layout-galaxia", "layout-cosmos", "layout-planitor");
  
  // Add current layout class
  root.classList.add(`layout-${layout}`);
  
  // Set CSS custom properties
  root.style.setProperty("--layout-primary-hue", String(config.primaryHue));
  root.style.setProperty("--layout-accent-hue", String(config.accentHue));
  root.style.setProperty("--layout-font", config.fontFamily);
  
  // Set border radius
  const radiusMap = { none: "0", sm: "0.25rem", md: "0.5rem", lg: "0.75rem", full: "9999px" };
  root.style.setProperty("--layout-radius", radiusMap[config.borderRadius]);
  
  // Dispatch event for components to react
  window.dispatchEvent(new CustomEvent("uiLayoutChanged", { detail: { layout, config } }));
};

export const getLayoutConfig = (layout?: UILayout): LayoutConfig => {
  return UI_LAYOUTS[layout || getUILayout()];
};
