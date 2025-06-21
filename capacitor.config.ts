import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'healthbook',
  webDir: 'www',

  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: ['http://52.71.93.144', 'http://localhost', 'http://localhost:8100']
  },
  plugins: {
    // IMPORTANTE: esto habilita el scheme en Android e iOS
    CustomURLScheme: {
      scheme: 'myapp'
    }
  }
};

export default config;
