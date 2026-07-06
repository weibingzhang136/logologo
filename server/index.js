// ============================================================
// Logologo 生产环境服务器
// 静态文件服务 + DeepSeek API 代理
// ============================================================

import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = parseInt(process.env.PORT || '5173', 10)

// ---- 加载 .env ----
const envPath = path.resolve(__dirname, '..', '.env')
let DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

if (!DEEPSEEK_API_KEY && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const match = envContent.match(/^DEEPSEEK_API_KEY=(.+)$/m)
  if (match) DEEPSEEK_API_KEY = match[1].trim()
}

if (!DEEPSEEK_API_KEY) {
  console.error('错误: 未设置 DEEPSEEK_API_KEY')
  console.error('请在 .env 文件中设置 DEEPSEEK_API_KEY=your_key_here')
  process.exit(1)
}

const app = express()

// ---- API 代理 ----
app.use(
  '/api/deepseek',
  createProxyMiddleware({
    target: 'https://api.deepseek.com',
    changeOrigin: true,
    pathRewrite: { '^/api/deepseek': '' },
    on: {
      proxyReq: (proxyReq) => {
        proxyReq.setHeader('Authorization', `Bearer ${DEEPSEEK_API_KEY}`)
      },
    },
  }),
)

// ---- 静态文件服务 ----
const distPath = path.resolve(__dirname, '..', 'dist')
app.use(express.static(distPath))

// ---- SPA fallback ----
app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Logologo 生产服务器已启动`)
  console.log(`  → http://localhost:${PORT}`)
  console.log(`  → 静态文件: ${distPath}`)
})
