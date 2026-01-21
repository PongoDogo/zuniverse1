import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cinetorrio',
  appName: 'CineTorrio',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    appendUserAgent: 'CineTorrioApp'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
