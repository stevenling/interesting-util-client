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
              注册
            </h1>
          </div>

          <el-form label-position="top" class="auth-form" @submit.prevent="onSubmit">
            <el-form-item label="邮箱">
              <el-input
                v-model="email"
                type="email"
                placeholder="用于接收验证码"
                maxlength="128"
                clearable
                autocomplete="email"
              />
            </el-form-item>
            <el-form-item label="验证码">
              <div class="flex gap-2 w-full">
                <el-input
                  v-model="emailCode"
                  class="flex-1 min-w-0"
                  placeholder="6 位数字"
                  maxlength="6"
                  clearable
                  inputmode="numeric"
                  @keyup.enter="onSubmit"
                />
                <el-button
                  class="auth-send-code shrink-0"
                  :disabled="sendCooldown > 0 || sendingCode"
                  :loading="sendingCode"
                  @click="onSendCode"
                >
                  {{ sendCooldown > 0 ? `${sendCooldown}s` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="用户名">
              <el-input
                v-model="username"
                placeholder="至少 2 个字符"
                maxlength="32"
                show-word-limit
                clearable
              />
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="password"
                type="password"
                placeholder="至少 6 位"
                show-password
                clearable
              />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input
                v-model="password2"
                type="password"
                placeholder="再次输入密码"
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
              注册
            </el-button>
          </el-form>

          <p class="mt-6 text-center text-sm text-slate-600 dark:text-neutral-400">
            已有账号？
            <RouterLink
              to="/login"
              class="text-slate-800 dark:text-neutral-200 font-medium hover:underline underline-offset-2"
            >
              登录
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
import { onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import '../../styles/matrix-page.css'
import * as demoAuth from '@/utils/demoAuth'
import * as authEmailApi from '@/utils/authEmailApi'

const router = useRouter()

const email = ref('')
const emailCode = ref('')
const username = ref('')
const password = ref('')
const password2 = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const sendCooldown = ref(0)
let cooldownTimer = null

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

function startCooldown(seconds) {
  sendCooldown.value = seconds
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    sendCooldown.value -= 1
    if (sendCooldown.value <= 0) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function onSendCode() {
  if (sendingCode.value || sendCooldown.value > 0) return
  const e = String(email.value || '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    ElMessage.warning('请先填写有效邮箱')
    return
  }
  sendingCode.value = true
  try {
    const data = await authEmailApi.sendRegisterCode(e)
    if (data.devCode) {
      ElMessage.info(`开发模式：验证码 ${data.devCode}`)
    } else {
      ElMessage.success('验证码已发送，请查收邮箱')
    }
    startCooldown(60)
  } catch (err) {
    ElMessage.error(err?.message || '发送失败')
  } finally {
    sendingCode.value = false
  }
}

async function onSubmit() {
  if (loading.value) return
  if (password.value !== password2.value) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  const e = String(email.value || '').trim()
  const code = String(emailCode.value || '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    ElMessage.warning('请填写有效邮箱')
    return
  }
  if (!/^\d{6}$/.test(code)) {
    ElMessage.warning('请输入 6 位数字验证码')
    return
  }
  loading.value = true
  try {
    try {
      await authEmailApi.verifyRegisterCode(e, code)
    } catch (err) {
      ElMessage.error(err?.message || '验证码校验失败')
      return
    }
    const res = demoAuth.register(username.value, password.value, e)
    if (!res.ok) {
      ElMessage.error(res.message)
      return
    }
    ElMessage.success('注册成功，请登录')
    await router.replace('/login')
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

.auth-send-code.el-button {
  font-weight: 600;
  border-radius: 0.5rem;
  height: auto;
  min-height: 2.5rem;
  padding-left: 0.875rem;
  padding-right: 0.875rem;
  white-space: nowrap;
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
