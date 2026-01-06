import { Capacitor, registerPlugin } from '@capacitor/core';

interface AdBlockerPlugin {
  getBlockedCount(): Promise<{ count: number }>;
  resetBlockedCount(): Promise<{ success: boolean }>;
}

// Register the native plugin
const NativeAdBlocker = registerPlugin<AdBlockerPlugin>('AdBlocker');

/**
 * Check if running on native Android
 */
export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

/**
 * Get the count of blocked ads from native plugin
 */
export const getBlockedCount = async (): Promise<number> => {
  if (!isNativeAndroid()) {
    return 0;
  }
  
  try {
    const result = await NativeAdBlocker.getBlockedCount();
    return result.count;
  } catch (error) {
    console.error('[NativeAdBlocker] Error getting blocked count:', error);
    return 0;
  }
};

/**
 * Reset the blocked ads counter
 */
export const resetBlockedCount = async (): Promise<boolean> => {
  if (!isNativeAndroid()) {
    return false;
  }
  
  try {
    const result = await NativeAdBlocker.resetBlockedCount();
    return result.success;
  } catch (error) {
    console.error('[NativeAdBlocker] Error resetting count:', error);
    return false;
  }
};

/**
 * Initialize native ad blocker (no-op, plugin auto-initializes)
 */
export const initNativeAdBlocker = (): void => {
  if (isNativeAndroid()) {
    console.log('[NativeAdBlocker] Native Android ad blocker active');
  } else {
    console.log('[NativeAdBlocker] Not on native Android, ad blocker disabled');
  }
};
