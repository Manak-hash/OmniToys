import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'OmniToys',
        short_name: 'OmniToys',
        description: 'Developer Tools for the Offline Web',
        theme_color: '#252826',
        background_color: '#252826',
        display: 'standalone',
        icons: [
          {
            src: 'src/assets/icons/OmniToys(WebIcon).png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'src/assets/icons/OmniToys(WebIcon).png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
   server: {
    host: true,
  },
});
