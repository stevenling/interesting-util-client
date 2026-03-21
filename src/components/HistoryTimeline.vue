<template>
  <div class="history-timeline-page">
    <TopMenu />
    <div class="main-container">
      <div class="hero-section">
        <div class="title">历史年表</div>
        <div class="subtitle">{{ isCountryPage ? getCountryName(currentCountry) + ' · 大事记' : '选择国家查看对应历史年表' }}</div>
      </div>
      <div class="content-container">
        <!-- 国家选择页 -->
        <template v-if="!isCountryPage">
          <el-card class="timeline-card country-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <i class="el-icon-place"></i>
                <span>选择国家</span>
              </div>
            </template>
            <div class="country-grid">
              <div
                v-for="c in countryList"
                :key="c.code"
                class="country-item"
                @click="goToCountry(c.code)"
              >
                <span class="country-name">{{ c.name }}</span>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>
          </el-card>
        </template>

        <!-- 某国年表页 -->
        <template v-else>
          <el-card class="timeline-card" shadow="hover">
            <template #header>
              <div class="card-header card-header-with-back">
                <el-button link type="primary" class="back-btn" @click="goBack">
                  <i class="el-icon-arrow-left"></i> 返回
                </el-button>
                <i class="el-icon-time"></i>
                <span>时间轴</span>
              </div>
            </template>
            <el-timeline v-if="countryTimeline.length">
              <el-timeline-item
                v-for="item in countryTimeline"
                :key="item.year"
                :timestamp="item.year"
                placement="top"
              >
                <div class="timeline-content-single">{{ item.content }}</div>
              </el-timeline-item>
            </el-timeline>
            <div v-else class="empty-tip">暂无该国年表数据</div>
          </el-card>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import TopMenu from "./TopMenu.vue";
import {
  countryList,
  getTimelineForCountry,
  getCountryName
} from "@/data/historyTimeline.js";

const route = useRoute();
const router = useRouter();

const currentCountry = computed(() => route.params.country || "");

const isCountryPage = computed(() => Boolean(currentCountry.value));

const countryTimeline = computed(() => {
  if (!currentCountry.value) return [];
  return getTimelineForCountry(currentCountry.value);
});

function goToCountry(code) {
  router.push(`/historyTimeline/${code}`);
}

function goBack() {
  router.push("/historyTimeline");
}
</script>

<style scoped>
.history-timeline-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0 40px;
}

.hero-section {
  text-align: center;
  padding: 30px 20px 10px;
  color: #fff;
}

.title {
  font-size: 2.4rem;
  font-weight: bold;
  margin-bottom: 0.6rem;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

.content-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px;
}

.timeline-card {
  border-radius: 16px;
  border: none;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.card-header-with-back {
  flex-wrap: wrap;
  gap: 12px;
}

.back-btn {
  margin-right: auto;
  font-size: 0.95rem;
}

.card-header i {
  color: #667eea;
}

/* 国家选择网格 */
.country-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 8px 0;
}

.country-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.country-item:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.country-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
}

.country-item i {
  color: #667eea;
  font-size: 1rem;
}

.timeline-content-single {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #34495e;
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 24px;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.8rem;
  }
  .content-container {
    padding: 0 12px;
  }
  .country-grid {
    grid-template-columns: 1fr;
  }
}
</style>
