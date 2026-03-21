/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Vercel 部署时通过 buildCommand 注入 process.env.VERCEL；.env 中也可配置
  const env = loadEnv(mode, process.cwd(), '')
  const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_URL || env.VERCEL === '1' || !!env.VERCEL_URL
  const base = isVercel ? '/' : (mode === 'production' ? '/interesting-util-client/' : '/')

  return {
    base,
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 8080,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
  }
})
