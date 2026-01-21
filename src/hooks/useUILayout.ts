import { useState, useEffect, useCallback } from "react";
import { 
  UILayout, 
  LayoutConfig, 
  getUILayout, 
  setUILayout as saveUILayout, 
  applyUILayout,
  getLayoutConfig,
  UI_LAYOUTS 
} from "@/lib/uiLayout";

export const useUILayout = () => {
  const [layout, setLayoutState] = useState<UILayout>(() => getUILayout());
  const [config, setConfig] = useState<LayoutConfig>(() => getLayoutConfig());

  useEffect(() => {
    // Apply layout on mount
    applyUILayout(layout);
  }, []);

  useEffect(() => {
    const newConfig = getLayoutConfig(layout);
    setConfig(newConfig);
  }, [layout]);

  // Listen for external layout changes
  useEffect(() => {
    const handleLayoutChange = (e: CustomEvent<{ layout: UILayout; config: LayoutConfig }>) => {
      setLayoutState(e.detail.layout);
      setConfig(e.detail.config);
    };

    window.addEventListener("uiLayoutChanged", handleLayoutChange as EventListener);
    return () => window.removeEventListener("uiLayoutChanged", handleLayoutChange as EventListener);
  }, []);

  const setLayout = useCallback((newLayout: UILayout) => {
    setLayoutState(newLayout);
    saveUILayout(newLayout);
  }, []);

  const cycleLayout = useCallback(() => {
    const layouts: UILayout[] = ["zuniverse", "galaxia", "cosmos", "planitor"];
    const currentIndex = layouts.indexOf(layout);
    const nextLayout = layouts[(currentIndex + 1) % layouts.length];
    setLayout(nextLayout);
  }, [layout, setLayout]);

  return { 
    layout, 
    setLayout, 
    cycleLayout, 
    config, 
    allLayouts: Object.values(UI_LAYOUTS) 
  };
};
