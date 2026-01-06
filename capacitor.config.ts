import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.71c9d651f97347909891821bce00d9dc',
  appName: 'ZUniverse',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    appendUserAgent: 'ZUniverseApp'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
