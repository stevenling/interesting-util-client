<template>
  <div class="matrix-root jztk-page relative min-h-screen">
    <TopMenu />
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

    <div class="main-container relative z-10">
      <div class="jztk-practice-shell matrix-tool-panel mx-auto max-w-[720px]">
        <div class="hero-section matrix-tool-panel-header">
          <div class="title">驾考刷题王</div>
        </div>

        <div class="jztk-practice-body">
        <div class="content-container">

        <el-card
          v-if="showPracticeCard"
          class="jztk-card jztk-card--in-panel"
          shadow="never"
        >
          <template #header>
            <div class="card-header-stack jztk-card-header-inner">
              <div class="card-subject-bar">
                当前：{{ subjectLabel }}
              </div>
              <div class="card-header card-header-row">
              <div class="header-left">
                <el-button
                  type="primary"
                  plain
                  class="header-back-btn"
                  title="返回选科目"
                  @click="goBackHome"
                >
                  <el-icon class="header-back-icon"><ArrowLeft /></el-icon>
                  <span>返回</span>
                </el-button>
                <div class="card-header-stats card-header-stats--inline" aria-label="累计答对答错">
                  <span
                    class="stat-chip stat-chip-stat-correct"
                    :title="'累计答对 ' + lsState.stats.correct"
                  >
                    <el-icon
                      class="stat-chip-icon stat-chip-icon--ok"
                      :style="{ color: JZTK_STAT_OK_BLUE }"
                    ><Check /></el-icon>
                    <span class="stat-chip-num">{{ lsState.stats.correct }}</span>
                  </span>
                  <span
                    class="stat-chip stat-chip-bad"
                    :title="'累计答错 ' + lsState.stats.wrong"
                  >
                    <el-icon class="stat-chip-icon stat-chip-icon--bad"><Close /></el-icon>
                    <span class="stat-chip-num">{{ lsState.stats.wrong }}</span>
                  </span>
                </div>
              </div>
              <span class="header-progress">
                <i class="el-icon-document"></i>
                <span v-if="isWrongMode" class="mode-tag">错题练习</span>
                <template v-if="queue.length > 0">
                  <template v-if="isWrongMode">
                    {{ wrongProgressCurrent }} / {{ queue.length }}
                  </template>
                  <template v-else>
                    {{ progressCurrent }} / {{ TOTAL_QUESTIONS_DISPLAY }}
                  </template>
                </template>
                <template v-else-if="loading">加载中…</template>
                <template v-else>—</template>
              </span>
              <div class="header-right">
                <el-button
                  v-if="isWrongMode"
                  type="warning"
                  link
                  @click="goRandomPractice"
                >
                  返回随机刷题
                </el-button>
              </div>
            </div>
            </div>
          </template>

          <div v-if="loading && !current" class="state-center">
            <el-icon class="is-loading spin"><Loading /></el-icon>
            <span>正在拉取题目…</span>
          </div>

          <template v-else-if="current">
            <div class="question-text">{{ current.question }}</div>

            <div v-if="current.url" class="img-wrap">
              <img
                v-show="!imgBroken"
                :src="current.url"
                alt="题目配图"
                class="q-img"
                referrerpolicy="no-referrer"
                loading="lazy"
                @error="onImgError"
              />
              <div v-if="imgBroken" class="img-fail">图片暂无法显示</div>
            </div>

            <el-radio-group
              :key="currentKey"
              v-model="picked"
              class="options-group"
              :class="optionsLayoutClass"
              :disabled="submitting || showWrongFeedback || pickRevisitLocked"
              @change="onPick"
            >
              <el-radio
                v-for="opt in optionList"
                :key="opt.key"
                :label="opt.key"
                border
                class="option-radio"
                :class="{
                  'is-wrong-pick':
                    showWrongFeedback && picked === opt.key && !isCorrect,
                  'is-correct-ans':
                    showWrongFeedback &&
                    normalizeAnswerToKey(current.answer) === opt.key,
                }"
              >
                <span class="opt-key">{{ optionKeyLetter(opt.key) }}.</span>
                {{ opt.text }}
              </el-radio>
            </el-radio-group>

            <div class="question-fav-row">
              <el-button
                :type="currentIsFavorite ? 'warning' : 'default'"
                @click="toggleFavoriteCurrent"
              >
                <el-icon class="btn-ic"><StarFilled v-if="currentIsFavorite" /><Star v-else /></el-icon>
                {{ currentIsFavorite ? "已收藏" : "收藏" }}
              </el-button>
            </div>

            <el-collapse
              v-if="showWrongFeedback"
              v-model="wrongCollapseActive"
              class="wrong-collapse"
            >
              <el-collapse-item name="wrong-detail">
                <template #title>
                  <span class="wrong-collapse-title">
                    <el-icon class="wrong-collapse-icon"><CircleCloseFilled /></el-icon>
                    回答错误 · 正确答案与解析
                  </span>
                </template>
                <div class="wrong-collapse-body">
                  <p class="correct-line explain-text-size">
                    正确答案：<strong class="correct-answer-text">{{ correctLabel }}</strong>
                  </p>
                  <p v-if="pickedPickLabel" class="your-pick-line">
                    你的选择：<strong>{{ pickedPickLabel }}</strong>
                  </p>
                  <div
                    v-if="current.explains"
                    class="explain-text explain-html"
                    v-html="current.explains"
                  />
                </div>
              </el-collapse-item>
            </el-collapse>

            <div class="card-footer-nav">
              <el-button
                :disabled="!canGoPrev || submitting"
                @click="goPrev"
              >
                上一题
              </el-button>
              <el-button type="primary" @click="goNext">
                下一题
              </el-button>
            </div>
          </template>

          <div v-else class="state-center muted empty-fallback">
            <template v-if="loading">正在随机抽取题目…</template>
            <template v-else-if="isWrongMode && wrongRoundDone">
              <span>本轮错题已全部练完。</span>
              <div class="empty-actions">
                <el-button
                  v-if="wrongBookCount > 0"
                  type="primary"
                  @click="restartWrongRound"
                >
                  再来一轮
                </el-button>
                <el-button @click="goRandomPractice">返回随机刷题</el-button>
              </div>
            </template>
            <template v-else-if="isWrongMode && wrongBookCount === 0">
              <span>当前科目暂无错题记录，先去随机刷题答错后会自动加入错题本。</span>
              <el-button type="primary" link @click="goRandomPractice">
                去随机刷题
              </el-button>
            </template>
            <template v-else>
              <span>暂无可练习题目，请返回后重新进入或刷新页面重试。</span>
              <el-button type="primary" link @click="goBackHome">
                返回
              </el-button>
            </template>
          </div>
        </el-card>
        </div>
        </div>
      </div>
    </div>

    <el-drawer
      v-model="drawerVisible"
      title="错题本与收藏"
      direction="rtl"
      size="min(520px, 92vw)"
      class="jztk-drawer"
    >
      <el-tabs v-model="drawerTab">
        <el-tab-pane :label="`错题本 (${wrongBookCount})`" name="wrong">
          <div v-if="wrongBookCount === 0" class="drawer-empty">暂无错题</div>
          <el-scrollbar v-else max-height="70vh">
            <ul class="book-list">
              <li
                v-for="(item, idx) in lsState.wrongBook"
                :key="jztkQuestionKey(item) + '-' + idx"
                class="book-item"
              >
                <div class="book-item-text">{{ item.question }}</div>
                <div class="book-item-actions">
                  <el-button type="danger" link size="small" @click="removeWrongByKey(jztkQuestionKey(item))">
                    移除
                  </el-button>
                </div>
              </li>
            </ul>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane :label="`收藏 (${favoriteCount})`" name="fav">
          <div v-if="favoriteCount === 0" class="drawer-empty">暂无收藏</div>
          <el-scrollbar v-else max-height="70vh">
            <ul class="book-list">
              <li
                v-for="(item, idx) in lsState.favorites"
                :key="'f-' + jztkQuestionKey(item) + '-' + idx"
                class="book-item"
              >
                <div class="book-item-text">{{ item.question }}</div>
                <div class="book-item-actions">
                  <el-button type="warning" link size="small" @click="removeFavoriteByKey(jztkQuestionKey(item))">
                    取消收藏
                  </el-button>
                </div>
              </li>
            </ul>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Loading,
  ArrowLeft,
  Check,
  Close,
  CircleCloseFilled,
  Star,
  StarFilled,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import TopMenu from "./TopMenu.vue";
import "../styles/matrix-page.css";
import {
  fetchJztkQuestions,
  syncJztkToBackend,
  isJztkApiConfigured,
  isJztkSyncConfigured,
} from "@/api/jztk.js";
import {
  loadJztkSubjectState,
  saveJztkSubjectState,
  jztkQuestionKey,
  jztkUpsertWrongBook,
  jztkRemoveFromWrongBookByKey,
  jztkToggleFavorite,
  jztkIsFavorite,
  jztkShuffle,
} from "@/utils/jztkLocalStorage.js";

const route = useRoute();
const router = useRouter();

/** 累计答对图标色：固定蓝（避免样式/主题把勾渲染成绿） */
const JZTK_STAT_OK_BLUE = "#409eff";

/** 路由 ?subject=1|4，缺省科目一 */
const jztkSubject = computed(() => {
  const q = route.query.subject;
  const raw = Array.isArray(q) ? q[0] : q;
  const s = String(raw ?? "1").trim();
  return s === "4" ? "4" : "1";
});

/** 路由 ?mode=wrong 为错题练习 */
const practiceMode = computed(() => {
  const q = route.query.mode;
  const raw = Array.isArray(q) ? q[0] : q;
  return String(raw ?? "").toLowerCase() === "wrong" ? "wrong" : "api";
});

const isWrongMode = computed(() => practiceMode.value === "wrong");

/** 主页「查看收藏」等：?drawer=fav|wrong 打开侧栏对应 Tab */
const drawerQuery = computed(() => {
  const q = route.query.drawer;
  const raw = Array.isArray(q) ? q[0] : q;
  return String(raw ?? "").trim().toLowerCase();
});

const subjectLabel = computed(() =>
  jztkSubject.value === "4" ? "科目四" : "科目一"
);

const BATCH_SIZE =
  Number.parseInt(String(import.meta.env.VITE_JZTK_BATCH_SIZE || "10"), 10) ||
  10;

const TOTAL_QUESTIONS_DISPLAY =
  Number.parseInt(
    String(import.meta.env.VITE_JZTK_TOTAL_QUESTIONS || "1700"),
    10
  ) || 1700;

function goBackHome() {
  router.push({ path: "/jztk" });
}

function goRandomPractice() {
  router.replace({
    path: "/jztk/practice",
    query: { subject: jztkSubject.value },
  });
}

const apiReady = isJztkApiConfigured();

/** 与科目同步的本地状态 */
const lsState = ref(loadJztkSubjectState(jztkSubject.value));

function persistLs() {
  saveJztkSubjectState(jztkSubject.value, lsState.value);
}

const wrongBookCount = computed(() => lsState.value.wrongBook.length);
const favoriteCount = computed(() => lsState.value.favorites.length);

const showPracticeCard = computed(
  () =>
    apiReady ||
    isWrongMode.value ||
    drawerQuery.value === "fav" ||
    drawerQuery.value === "favorite" ||
    drawerQuery.value === "wrong"
);

const loading = ref(false);
const submitting = ref(false);
const queue = ref([]);
const currentIndex = ref(0);
const picked = ref("");
const showWrongFeedback = ref(false);
const wrongCollapseActive = ref(["wrong-detail"]);
const imgBroken = ref(false);
const sessionOffset = ref(0);
/** 错题模式：本轮是否已练完（队列为空且非加载中） */
const wrongRoundDone = ref(false);

const drawerVisible = ref(false);
const drawerTab = ref("wrong");

function applyDrawerFromRoute() {
  const d = drawerQuery.value;
  if (d === "fav" || d === "favorite") {
    drawerVisible.value = true;
    drawerTab.value = "fav";
  } else if (d === "wrong" || d === "book") {
    drawerVisible.value = true;
    drawerTab.value = "wrong";
  }
}

const current = computed(() => queue.value[currentIndex.value] || null);

const currentKey = computed(() =>
  current.value ? jztkQuestionKey(current.value) : ""
);

const currentIsFavorite = computed(() =>
  current.value
    ? jztkIsFavorite(lsState.value.favorites, currentKey.value)
    : false
);

const progressCurrent = computed(() => {
  if (!queue.value.length) return 0;
  return sessionOffset.value + currentIndex.value + 1;
});

const wrongProgressCurrent = computed(() => {
  if (!queue.value.length) return 0;
  return currentIndex.value + 1;
});

const optionList = computed(() => {
  const q = current.value;
  if (!q) return [];
  const t1 = (q.item1 ?? "").trim();
  const t2 = (q.item2 ?? "").trim();
  const t3 = (q.item3 ?? "").trim();
  const t4 = (q.item4 ?? "").trim();
  if (!t3 && !t4) {
    return [
      { key: "1", text: t1 || "正确" },
      { key: "2", text: t2 || "错误" },
    ];
  }
  const list = [
    { key: "1", text: t1 },
    { key: "2", text: t2 },
    { key: "3", text: t3 },
    { key: "4", text: t4 },
  ];
  return list.filter((x) => x.text);
});

function normalizeAnswerToKey(answer) {
  const s = String(answer ?? "").trim();
  if (/^[1-4]$/.test(s)) return s;
  const letterMap = { A: "1", B: "2", C: "3", D: "4", a: "1", b: "2", c: "3", d: "4" };
  return letterMap[s] ?? s;
}

const isCorrect = computed(() => {
  const q = current.value;
  if (!q || !picked.value) return false;
  return String(picked.value) === normalizeAnswerToKey(q.answer);
});

const correctLabel = computed(() => {
  const q = current.value;
  if (!q) return "";
  const ansKey = normalizeAnswerToKey(q.answer);
  const hit = optionList.value.find((o) => o.key === ansKey);
  const letter = optionKeyLetter(ansKey);
  return hit ? `${letter}. ${hit.text}` : letter;
});

const pickedPickLabel = computed(() => {
  if (!picked.value) return "";
  const hit = optionList.value.find((o) => o.key === String(picked.value));
  if (!hit) return "";
  return `${optionKeyLetter(hit.key)}. ${hit.text}`;
});

const hasNext = computed(
  () => currentIndex.value < queue.value.length - 1
);

const canGoPrev = computed(() => currentIndex.value > 0);

/** 本题曾提交的选项 key → 用于上一题/下一题恢复选择 */
const picksByQuestionKey = ref({});
/** 已提交过答案（已计分）的题目 key，防止回看已答对时改选重复计分 */
const statsSubmittedKeys = ref(new Set());

/** 答对后自动下一题的延迟定时器（可被「下一题」提前取消） */
const correctAdvanceTimerId = ref(null);

function clearCorrectAdvanceTimer() {
  if (correctAdvanceTimerId.value != null) {
    clearTimeout(correctAdvanceTimerId.value);
    correctAdvanceTimerId.value = null;
  }
}

function clearPickMemory() {
  clearCorrectAdvanceTimer();
  picksByQuestionKey.value = {};
  statsSubmittedKeys.value = new Set();
}

function memorySaveCurrentPick() {
  const q = current.value;
  if (!q || !picked.value) return;
  const k = jztkQuestionKey(q);
  picksByQuestionKey.value = {
    ...picksByQuestionKey.value,
    [k]: String(picked.value),
  };
}

function markStatsSubmitted(k) {
  const s = new Set(statsSubmittedKeys.value);
  s.add(k);
  statsSubmittedKeys.value = s;
}

/** 从记忆中恢复本题的选择与错题展开状态 */
function applyRestoredStateForCurrent() {
  const q = current.value;
  if (!q) {
    picked.value = "";
    showWrongFeedback.value = false;
    return;
  }
  const k = jztkQuestionKey(q);
  const saved = picksByQuestionKey.value[k];
  picked.value = saved != null && saved !== "" ? String(saved) : "";
  if (!picked.value) {
    showWrongFeedback.value = false;
  } else {
    const ok = String(picked.value) === normalizeAnswerToKey(q.answer);
    showWrongFeedback.value = !ok;
    if (showWrongFeedback.value) {
      wrongCollapseActive.value = ["wrong-detail"];
    }
  }
  imgBroken.value = false;
  submitting.value = false;
}

/** 已答对且已计分：回看时锁定选项，避免改选重复计分 */
const pickRevisitLocked = computed(() => {
  const q = current.value;
  if (!q || !picked.value) return false;
  const k = jztkQuestionKey(q);
  if (!statsSubmittedKeys.value.has(k)) return false;
  return String(picked.value) === normalizeAnswerToKey(q.answer);
});

const KEY_TO_LETTER = { 1: "A", 2: "B", 3: "C", 4: "D" };
function optionKeyLetter(key) {
  return KEY_TO_LETTER[String(key)] ?? key;
}

const optionsLayoutClass = computed(() => {
  const n = optionList.value.length;
  if (n === 2) return "options-layout-row";
  if (n >= 3) return "options-layout-grid";
  return "options-layout-single";
});

function onImgError() {
  imgBroken.value = true;
}

function initWrongQueue() {
  clearPickMemory();
  wrongRoundDone.value = false;
  const book = lsState.value.wrongBook;
  if (!book.length) {
    queue.value = [];
    currentIndex.value = 0;
    picked.value = "";
    showWrongFeedback.value = false;
    imgBroken.value = false;
    return;
  }
  queue.value = jztkShuffle(book);
  currentIndex.value = 0;
  applyRestoredStateForCurrent();
}

function restartWrongRound() {
  wrongRoundDone.value = false;
  initWrongQueue();
}

async function loadBatch(opts = {}) {
  /** 续批（如本批最后一题点「下一题」）：不弹同步类 Toast，避免打断刷题 */
  const suppressBatchToast = opts.silentToast === true;
  if (!apiReady || isWrongMode.value) return;
  const prevBatchCount = queue.value.length;
  if (suppressBatchToast) {
    sessionOffset.value += prevBatchCount;
  } else {
    sessionOffset.value = 0;
  }
  loading.value = true;
  clearPickMemory();
  queue.value = [];
  currentIndex.value = 0;
  wrongRoundDone.value = false;
  showWrongFeedback.value = false;
  picked.value = "";
  imgBroken.value = false;
  try {
    const data = await fetchJztkQuestions({
      subject: jztkSubject.value,
      batchSize: BATCH_SIZE,
    });
    queue.value = data.result;
    applyRestoredStateForCurrent();
    imgBroken.value = false;
    loading.value = false;

    const hasSync = isJztkSyncConfigured();

    if (hasSync) {
      if (suppressBatchToast) {
        void syncJztkToBackend(data).then((syncRet) => {
          if (!syncRet.ok && !syncRet.skipped) {
            console.warn(
              "[jztk] 续批同步后端失败（已静默，不影响刷题）：",
              syncRet.message || syncRet.status || "未知错误"
            );
          }
        });
      } else {
        const syncRet = await syncJztkToBackend(data);
        if (!syncRet.ok && !syncRet.skipped) {
          ElMessage.warning(
            `题目已加载，但同步后端失败（${syncRet.status || "?"}）：${
              syncRet.message || "未知错误"
            }`
          );
        } else if (syncRet.ok && !syncRet.skipped) {
          ElMessage.success("已同步到后端");
        }
      }
    }
  } catch (e) {
    ElMessage.error(e?.message || String(e));
  } finally {
    loading.value = false;
  }
}

function reloadForRoute() {
  lsState.value = loadJztkSubjectState(jztkSubject.value);
  if (isWrongMode.value) {
    loading.value = false;
    initWrongQueue();
  } else if (apiReady) {
    void loadBatch({ silentToast: false });
  } else {
    queue.value = [];
  }
}

watch([jztkSubject, practiceMode], () => {
  reloadForRoute();
});

watch(
  () => [jztkSubject.value, drawerQuery.value],
  () => {
    void nextTick(() => applyDrawerFromRoute());
  }
);

onMounted(() => {
  reloadForRoute();
  void nextTick(() => applyDrawerFromRoute());
});

onUnmounted(() => {
  clearCorrectAdvanceTimer();
});

function recordAnswerStats(wasCorrect) {
  if (wasCorrect) {
    lsState.value.stats.correct += 1;
  } else {
    lsState.value.stats.wrong += 1;
  }
  persistLs();
}

function addCurrentToWrongBook() {
  const q = current.value;
  if (!q) return;
  lsState.value.wrongBook = jztkUpsertWrongBook(lsState.value.wrongBook, q);
  persistLs();
}

function removeWrongFromBookIfCorrect() {
  const q = current.value;
  if (!q) return;
  const k = jztkQuestionKey(q);
  lsState.value.wrongBook = jztkRemoveFromWrongBookByKey(lsState.value.wrongBook, k);
  persistLs();
}

function removeWrongByKey(key) {
  lsState.value.wrongBook = jztkRemoveFromWrongBookByKey(lsState.value.wrongBook, key);
  persistLs();
  ElMessage.success("已从错题本移除");

  if (isWrongMode.value && queue.value.length) {
    const oldQ = queue.value;
    const removedIdx = oldQ.findIndex((q) => jztkQuestionKey(q) === key);
    if (removedIdx === -1) return;
    const newQ = oldQ.filter((q) => jztkQuestionKey(q) !== key);
    let newIndex = currentIndex.value;
    if (removedIdx < currentIndex.value) {
      newIndex = currentIndex.value - 1;
    } else if (removedIdx === currentIndex.value) {
      newIndex = Math.min(currentIndex.value, Math.max(0, newQ.length - 1));
    }
    queue.value = newQ;
    currentIndex.value = Math.max(0, Math.min(newIndex, Math.max(0, newQ.length - 1)));
    applyRestoredStateForCurrent();
    imgBroken.value = false;
    if (newQ.length === 0) {
      wrongRoundDone.value = true;
    }
  }
}

function removeFavoriteByKey(key) {
  lsState.value.favorites = lsState.value.favorites.filter(
    (x) => jztkQuestionKey(x) !== key
  );
  persistLs();
  ElMessage.success("已取消收藏");
}

function toggleFavoriteCurrent() {
  const q = current.value;
  if (!q) return;
  const { next, added } = jztkToggleFavorite(lsState.value.favorites, q);
  lsState.value.favorites = next;
  persistLs();
  ElMessage.success(added ? "已加入收藏" : "已取消收藏");
}

function onPick() {
  const q = current.value;
  if (!q || submitting.value || showWrongFeedback.value) return;
  const k = jztkQuestionKey(q);
  if (statsSubmittedKeys.value.has(k)) return;

  submitting.value = true;
  memorySaveCurrentPick();

  if (isCorrect.value) {
    markStatsSubmitted(k);
    recordAnswerStats(true);
    if (isWrongMode.value) {
      removeWrongFromBookIfCorrect();
    }
    showWrongFeedback.value = false;
    clearCorrectAdvanceTimer();
    correctAdvanceTimerId.value = window.setTimeout(() => {
      correctAdvanceTimerId.value = null;
      advanceQuestion();
      submitting.value = false;
    }, 380);
  } else {
    markStatsSubmitted(k);
    recordAnswerStats(false);
    addCurrentToWrongBook();
    showWrongFeedback.value = true;
    wrongCollapseActive.value = ["wrong-detail"];
    submitting.value = false;
  }
}

/** 进入下一题：清自动翻题定时器、保存当前选择、收起错题解析，再按模式分支处理 */
function advanceQuestion() {
  clearCorrectAdvanceTimer();
  memorySaveCurrentPick();
  showWrongFeedback.value = false;
  if (hasNext.value) {
    // 当前批次 / 错题队列里还有下一题
    currentIndex.value += 1;
    applyRestoredStateForCurrent();
    imgBroken.value = false;
  } else if (isWrongMode.value) {
    // 错题模式：已是最后一题，本轮结束
    queue.value = [];
    wrongRoundDone.value = true;
    picked.value = "";
    imgBroken.value = false;
    ElMessage.success("本轮错题已练完");
  } else {
    // 随机刷题：本批最后一题，静默续拉下一批（不弹同步成功等 Toast）
    void loadBatch({ silentToast: true });
  }
}

function goNext() {
  if (!current.value) return;
  const p = String(picked.value ?? "").trim();
  if (!p) {
    ElMessage.error("请先选择答案后再进入下一题");
    return;
  }
  // 答对后正在等自动「下一题」倒计时：用户提前点「下一题」则取消定时器并立刻翻题
  if (submitting.value && correctAdvanceTimerId.value != null) {
    clearCorrectAdvanceTimer();
    advanceQuestion();
    submitting.value = false;
    return;
  }
  const k = jztkQuestionKey(current.value);
  // 本题必须已点选并提交过（已计入统计），否则不允许跳过判题
  if (!statsSubmittedKeys.value.has(k)) {
    ElMessage.error("请先点击选项提交答案");
    return;
  }
  advanceQuestion();
}

function goPrev() {
  if (!canGoPrev.value || !current.value) return;
  memorySaveCurrentPick();
  currentIndex.value -= 1;
  applyRestoredStateForCurrent();
}
</script>

<style scoped>
.jztk-page {
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  padding: 1.25rem 0 2.5rem;
}

.jztk-practice-body {
  padding: 0 0 1rem;
}

.hero-section {
  text-align: center;
  padding: 1.5rem 1rem 0.75rem;
  color: rgb(15 23 42);
}

@media (prefers-color-scheme: dark) {
  .hero-section {
    color: rgb(245 245 247);
  }
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0;
  color: inherit;
  text-shadow: none;
}

.content-container {
  margin: 0 auto;
  padding: 0 1rem;
}

.config-alert {
  margin-bottom: 16px;
}

.jztk-card--in-panel {
  --el-card-bg-color: transparent;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0;
  overflow: visible;
}

.jztk-card--in-panel :deep(.el-card__header) {
  padding: 0;
  border-bottom: 1px solid rgb(0 0 0 / 0.06);
  background: transparent;
}

@media (prefers-color-scheme: dark) {
  .jztk-card--in-panel :deep(.el-card__header) {
    border-bottom-color: rgb(255 255 255 / 0.08);
  }
}

.jztk-card-header-inner {
  padding: 0 0.75rem 0.75rem;
}

.jztk-card {
  border-radius: 16px;
  border: 1px solid var(--site-border);
  background: var(--site-surface);
  backdrop-filter: blur(10px);
  box-shadow: var(--site-card-shadow);
}

.jztk-card--in-panel.jztk-card {
  border: none;
  background: transparent;
  backdrop-filter: none;
}

.card-header-stack {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  gap: 0;
}

.card-subject-bar {
  width: 100%;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 500;
  color: #606266;
  padding: 0.75rem 0.5rem 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgb(0 0 0 / 0.06);
  line-height: 1.4;
}

@media (prefers-color-scheme: dark) {
  .card-subject-bar {
    color: rgb(163 163 170);
    border-bottom-color: rgb(255 255 255 / 0.08);
  }
}

.header-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  flex-shrink: 0;
}

.header-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 4px;
  flex-shrink: 0;
}

.header-back-icon {
  font-size: 1em;
}

.card-header-stats {
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-header-stats--inline {
  padding: 0;
  margin: 0;
  border: none;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  font-size: 0.8125rem;
  color: #606266;
  line-height: 1;
}

.stat-chip-icon {
  font-size: 15px;
}

.stat-chip-num {
  font-variant-numeric: tabular-nums;
  min-width: 1.1em;
  font-size: 0.8125rem;
  color: #606266;
}

/*
 * 累计答对：字面量 #409eff + .jztk-page 提高优先级；path 强制 fill（避免仍呈绿）
 */
.jztk-page .card-header-stats--inline .stat-chip-icon--ok {
  color: #409eff !important;
}

.jztk-page .card-header-stats--inline .stat-chip-icon--ok :deep(svg) {
  color: #409eff !important;
  fill: #409eff !important;
}

.jztk-page .card-header-stats--inline .stat-chip-icon--ok :deep(path) {
  fill: #409eff !important;
}

.card-header-stats--inline .stat-chip-icon--bad {
  color: var(--el-color-danger) !important;
}

.card-header-stats--inline .stat-chip-icon--bad :deep(svg) {
  color: var(--el-color-danger);
}

.card-header-stats--inline .stat-chip-icon--bad :deep(path) {
  fill: var(--el-color-danger) !important;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #2c3e50;
}

.card-header-row {
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.header-progress {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex: 1;
  min-width: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: right;
}

.card-header i {
  color: var(--site-accent);
}

.header-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
  flex-shrink: 0;
}

.mode-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(230, 162, 60, 0.2);
  color: #b88230;
  margin-right: 4px;
}

.question-fav-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 14px;
  margin-bottom: 12px;
}

.btn-ic {
  margin-right: 4px;
  vertical-align: middle;
}

.state-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px 16px;
  color: #606266;
}

.state-center.muted {
  color: #909399;
  font-size: 0.9rem;
}

.empty-fallback {
  flex-direction: column;
  gap: 10px;
  text-align: center;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.spin {
  font-size: 22px;
}

.img-wrap {
  margin-bottom: 16px;
  text-align: center;
  background: #f5f7fa;
  border-radius: 12px;
  padding: 8px;
}

.q-img {
  max-width: 100%;
  max-height: 280px;
  object-fit: contain;
  vertical-align: middle;
}

.img-fail {
  padding: 24px;
  color: #909399;
  font-size: 0.9rem;
}

.question-text {
  font-size: 1.1rem;
  line-height: 1.55;
  color: #303133;
  margin-bottom: 18px;
  font-weight: 500;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.options-group.options-layout-row {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: stretch;
}

.options-group.options-layout-row :deep(.option-radio) {
  flex: 1;
  min-width: 0;
}

.options-group.options-layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.options-group.options-layout-grid :deep(.option-radio) {
  width: 100%;
  margin-right: 0 !important;
}

.options-group.options-layout-single :deep(.option-radio) {
  width: 100%;
}

.option-radio {
  margin-right: 0 !important;
  height: auto !important;
  padding: 12px 14px;
  white-space: normal;
  align-items: flex-start;
  font-size: 1.0625rem;
  line-height: 1.5;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.option-radio :deep(.el-radio__label) {
  font-size: inherit;
  line-height: inherit;
}

.opt-key {
  font-weight: 600;
  margin-right: 4px;
  color: var(--site-accent);
  font-size: inherit;
}

.option-radio.is-wrong-pick :deep(.el-radio__label) {
  color: #c45656;
}

.option-radio.is-wrong-pick.el-radio.is-bordered {
  border-color: #f89898;
  background: rgba(245, 108, 108, 0.08);
}

.option-radio.is-correct-ans.el-radio.is-bordered {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.option-radio.is-correct-ans :deep(.el-radio__label) {
  color: #337ecc;
}

.option-radio.is-correct-ans .opt-key {
  color: #409eff;
}

/* 未判题时选项悬停：轻微底色与边框变化 */
.option-radio.el-radio.is-bordered:not(.is-disabled):hover:not(.is-wrong-pick):not(.is-correct-ans) {
  border-color: #b3c7ff;
  background: rgb(37 99 235 / 0.07);
  box-shadow: 0 1px 4px rgb(37 99 235 / 0.12);
}

.wrong-collapse {
  margin-top: 14px;
  width: 100%;
  max-width: 100%;
  border: none;
  box-sizing: border-box;
  /* 整块（含粉条标题）与卡片右内边距对齐，避免贴边或被裁切 */
  padding-right: 14px;
  --el-collapse-header-height: auto;
}

.wrong-collapse :deep(.el-collapse-item) {
  max-width: 100%;
}

/*
 * Element Plus：.el-collapse-icon-position-right .el-collapse-item__header { padding-right: 8px }
 * 会覆盖我们原来的 padding，导致箭头贴卡片右缘；用 !important 收回左右留白。
 */
.wrong-collapse :deep(.el-collapse-item__header) {
  box-sizing: border-box;
  max-width: 100%;
  padding: 12px 16px !important;
  border-radius: 10px;
  background: rgba(245, 108, 108, 0.1);
  border: 1px solid rgba(245, 108, 108, 0.35);
  font-weight: 600;
  color: #c45656;
  line-height: 1.4;
  height: auto;
  min-height: 48px;
}

.wrong-collapse :deep(.el-collapse-item__wrap) {
  border: none;
}

.wrong-collapse :deep(.el-collapse-item__content) {
  padding-bottom: 0;
  /* 横向留白由外层 .wrong-collapse padding-right 统一处理，避免与 header 不对齐 */
  padding-left: 0;
  padding-right: 0;
  box-sizing: border-box;
}

.wrong-collapse-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.wrong-collapse-icon {
  font-size: 18px;
}

/* 解析过长时在区域内滚动，避免整页被撑得很长 */
.wrong-collapse-body {
  padding: 12px 4px 8px 0;
  max-height: min(62vh, 32rem);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
}

@supports (height: 100dvh) {
  .wrong-collapse-body {
    max-height: min(62dvh, 32rem);
  }
}

.your-pick-line {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #606266;
}

.correct-line {
  margin: 0 0 8px;
}

/* 与 .explain-text 同字号行高，正确答案不加粗放大 */
.explain-text-size {
  font-size: 0.9rem;
  line-height: 1.55;
  color: #606266;
}

.correct-answer-text {
  font-size: inherit;
  font-weight: 600;
  color: #303133;
}

.explain-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #606266;
}

.explain-html :deep(img) {
  max-width: 100%;
  height: auto;
  vertical-align: middle;
  border-radius: 6px;
  margin: 6px 0;
}

.explain-html :deep(p) {
  margin: 0 0 8px;
}

.explain-html :deep(p:last-child) {
  margin-bottom: 0;
}

.card-footer-nav {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

/* 返回、收藏与「上一题 / 下一题」统一为默认按钮字号 */
.header-back-btn,
.question-fav-row :deep(.el-button),
.card-footer-nav :deep(.el-button) {
  font-size: var(--el-font-size-base, 14px);
}


.drawer-empty {
  color: #909399;
  font-size: 0.9rem;
  padding: 16px 0;
}

.book-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.book-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.book-item-text {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #303133;
  margin-bottom: 8px;
  word-break: break-word;
}

.book-item-actions {
  display: flex;
  justify-content: flex-end;
}

.jztk-drawer :deep(.el-drawer__body) {
  padding-top: 0;
}

@media (max-width: 480px) {
  .title {
    font-size: 1.45rem;
  }
  .question-text {
    font-size: 1rem;
  }
  .option-radio {
    font-size: 1rem;
  }
}
</style>
