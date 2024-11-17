import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'QuickBites',
        short_name: 'QuickBites',
        description: 'Because good things come to those who plan',
        theme_color: '#B87503',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          // ... your icons configuration
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        sourcemap: true
      }
    })
  ]
})
