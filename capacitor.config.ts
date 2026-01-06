import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.71c9d651f97347909891821bce00d9dc',
  appName: 'ZUniverse',
  webDir: 'dist',
  server: {
    url: 'https://71c9d651-f973-4790-9891-821bce00d9dc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
