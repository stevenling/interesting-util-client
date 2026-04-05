/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

/** Vite 的 base 须以 / 结尾（根路径为 "/"） */
function normalizeViteBase(p) {
  const s = String(p ?? '/').trim()
  if (!s || s === '/') return '/'
  return s.replace(/\/$/, '') + '/'
}

export default defineConfig(({ mode }) => {
  // Vercel 部署时通过 buildCommand 注入 process.env.VERCEL；.env 中也可配置
  const env = loadEnv(mode, process.cwd(), '')
  const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_URL || env.VERCEL === '1' || !!env.VERCEL_URL
  // 生产默认域名根（腾讯云 Nginx 挂 dist）；GitHub Pages 子路径在 CI 里设 DEPLOY_BASE
  const deployBase = process.env.DEPLOY_BASE ?? env.DEPLOY_BASE
  const base = isVercel
    ? '/'
    : mode === 'production'
      ? normalizeViteBase(deployBase ?? '/')
      : '/'

  /**
   * 开发代理：默认 127.0.0.1:11219（与 npm run server 一致）。
   * 勿用 localhost：部分环境 Node 优先连 ::1，而 uvicorn 仅监听 IPv4 时会 ECONNREFUSED，浏览器侧常表现为 /api 500。
   * --mode remote 时用 .env.remote 的 VITE_DEV_PROXY_TARGET。
   */
  const devProxyTarget = (env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:11219').replace(
    /\/$/,
    ''
  )

  /** EPUB→PDF（ebook-convert-server）避免浏览器直连 :3001 触发 CORS */
  const ebookConvertProxyTarget = (env.VITE_EBOOK_CONVERT_PROXY_TARGET || 'http://localhost:3001').replace(
    /\/$/,
    ''
  )

  return {
    base,
    plugins: [tailwindcss(), vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 8080,
      proxy: {
        '/api': {
          target: devProxyTarget,
          changeOrigin: true,
        },
        '/ebook-convert': {
          target: ebookConvertProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ebook-convert/, '') || '/',
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
  }
})
