import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.zuniverse',
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
