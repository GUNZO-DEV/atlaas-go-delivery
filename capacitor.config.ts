import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.atlaasgo',
  appName: 'atlaas-go-delivery',
  webDir: 'dist',
  server: {
    url: 'https://5d4560ef-1423-4cbb-a8db-4afaadb35bb4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      javaVersion: '17'
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
};

export default config;
