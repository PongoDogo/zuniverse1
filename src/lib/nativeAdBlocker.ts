import { Capacitor } from '@capacitor/core';

/**
 * Check if running on native Android
 */
export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

/**
 * Native ad blocking is now handled entirely in MainActivity.java
 * This file provides utility functions for checking platform status.
 */

/**
 * Get blocked ads count (placeholder - actual count is in MainActivity)
 */
export const getBlockedCount = async (): Promise<number> => {
  // Blocked count is tracked in MainActivity.java
  // This is a placeholder for future bridge implementation if needed
  return 0;
};

/**
 * Reset blocked ads counter (placeholder)
 */
export const resetBlockedCount = async (): Promise<boolean> => {
  return false;
};

/**
 * Initialize native ad blocker (no-op, handled in MainActivity)
 */
export const initNativeAdBlocker = (): void => {
  if (isNativeAndroid()) {
    console.log('[NativeAdBlocker] Native Android ad blocker active (handled in MainActivity)');
  } else {
    console.log('[NativeAdBlocker] Not on native Android');
  }
};
