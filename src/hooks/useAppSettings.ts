import { useCallback, useEffect, useState } from "react";

export type ImageQuality = "auto" | "high" | "medium" | "low";
export type UIDensity = "compact" | "cozy" | "spacious";

export interface AppSettings {
  autoplayCountdown: number; // seconds before next episode
  autoplayEnabled: boolean;
  autoFallbackSources: boolean;
  reduceMotion: boolean;
  imageQuality: ImageQuality;
  uiDensity: UIDensity;
  showAdultContent: boolean;
  markWatchedThreshold: number; // 0-100 %
  hideSpoilers: boolean;
  prefetchPosters: boolean;
  showTrendingBadges: boolean;
  hapticFeedback: boolean;
  defaultLandingTab: "home" | "movies" | "tv" | "discover";
}

const STORAGE_KEY = "appSettings.v1";

export const defaultSettings: AppSettings = {
  autoplayCountdown: 10,
  autoplayEnabled: true,
  autoFallbackSources: true,
  reduceMotion: false,
  imageQuality: "auto",
  uiDensity: "cozy",
  showAdultContent: false,
  markWatchedThreshold: 90,
  hideSpoilers: true,
  prefetchPosters: true,
  showTrendingBadges: true,
  hapticFeedback: true,
  defaultLandingTab: "home",
};

const read = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
};

const subscribers = new Set<(s: AppSettings) => void>();

const write = (next: AppSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  subscribers.forEach((cb) => cb(next));
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => read());

  useEffect(() => {
    const cb = (s: AppSettings) => setSettings(s);
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }, []);

  // Apply side-effects (reduce motion -> root attr)
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = settings.reduceMotion ? "true" : "false";
    document.documentElement.dataset.density = settings.uiDensity;
  }, [settings.reduceMotion, settings.uiDensity]);

  const update = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...read(), [key]: value };
    write(next);
  }, []);

  const reset = useCallback(() => {
    write(defaultSettings);
  }, []);

  return { settings, update, reset };
};
