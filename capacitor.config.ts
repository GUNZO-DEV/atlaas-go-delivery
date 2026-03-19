import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.atlaasgo',
  appName: 'ATLAAS GO',
  webDir: 'dist',
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
