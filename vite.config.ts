import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // In AI Studio, process.env is often populated directly.
    // We also load from .env files for local development.
    const env = loadEnv(mode, '.', '');
    
    // Merge process.env with loaded env
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || env.GEMINI_API_KEY || env.API_KEY || '';
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || env.UNSPLASH_ACCESS_KEY || '';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: [
          'sdg-fbccbnf4hpa7a8dc.centralindia-01.azurewebsites.net',
          'localhost',
          '0.0.0.0'
        ],
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(GEMINI_API_KEY),
        'process.env.UNSPLASH_ACCESS_KEY': JSON.stringify(UNSPLASH_ACCESS_KEY),
        // Expose Firebase config if present in process.env (from Secrets)
        'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY),
        'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTH_DOMAIN),
        'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID),
        'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET || env.VITE_FIREBASE_STORAGE_BUCKET),
        'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID || env.VITE_FIREBASE_MESSAGING_SENDER_ID),
        'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID || env.VITE_FIREBASE_APP_ID),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
