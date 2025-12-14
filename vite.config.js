import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      manifest: {
        name: "StoryForge",
        short_name: "StoryForge",
        description: "Создавайте и читайте истории. Даже без интернета.",
        background_color: "#585959",
        theme_color: "#333333",
        screenshots: [
          {
            src: "figma_screenshot.png",
          }
        ],
        icons: [
          {
            src: "icon.svg",
            sizes: "any"
          }
        ],
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
