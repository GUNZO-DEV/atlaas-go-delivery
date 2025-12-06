import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.atlaasgo',
  appName: 'atlaas-go-delivery',
  webDir: 'dist',
  android: {
    buildOptions: {
      javaVersion: '17'
    }
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
