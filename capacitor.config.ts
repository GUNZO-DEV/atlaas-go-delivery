import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5d4560ef14234cbba8db4afaadb35bb4',
  appName: 'atlaas-go-delivery',
  webDir: 'dist',
  server: {
    url: 'https://5d4560ef-1423-4cbb-a8db-4afaadb35bb4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
