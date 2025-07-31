import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'AcceLife',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    Camera: {
      android: {
        saveToGallery: true,
        presentationStyle: "fullscreen"
      }    
    },
     CapacitorHttp: {
      enabled: true,
    },
    },

};

export default config;
