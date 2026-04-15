import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    {
      name: 'cursor-debug-log-proxy',
      configureServer(server) {
        const INGEST_URL =
          'http://127.0.0.1:7398/ingest/7af4da33-2b10-4d8a-9c6f-9c2ac5abfd00'
        const SESSION_ID = '89950b'

        server.middlewares.use('/__cursor_debug_log', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              await fetch(INGEST_URL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'text/plain',
                  'X-Debug-Session-Id': SESSION_ID,
                },
                body,
              })
            } catch {
              // ignore logging failures in dev
            }

            res.statusCode = 204
            res.end()
          })
        })
      },
    },
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icons.svg'],
      manifest: {
        name: 'FinPlan - Financial Planning PWA',
        short_name: 'FinPlan',
        description: 'Comprehensive financial planning report and projections',
        theme_color: '#0f172a',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
