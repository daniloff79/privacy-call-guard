import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.callshield',
  appName: 'CallShield',
  webDir: 'dist',
  server: {
    url: 'https://6b0f874a-9a9c-4dfe-91c8-310b55293c8b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
