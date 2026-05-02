import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/web': {
        target: 'https://qc.taskdun.com',
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const cookies = proxyRes.headers['set-cookie']
            if (cookies) {
              proxyRes.headers['set-cookie'] = cookies.map(cookie =>
                cookie
                  .replace(/; secure/gi, '')
                  .replace(/; samesite=none/gi, '')
                  .replace(/; samesite=lax/gi, '')
                  .replace(/; samesite=strict/gi, '')
              )
            }
          })
        }
      }
    }
  }
})