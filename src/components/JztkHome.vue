<template>
  <div class="jztk-home-page">
    <TopMenu />
    <div class="main-container">
      <div class="hero-section">
        <div class="title">驾考刷题王</div>
        <div class="subtitle">选择考试科目后开始练习</div>
      </div>

      <div class="content-container">
        <div class="subject-grid">
          <el-card
            class="subject-card"
            shadow="hover"
            @click="goPractice('1')"
          >
            <div class="subject-icon">1</div>
            <h2 class="subject-title">科目一</h2>
            <p class="subject-desc">
              道路交通安全法律、法规和规章，交通信号，安全行车、文明驾驶等
            </p>
            <el-button type="primary" round class="subject-btn" @click.stop="goPractice('1')">
              开始刷题
            </el-button>
            <div class="subject-actions" @click.stop>
              <el-button link class="jztk-sub-link" @click="goWrongPractice('1')">
                练习错题
              </el-button>
              <span class="action-dot" aria-hidden="true" />
              <el-button link class="jztk-sub-link" @click="goFavorites('1')">
                查看收藏
              </el-button>
            </div>
          </el-card>

          <el-card
            class="subject-card"
            shadow="hover"
            @click="goPractice('4')"
          >
            <div class="subject-icon">4</div>
            <h2 class="subject-title">科目四</h2>
            <p class="subject-desc">
              安全文明驾驶常识，复杂条件下的安全驾驶知识、紧急情况处置等
            </p>
            <el-button type="primary" round class="subject-btn" @click.stop="goPractice('4')">
              开始刷题
            </el-button>
            <div class="subject-actions" @click.stop>
              <el-button link class="jztk-sub-link" @click="goWrongPractice('4')">
                练习错题
              </el-button>
              <span class="action-dot" aria-hidden="true" />
              <el-button link class="jztk-sub-link" @click="goFavorites('4')">
                查看收藏
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import TopMenu from "./TopMenu.vue";

const router = useRouter();

function goPractice(subject) {
  router.push({
    path: "/jztk/practice",
    query: { subject },
  });
}

/** 错题练习：与刷题页 mode=wrong 一致 */
function goWrongPractice(subject) {
  router.push({
    path: "/jztk/practice",
    query: { subject, mode: "wrong" },
  });
}

/** 打开刷题页并自动展开侧栏「收藏」Tab */
function goFavorites(subject) {
  router.push({
    path: "/jztk/practice",
    query: { subject, drawer: "fav" },
  });
}
</script>

<style scoped>
.jztk-home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  --jztk-blue: #2563eb;
  --jztk-blue-soft: #eff6ff;
  --jztk-blue-border: #bfdbfe;
  --jztk-text: #1e293b;
  --jztk-muted: #64748b;
  --jztk-line: #e2e8f0;
}

.main-container {
  flex: 1;
  background: transparent;
  padding: 20px 0 48px;
}

.hero-section {
  text-align: center;
  padding: 28px 16px 24px;
  color: var(--site-heading);
  border-bottom: 1px solid var(--site-border);
}

.title {
  font-size: 1.85rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: 0.02em;
  color: var(--site-heading);
  text-shadow: none;
}

.subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: var(--site-muted);
  font-weight: 400;
  text-shadow: none;
}

.content-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 600px) {
  .subject-grid {
    grid-template-columns: 1fr;
  }
}

.subject-card {
  cursor: pointer;
  border-radius: 14px;
  text-align: center;
  padding: 4px 4px 18px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  border: 1px solid var(--site-border);
  background: var(--site-surface);
  --el-card-border-color: var(--jztk-line);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.subject-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.07);
}

.subject-icon {
  width: 52px;
  height: 52px;
  margin: 14px auto 14px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--jztk-blue);
  background: var(--jztk-blue-soft);
  border: 1px solid var(--jztk-blue-border);
}

.subject-title {
  margin: 0 0 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--jztk-text);
}

.subject-desc {
  margin: 0 0 18px;
  font-size: 0.86rem;
  line-height: 1.65;
  color: var(--jztk-muted);
  padding: 0 14px;
  min-height: 4.5em;
}

.subject-btn {
  padding-left: 28px;
  padding-right: 28px;
}

.subject-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--jztk-line);
}

.action-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
}

.subject-card :deep(.jztk-sub-link) {
  color: var(--jztk-muted);
  font-size: 0.8125rem;
  font-weight: 400;
  padding: 4px 6px;
}

.subject-card :deep(.jztk-sub-link:hover) {
  color: var(--jztk-blue);
}

.hint {
  margin-top: 24px;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--jztk-muted);
  text-align: center;
}

.hint code {
  padding: 2px 6px;
  border-radius: 4px;
  background: #f1f5f9;
  font-size: 0.8rem;
  color: var(--jztk-text);
}
</style>
