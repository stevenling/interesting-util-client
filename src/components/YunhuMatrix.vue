<template>
  <div
    class="matrix-root relative min-h-screen flex flex-col overflow-hidden text-slate-900 dark:text-neutral-100"
  >
    <!-- 环境光晕（Apple 式柔和层次） -->
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

    <div class="relative flex-1 min-h-0 flex flex-col">
      <section
        class="matrix-hero text-center px-6 pt-20 pb-16 sm:pt-28 sm:pb-20"
      >
        <p
          class="matrix-eyebrow text-[0.6875rem] sm:text-xs font-medium tracking-[0.22em] uppercase text-slate-500 dark:text-neutral-500 mb-5"
        >
          Portal
        </p>
        <h1
          class="matrix-title text-[2.125rem] sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-slate-900 dark:text-white max-w-lg mx-auto"
        >
          Nyx Matrix
        </h1>
        <!-- <p
          class="mt-4 text-[15px] sm:text-base text-slate-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed font-normal"
        >
          站点聚合与快速入口
        </p> -->
        <div
          class="mt-10 h-px w-12 mx-auto matrix-divider rounded-full"
          aria-hidden="true"
        />
      </section>

      <ToolSection
        class="matrix-links"
        title="Quick access"
        :list="quickLinks"
      />
    </div>

    <footer
      class="matrix-footer relative mt-auto border-t border-black/[0.06] dark:border-white/[0.08] py-8 px-6"
    >
      <div class="text-center">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-[13px] text-slate-500 hover:text-slate-800 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors duration-300"
        >
          闽ICP备2023011581号
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import ToolSection from './ToolSection.vue'

const quickLinks = [
  {
    title: 'Nyx Tools',
    desc: '站内工具总览',
    link: '/utilIndex',
  },
  {
    title: '博尔赫斯中文站',
    desc: '博尔赫斯中文资源',
    link: 'https://stevenling.github.io/chinese-borges-website/',
  },
  {
    title: 'Nyx Blog',
    desc: '博客',
    link: 'https://stevenling.github.io/yunhu-blog/',
  }
]
</script>
<style scoped>
/* Apple 系中性底 + 细腻层次（仅本页） */
.matrix-bg-base {
  background: linear-gradient(
    180deg,
    #f5f5f7 0%,
    #ebebf0 48%,
    #e8eaef 100%
  );
}

@media (prefers-color-scheme: dark) {
  .matrix-bg-base {
    background: linear-gradient(180deg, #000000 0%, #0c0c0e 45%, #070708 100%);
  }
}

.matrix-blob-a {
  background: radial-gradient(
    circle,
    rgb(147 197 253 / 0.45) 0%,
    rgb(191 219 254 / 0.12) 42%,
    transparent 70%
  );
}

.matrix-blob-b {
  background: radial-gradient(
    circle,
    rgb(196 181 253 / 0.35) 0%,
    rgb(233 213 255 / 0.08) 50%,
    transparent 72%
  );
}

.matrix-blob-c {
  background: radial-gradient(
    circle,
    rgb(125 211 252 / 0.25) 0%,
    transparent 65%
  );
}

@media (prefers-color-scheme: dark) {
  .matrix-blob-a {
    background: radial-gradient(
      circle,
      rgb(59 130 246 / 0.22) 0%,
      rgb(37 99 235 / 0.06) 45%,
      transparent 70%
    );
  }

  .matrix-blob-b {
    background: radial-gradient(
      circle,
      rgb(168 85 247 / 0.14) 0%,
      transparent 68%
    );
  }

  .matrix-blob-c {
    background: radial-gradient(
      circle,
      rgb(56 189 248 / 0.12) 0%,
      transparent 65%
    );
  }
}

.matrix-divider {
  background: linear-gradient(
    90deg,
    transparent,
    rgb(148 163 184 / 0.55),
    transparent
  );
}

@media (prefers-color-scheme: dark) {
  .matrix-divider {
    background: linear-gradient(
      90deg,
      transparent,
      rgb(163 163 163 / 0.35),
      transparent
    );
  }
}

.matrix-footer {
  background: rgb(245 245 247 / 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

@media (prefers-color-scheme: dark) {
  .matrix-footer {
    background: rgb(0 0 0 / 0.55);
  }
}

/* 区块标题：更克制、偏 Apple 文案层级 */
.matrix-root :deep(.matrix-links h2) {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  border-left: none;
  padding-left: 0;
  margin-bottom: 1.25rem;
}

@media (prefers-color-scheme: dark) {
  .matrix-root :deep(.matrix-links h2) {
    color: rgb(163 163 163);
  }
}

/* 玻璃卡片 + 轻悬停（仅 Matrix 页） */
.matrix-root :deep(.matrix-links .tool-card) {
  position: relative;
  border-radius: 1.125rem;
  padding: 1.375rem 1.5rem;
  padding-right: 2.75rem;
  border: 1px solid rgb(0 0 0 / 0.06);
  background: rgb(255 255 255 / 0.72);
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.8) inset,
    0 1px 2px rgb(0 0 0 / 0.04),
    0 12px 40px rgb(15 23 42 / 0.06);
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  transition:
    transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1),
    box-shadow 0.45s cubic-bezier(0.25, 0.1, 0.25, 1),
    border-color 0.35s ease;
}

.matrix-root :deep(.matrix-links .tool-card:hover) {
  transform: translateY(-2px) scale(1.01);
  border-color: rgb(0 0 0 / 0.08);
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.9) inset,
    0 4px 12px rgb(0 0 0 / 0.05),
    0 20px 48px rgb(15 23 42 / 0.1);
}

.matrix-root :deep(.matrix-links .tool-card h3) {
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: rgb(15 23 42);
}

.matrix-root :deep(.matrix-links .tool-card p) {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: rgb(100 116 139);
  margin-top: 0.25rem;
}

/* 列表项右侧 chevron 暗示可点 */
.matrix-root :deep(.matrix-links .tool-card::after) {
  content: '›';
  position: absolute;
  right: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.375rem;
  font-weight: 300;
  line-height: 1;
  color: rgb(148 163 184);
  opacity: 0.65;
  transition: transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.25s ease;
}

.matrix-root :deep(.matrix-links .tool-card:hover::after) {
  transform: translate(2px, -50%);
  opacity: 0.95;
}

@media (prefers-color-scheme: dark) {
  .matrix-root :deep(.matrix-links .tool-card) {
    border: 1px solid rgb(255 255 255 / 0.08);
    background: rgb(28 28 30 / 0.65);
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 0.04) inset,
      0 1px 2px rgb(0 0 0 / 0.35),
      0 16px 48px rgb(0 0 0 / 0.45);
  }

  .matrix-root :deep(.matrix-links .tool-card:hover) {
    border-color: rgb(255 255 255 / 0.12);
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 0.06) inset,
      0 8px 24px rgb(0 0 0 / 0.5);
  }

  .matrix-root :deep(.matrix-links .tool-card h3) {
    color: rgb(245 245 247);
  }

  .matrix-root :deep(.matrix-links .tool-card p) {
    color: rgb(163 163 170);
  }

  .matrix-root :deep(.matrix-links .tool-card::after) {
    color: rgb(142 142 147);
  }
}
</style>

