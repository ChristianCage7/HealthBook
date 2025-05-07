import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'healthbook',
  webDir: 'www',

  server: {
    androidScheme: 'https'
  },
  plugins: {
    // IMPORTANTE: esto habilita el scheme en Android e iOS
    CustomURLScheme: {
      scheme: 'myapp'
    }
  }
};

export default config;
