/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Vercel 部署时通过 buildCommand 注入 process.env.VERCEL；.env 中也可配置
  const env = loadEnv(mode, process.cwd(), '')
  const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_URL || env.VERCEL === '1' || !!env.VERCEL_URL
  const base = isVercel ? '/' : (mode === 'production' ? '/interesting-util-client/' : '/')

  /** 开发代理：默认本机 :10000；--mode remote 时读 .env.remote 的 VITE_DEV_PROXY_TARGET 连远程 */
  const devProxyTarget = (env.VITE_DEV_PROXY_TARGET || 'http://localhost:10000').replace(
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
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
  }
})
