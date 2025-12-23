import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const backendUrl = env.VITE_API_URL || 'http://localhost:8000'
  return {
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
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,jpg,gif,woff2}'],
          runtimeCaching: [
            {
              // Uses the URL from your .env file
              urlPattern: new RegExp(`^${backendUrl.replace(/\//g, '\\/')}/.*`),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 200
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
