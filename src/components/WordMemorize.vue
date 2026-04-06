<template>
  <div
    class="matrix-root word-mem-root relative flex min-h-screen flex-col overflow-hidden text-slate-900 dark:text-neutral-100"
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

    <el-tooltip content="返回小工具集" placement="right">
      <RouterLink
        to="/utilIndex"
        class="word-mem-back fixed left-5 top-5 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white/80 text-slate-600 shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-white/95 hover:text-slate-900 sm:left-8 sm:top-7 dark:border-white/[0.12] dark:bg-zinc-900/70 dark:text-neutral-300 dark:hover:bg-zinc-800/80 dark:hover:text-white"
        aria-label="返回小工具集"
      >
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </RouterLink>
    </el-tooltip>

    <div class="relative z-10 flex flex-1 flex-col px-6 pb-16 pt-20 sm:pt-24">
      <header class="matrix-hero mb-8 text-center sm:mb-10">
        <p
          class="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-neutral-500 sm:text-xs"
        >
          Vocabulary
        </p>
        <h1
          class="mx-auto max-w-lg text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.03em] text-slate-900 dark:text-white sm:text-4xl"
        >
          背单词
        </h1>
        <p
          class="mx-auto mt-3 max-w-md text-[15px] font-normal leading-relaxed text-slate-600 dark:text-neutral-400 sm:text-base"
        >
          <template v-if="phase === 'pick'">
            选择一个词库，进入卡片背诵；可随时返回更换词库
          </template>
          <template v-else>
            当前词库：<strong class="font-semibold text-slate-800 dark:text-neutral-200">{{ activeDeckTitle }}</strong>
          </template>
        </p>
        <div
          class="matrix-divider mx-auto mt-8 h-px w-12 rounded-full"
          aria-hidden="true"
        />
      </header>

      <!-- 词库选择：卡片网格 -->
      <div
        v-if="phase === 'pick'"
        class="mx-auto w-full max-w-4xl flex-1 px-0 sm:px-2"
      >
        <p
          v-if="jobsLoadError"
          class="mb-4 rounded-lg border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        >
          服务端词库加载失败：{{ jobsLoadError }}（本地示例词库仍可使用）
        </p>
        <div class="deck-grid">
          <button
            v-for="d in staticDeckCards"
            :key="d.id"
            type="button"
            class="deck-card"
            :disabled="deckLoading"
            @click="selectDeck(d)"
          >
            <span class="deck-card-count">{{ d.words.length }} 词</span>
            <h2 class="deck-card-title">
              {{ d.title }}
            </h2>
            <p class="deck-card-desc">
              {{ d.desc }}
            </p>
            <span class="deck-card-cta">开始背诵</span>
          </button>
          <template v-if="jobsLoading">
            <div
              v-for="n in 2"
              :key="'sk-' + n"
              class="deck-card deck-card--skeleton pointer-events-none animate-pulse"
            >
              <span class="deck-card-count h-3 w-16 rounded bg-slate-200 dark:bg-zinc-700" />
              <h2 class="deck-card-title mt-2 h-6 w-3/4 rounded bg-slate-200 dark:bg-zinc-700" />
              <p class="deck-card-desc mt-2 h-10 w-full rounded bg-slate-100 dark:bg-zinc-800" />
            </div>
          </template>
          <template v-else>
            <button
              v-for="d in ankiDeckCards"
              :key="d.id"
              type="button"
              class="deck-card"
              :disabled="deckLoading"
              @click="selectDeck(d)"
            >
              <span class="deck-card-count">{{ d.noteCount }} 词 · Anki</span>
              <h2 class="deck-card-title">
                {{ d.title }}
              </h2>
              <p class="deck-card-desc">
                {{ d.desc }}
              </p>
              <span class="deck-card-cta">{{ deckLoading ? '加载中…' : '开始背诵' }}</span>
            </button>
          </template>
        </div>
      </div>

      <!-- 背诵 -->
      <div
        v-else
        class="mx-auto w-full max-w-lg flex-1"
      >
        <div class="matrix-tool-panel px-5 py-6 sm:px-8 sm:py-8">
          <div class="mb-4 flex flex-col items-center gap-2">
            <div class="flex flex-wrap items-center justify-center gap-3">
              <p class="text-center text-sm text-slate-500 dark:text-neutral-400">
                {{ currentIndex + 1 }} / {{ deck.length }}
              </p>
              <el-button
                size="small"
                text
                type="primary"
                class="shrink-0"
                @click="goPickDecks"
              >
                更换词库
              </el-button>
            </div>
            <p
              v-if="ankiBgLoading || ankiBgLabel"
              class="text-center text-xs text-slate-400 dark:text-neutral-500"
            >
              {{ ankiBgLoading ? (ankiBgLabel || "后台加载词条…") : ankiBgLabel }}
            </p>
          </div>

          <div
            class="word-mem-card mb-6 min-h-[11rem] rounded-xl border border-black/[0.06] bg-white/60 px-5 py-8 text-center dark:border-white/[0.08] dark:bg-zinc-900/40"
          >
            <p class="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-neutral-500">
              英文
            </p>
            <p class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {{ current.en }}
            </p>
            <p
              v-if="current.phonetic"
              class="mt-2 font-mono text-sm text-slate-500 dark:text-neutral-400"
            >
              {{ current.phonetic }}
            </p>

            <template v-if="revealed">
              <div
                class="mx-auto my-5 h-px max-w-[12rem] bg-black/[0.08] dark:bg-white/[0.1]"
                aria-hidden="true"
              />
              <p class="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                释义
              </p>
              <p class="text-lg leading-relaxed text-slate-800 dark:text-neutral-100">
                {{ current.zh }}
              </p>
            </template>
            <p
              v-else
              class="mt-8 text-sm text-slate-400 dark:text-neutral-500"
            >
              想一想，再点下方「显示释义」
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <el-button
              v-if="!revealed"
              type="primary"
              class="word-mem-btn-primary"
              @click="revealed = true"
            >
              显示释义
            </el-button>
            <template v-else>
              <el-button type="primary" plain @click="goPrev">
                上一词
              </el-button>
              <el-button type="primary" @click="goNext">
                下一词
              </el-button>
            </template>
          </div>

          <div class="mt-6 flex flex-wrap justify-center gap-2 border-t border-black/[0.06] pt-6 dark:border-white/[0.08]">
            <el-button size="small" @click="shuffleDeck">
              打乱顺序
            </el-button>
            <el-button size="small" @click="resetReveal">
              隐藏释义
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import "../styles/matrix-page.css";
import { WORD_DECKS } from "@/data/wordMemorizeDecks.js";
import {
  fetchAnkiImportJobs,
  fetchAnkiWordsPage,
} from "@/api/wordMemorize.js";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const phase = ref("pick");
const activeDeckTitle = ref("");
/** 当前词库原文（打乱时从此复制，避免改到源数据） */
const sourceWords = ref([]);
const deck = ref([]);
const currentIndex = ref(0);
const revealed = ref(false);
const jobsLoading = ref(true);
const jobsLoadError = ref("");
const apiJobs = ref([]);
const deckLoading = ref(false);
/** 切换词库时递增，用于取消上一批 Anki 后台拉取 */
const ankiLoadGen = ref(0);
const ankiBgLoading = ref(false);
const ankiBgLabel = ref("");

const staticDeckCards = computed(() =>
  WORD_DECKS.map((d) => ({
    kind: "static",
    id: d.id,
    title: d.title,
    desc: d.desc,
    words: d.words,
  })),
);

const ankiDeckCards = computed(() =>
  apiJobs.value.map((j) => ({
    kind: "anki",
    id: `anki-job-${j.id}`,
    jobId: j.id,
    title: j.source_filename || `导入 #${j.id}`,
    noteCount: j.note_count,
    desc: [
      j.deck_hint ? `牌组：${j.deck_hint}` : null,
      j.imported_at ? `导入于 ${j.imported_at.slice(0, 10)}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "来自服务端 anki_notes",
  })),
);

const current = computed(() => deck.value[currentIndex.value] ?? deck.value[0]);

watch(currentIndex, () => {
  revealed.value = false;
});

const ANKI_PAGE_SIZE = 100;
const ANKI_ZH_MAX = 4000;

function mapRawWords(raw) {
  return (Array.isArray(raw) ? raw : []).map((w) => ({
    en: String(w.en ?? "").trim(),
    phonetic: String(w.phonetic ?? "").trim(),
    zh: String(w.zh ?? "").trim(),
  }));
}

/**
 * 首屏之后继续 offset 拉取，追加到 sourceWords / deck（接到当前背诵列表末尾）。
 */
async function fetchRemainingAnkiWords(jobId, startOffset, gen, noteTotal) {
  if (gen !== ankiLoadGen.value) return;
  let offset = startOffset;
  ankiBgLoading.value = true;
  const maxPages = 500;

  try {
    for (let i = 0; i < maxPages; i += 1) {
      if (gen !== ankiLoadGen.value) return;

      const data = await fetchAnkiWordsPage(jobId, {
        offset,
        pageSize: ANKI_PAGE_SIZE,
        zhMax: ANKI_ZH_MAX,
      });
      const batch = mapRawWords(data.words).filter((w) => w.en || w.zh);

      if (batch.length) {
        sourceWords.value = sourceWords.value.concat(batch);
        deck.value = deck.value.concat(batch);
      }

      const n = sourceWords.value.length;
      ankiBgLabel.value =
        noteTotal != null && noteTotal > 0
          ? `已加载 ${n} / ${noteTotal} 词，后台继续…`
          : `已加载 ${n} 词，后台继续…`;

      const scanned = Number(data.scanned);
      if (!Number.isFinite(scanned)) break;
      if (scanned < ANKI_PAGE_SIZE) break;
      offset += scanned;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e ?? "请求失败");
    ElMessage.warning(`后续词条加载中断：${msg}`);
  } finally {
    if (gen === ankiLoadGen.value) {
      ankiBgLoading.value = false;
      const n = sourceWords.value.length;
      if (noteTotal != null && noteTotal > 0) {
        ankiBgLabel.value =
          n >= noteTotal ? `已加载全部 ${n} 词` : `已加载 ${n} / ${noteTotal} 词`;
      } else {
        ankiBgLabel.value = `已加载 ${n} 词`;
      }
    }
  }
}

onMounted(async () => {
  jobsLoading.value = true;
  jobsLoadError.value = "";
  try {
    const { jobs } = await fetchAnkiImportJobs();
    apiJobs.value = Array.isArray(jobs) ? jobs : [];
  } catch (e) {
    jobsLoadError.value =
      e instanceof Error ? e.message : String(e ?? "未知错误");
    apiJobs.value = [];
  } finally {
    jobsLoading.value = false;
  }
});

/**
 * 选中一个词库并进入背诵：Anki 批次走接口拉 anki_notes 解析后的词条；本地静态词库直接用内存数据。
 * @param {{ kind: 'anki'|'static', words?: Array, jobId?: number, title: string }} d
 */
async function selectDeck(d) {
  // 防止连点：Anki 词条请求未完成前忽略新的选择
  if (deckLoading.value) return;

  if (d.kind === "anki") {
    ankiLoadGen.value += 1;
    const gen = ankiLoadGen.value;
    ankiBgLabel.value = "";
    ankiBgLoading.value = false;

    deckLoading.value = true;
    let firstData;
    try {
      firstData = await fetchAnkiWordsPage(d.jobId, {
        offset: 0,
        pageSize: ANKI_PAGE_SIZE,
        zhMax: ANKI_ZH_MAX,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e ?? "请求失败");
      ElMessage.error(`加载词库失败：${msg}`);
      deckLoading.value = false;
      return;
    } finally {
      deckLoading.value = false;
    }

    const wordsFirst = mapRawWords(firstData.words).filter((w) => w.en || w.zh);
    if (!wordsFirst.length) {
      ElMessage.warning("该批次暂无可用词条（请检查 anki 模型字段名是否匹配）");
      return;
    }

    activeDeckTitle.value = d.title;
    sourceWords.value = wordsFirst.map((w) => ({ ...w }));
    deck.value = shuffleArray(wordsFirst);
    currentIndex.value = 0;
    revealed.value = false;
    phase.value = "study";

    const scanned0 = Number(firstData.scanned);
    const noteTotal =
      typeof d.noteCount === "number" ? d.noteCount : null;
    if (Number.isFinite(scanned0) && scanned0 >= ANKI_PAGE_SIZE) {
      const n0 = wordsFirst.length;
      ankiBgLabel.value =
        noteTotal != null && noteTotal > 0
          ? `已加载 ${n0} / ${noteTotal} 词，后台继续…`
          : `已加载 ${n0} 词，后台继续…`;
      void fetchRemainingAnkiWords(d.jobId, scanned0, gen, noteTotal);
    } else {
      ankiBgLabel.value =
        noteTotal != null && noteTotal > 0
          ? `已加载 ${wordsFirst.length} / ${noteTotal} 词`
          : `已加载 ${wordsFirst.length} 词`;
    }
    return;
  }

  ankiLoadGen.value += 1;
  ankiBgLoading.value = false;
  ankiBgLabel.value = "";
  // 本地 WORD_DECKS：无需请求，d.words 已在打包数据中
  activeDeckTitle.value = d.title;
  sourceWords.value = d.words.map((w) => ({ ...w }));
  deck.value = shuffleArray(d.words);
  currentIndex.value = 0;
  revealed.value = false;
  phase.value = "study";
}

function goPickDecks() {
  ankiLoadGen.value += 1;
  ankiBgLoading.value = false;
  ankiBgLabel.value = "";
  phase.value = "pick";
  deck.value = [];
  sourceWords.value = [];
  currentIndex.value = 0;
  revealed.value = false;
  activeDeckTitle.value = "";
}

function goNext() {
  if (currentIndex.value < deck.value.length - 1) {
    currentIndex.value += 1;
  } else {
    currentIndex.value = 0;
  }
  revealed.value = false;
}

function goPrev() {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  } else {
    currentIndex.value = deck.value.length - 1;
  }
  revealed.value = false;
}

function shuffleDeck() {
  if (!sourceWords.value.length) return;
  deck.value = shuffleArray(sourceWords.value);
  currentIndex.value = 0;
  revealed.value = false;
}

function resetReveal() {
  revealed.value = false;
}
</script>

<style scoped>
.deck-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .deck-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .deck-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.deck-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 1.25rem 1.35rem;
  border-radius: 1rem;
  border: 1px solid rgb(0 0 0 / 0.06);
  background: rgb(255 255 255 / 0.72);
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.75) inset,
    0 1px 2px rgb(0 0 0 / 0.04),
    0 12px 32px rgb(15 23 42 / 0.06);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.deck-card:hover {
  transform: translateY(-3px);
  border-color: rgb(0 0 0 / 0.1);
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.9) inset,
    0 4px 12px rgb(0 0 0 / 0.06),
    0 16px 40px rgb(15 23 42 / 0.08);
}

.deck-card:focus-visible {
  outline: 2px solid rgb(100 116 139);
  outline-offset: 2px;
}

.deck-card:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

@media (prefers-color-scheme: dark) {
  .deck-card {
    border-color: rgb(255 255 255 / 0.1);
    background: rgb(28 28 30 / 0.55);
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 0.04) inset,
      0 1px 2px rgb(0 0 0 / 0.35),
      0 12px 40px rgb(0 0 0 / 0.35);
  }

  .deck-card:hover {
    border-color: rgb(255 255 255 / 0.14);
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 0.06) inset,
      0 8px 24px rgb(0 0 0 / 0.45);
  }
}

.deck-card-count {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin-bottom: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  .deck-card-count {
    color: rgb(163 163 170);
  }
}

.deck-card-title {
  margin: 0 0 0.35rem;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: rgb(15 23 42);
}

@media (prefers-color-scheme: dark) {
  .deck-card-title {
    color: rgb(250 250 250);
  }
}

.deck-card-desc {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  line-height: 1.55;
  color: rgb(100 116 139);
  flex: 1;
}

@media (prefers-color-scheme: dark) {
  .deck-card-desc {
    color: rgb(163 163 170);
  }
}

.deck-card-cta {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgb(51 65 85);
}

@media (prefers-color-scheme: dark) {
  .deck-card-cta {
    color: rgb(203 213 225);
  }
}

.word-mem-btn-primary.el-button--primary {
  background-color: rgb(51 65 85);
  border-color: rgb(51 65 85);
}

.word-mem-btn-primary.el-button--primary:hover {
  background-color: rgb(71 85 105);
  border-color: rgb(71 85 105);
}

@media (prefers-color-scheme: dark) {
  .word-mem-btn-primary.el-button--primary {
    background-color: rgb(71 85 105);
    border-color: rgb(100 116 139);
  }

  .word-mem-btn-primary.el-button--primary:hover {
    background-color: rgb(100 116 139);
    border-color: rgb(148 163 184);
  }
}
</style>
