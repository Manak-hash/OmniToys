import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'OmniToys',
        short_name: 'OmniToys',
        description: 'Developer Tools for the Offline Web',
        theme_color: '#252826',
        background_color: '#252826',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        // Increase limit to cache large WASM files (ONNX runtime)
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB
        // Cache external model URLs from HuggingFace
        // These will be downloaded once and cached for offline use
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/huggingface\.co\/.*\.onnx/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'onnx-models',
              expiration: {
                maxEntries: 5, // Cache both RMBG and BiRefNet
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true
      }
    }),
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    watch: {
      ignored: [
        '**/emsdk/**',
        '**/node_modules/**',
        '**/.git/**'
      ]
    }
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
});
