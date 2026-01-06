import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zuniverse.app',
  appName: 'ZUniverse',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  }
};

export default config;
