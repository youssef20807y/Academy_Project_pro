import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,        // يسمح بالاتصال من أي IP
    port: 5173,        // المنفذ المحلي
    strictPort: false, // لو المنفذ مش فاضي، هيجيب واحد جديد
    allowedHosts: [
      '.ngrok-free.app',   // السماح بدومينات ngrok
      '.tunnelmole.net',   // السماح بدومينات Tunnelmole
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Local backend server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // الحفاظ على Content-Type لو فيه FormData
            if (req.headers['content-type']?.includes('multipart/form-data')) {
              proxyReq.setHeader('Content-Type', req.headers['content-type']);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
    hmr: false // <- مهم: إيقاف HMR لتجنب مشاكل WebSocket عبر HTTPS/Tunnel
  },
})
