<template>
  <div
    class="matrix-root relative h-screen min-h-0 flex flex-col overflow-hidden text-slate-900 dark:text-neutral-100"
  >
    <div
      class="pointer-events-none fixed inset-0 -z-10 matrix-bg-base"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed -top-32 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full matrix-blob matrix-blob-a blur-3xl opacity-90"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed top-[28%] -right-24 h-[28rem] w-[28rem] rounded-full matrix-blob matrix-blob-b blur-3xl opacity-80"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed bottom-0 left-0 h-[22rem] w-[22rem] rounded-full matrix-blob matrix-blob-c blur-3xl opacity-70"
      aria-hidden="true"
    />

    <div class="relative flex-1 min-h-0 flex flex-col px-4 sm:px-6 pt-8 sm:pt-12 pb-0">
      <div class="max-w-md mx-auto w-full flex-1 min-h-0 flex flex-col justify-center">
        <RouterLink
          to="/utilIndex"
          class="mb-6 inline-block text-sm text-slate-500 hover:text-slate-800 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors duration-300"
        >
          ← 工具列表
        </RouterLink>

        <div class="matrix-tool-panel px-6 sm:px-8 py-8 sm:py-10">
          <div class="text-center mb-8">
            <p
              class="text-[0.6875rem] sm:text-xs font-medium tracking-[0.22em] uppercase text-slate-500 dark:text-neutral-500 mb-3"
            >
              Account
            </p>
            <h1
              class="text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              登录
            </h1>
          </div>

          <el-form label-position="top" class="auth-form" @submit.prevent="onSubmit">
            <el-form-item label="用户名">
              <el-input
                v-model="username"
                placeholder="用户名"
                maxlength="32"
                show-word-limit
                clearable
                @keyup.enter="onSubmit"
              />
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="password"
                type="password"
                placeholder="密码"
                show-password
                clearable
                @keyup.enter="onSubmit"
              />
            </el-form-item>
            <el-button
              class="auth-btn auth-btn-solid w-full"
              native-type="submit"
              :loading="loading"
              @click="onSubmit"
            >
              登录
            </el-button>
          </el-form>

          <p class="mt-6 text-center text-sm text-slate-600 dark:text-neutral-400">
            还没有账号？
            <RouterLink
              to="/register"
              class="text-slate-800 dark:text-neutral-200 font-medium hover:underline underline-offset-2"
            >
              注册
            </RouterLink>
          </p>
        </div>
      </div>

      <footer
        class="matrix-footer mt-auto shrink-0 relative flex items-center justify-center border-t border-black/[0.06] dark:border-white/[0.08] py-2.5 sm:py-3 px-6 -mx-4 sm:-mx-6"
      >
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block text-[13px] leading-none text-slate-500 hover:text-slate-800 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors duration-300"
        >
          闽ICP备2023011581号
        </a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import '../../styles/matrix-page.css'
import * as demoAuth from '@/utils/demoAuth'
import { applyPostLoginRedirect } from '@/utils/authRedirect.js'

const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)

async function onSubmit() {
  if (loading.value) return
  loading.value = true
  try {
    const res = await demoAuth.login(username.value, password.value)
    if (!res.ok) {
      ElMessage.error(res.message)
      return
    }
    ElMessage.success('登录成功')
    await applyPostLoginRedirect(route.query.redirect, router)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form :deep(.el-form-item__label) {
  color: rgb(71 85 105);
  font-weight: 500;
  font-size: 0.8125rem;
}

@media (prefers-color-scheme: dark) {
  .auth-form :deep(.el-form-item__label) {
    color: rgb(203 213 225);
  }
}

.auth-form :deep(.el-input__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.08) inset;
  background: rgb(255 255 255 / 0.9);
}

@media (prefers-color-scheme: dark) {
  .auth-form :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px rgb(255 255 255 / 0.1) inset;
    background: rgb(24 24 27 / 0.6);
  }
}

.auth-btn.el-button {
  font-weight: 600;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  height: 2.75rem;
}

.auth-btn-solid.el-button {
  background-color: rgb(51 65 85);
  border-color: rgb(51 65 85);
  color: rgb(248 250 252);
}

.auth-btn-solid.el-button:hover {
  background-color: rgb(71 85 105);
  border-color: rgb(71 85 105);
  color: rgb(255 255 255);
}

@media (prefers-color-scheme: dark) {
  .auth-btn-solid.el-button {
    background-color: rgb(71 85 105);
    border-color: rgb(100 116 139);
    color: rgb(244 244 245);
  }

  .auth-btn-solid.el-button:hover {
    background-color: rgb(100 116 139);
    border-color: rgb(148 163 184);
    color: rgb(255 255 255);
  }
}
</style>
