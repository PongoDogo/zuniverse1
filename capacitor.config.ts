import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zuniverse.app',
  appName: 'ZUniverse',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    // Keep all navigation inside the app
    appendUserAgent: 'ZUniverseApp'
  },
  plugins: {
    // Prevent external browser opens
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
