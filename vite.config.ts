import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // 加载 .env 中的 DEEPSEEK_API_KEY（仅服务端使用，不暴露给浏览器）
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    test: {
      exclude: ['e2e', 'node_modules'],
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      sourcemap: true,
    },
    server: {
      proxy: {
        '/api/deepseek': {
          target: 'https://api.deepseek.com',
          changeOrigin: true,
          rewrite: p => p.replace(/^\/api\/deepseek/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.DEEPSEEK_API_KEY}`)
            })
          },
        },
      },
    },
  }
})
