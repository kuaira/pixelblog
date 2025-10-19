import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['kuaira.fun'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // ← 去掉多余空格
        changeOrigin: true,
        rewrite: path => path            // 保留原始 /api/xxx
      }
    }
  }
})