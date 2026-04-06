/**
 * 背单词 · Anki 词库 API（FastAPI /api/word-memorize/...）
 * 开发环境走 Vite 代理 /api → VITE_DEV_PROXY_TARGET（默认 127.0.0.1:11219）
 *
 * GET /jobs/{id}/words 支持 limit/offset：可先请求一页（如 100 条）立刻展示，再按需继续 offset 拉取。
 */

const BASE = '/api/word-memorize'

function joinUrl(path) {
  const p = String(path || '').replace(/^\//, '')
  return `${BASE.replace(/\/$/, '')}/${p}`
}

/**
 * 单次分页请求（返回体含 words、scanned、limit、offset 等，与后端一致）。
 * @param {number} jobId
 * @param {{ offset?: number, pageSize?: number, zhMax?: number }} [options] zhMax=0 表示释义不截断
 * @returns {Promise<{ job_id: number, source_filename: string, deck_hint: string | null, words: Array<{ en: string, phonetic: string, zh: string }>, scanned: number, limit: number, offset: number, returned: number }>}
 */
export async function fetchAnkiWordsPage(jobId, options = {}) {
  const offset = options.offset ?? 0
  const pageSize = options.pageSize ?? 100
  const zhMax = options.zhMax ?? 4000

  const qs = new URLSearchParams()
  qs.set('limit', String(pageSize))
  qs.set('offset', String(offset))
  qs.set('zh_max', String(zhMax))

  const res = await fetch(`${joinUrl(`jobs/${jobId}/words`)}?${qs}`, {
    credentials: 'same-origin',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * @returns {Promise<{ jobs: Array<{ id: number, source_filename: string, deck_hint: string | null, note_count: number, imported_at: string | null }> }>}
 */
export async function fetchAnkiImportJobs() {
  const res = await fetch(joinUrl('jobs'), { credentials: 'same-origin' })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * 拉取某导入批次的全部词条（按页循环直至扫完 DB）；仅适合需要一次性全量的场景。
 * @param {number} jobId
 * @param {{ pageSize?: number, zhMax?: number }} [options]
 * @returns {Promise<{ job_id: number, source_filename: string, deck_hint: string | null, words: Array<{ en: string, phonetic: string, zh: string }> }>}
 */
export async function fetchAnkiWordsForJob(jobId, options = {}) {
  const pageSize = options.pageSize ?? 100
  const zhMax = options.zhMax ?? 4000

  /** @type {Array<{ en: string, phonetic: string, zh: string }>} */
  const words = []
  let offset = 0
  /** @type {{ job_id?: number, source_filename?: string, deck_hint?: string | null }} */
  let meta = {}

  const maxPages = 500
  let finished = false
  for (let page = 0; page < maxPages; page += 1) {
    const data = await fetchAnkiWordsPage(jobId, {
      offset,
      pageSize,
      zhMax,
    })

    if (offset === 0) {
      meta = {
        job_id: data.job_id,
        source_filename: data.source_filename,
        deck_hint: data.deck_hint,
      }
    }

    const batch = Array.isArray(data.words) ? data.words : []
    words.push(...batch)

    const scanned = Number(data.scanned)
    if (!Number.isFinite(scanned)) {
      throw new Error('词库接口未返回有效的 scanned 字段，无法分页拉全量')
    }
    if (scanned < pageSize) {
      finished = true
      break
    }
    offset += scanned
  }

  if (!finished) {
    throw new Error(
      `词库分页超过 ${maxPages} 次仍未结束，请检查接口或在前端增大 pageSize`,
    )
  }

  return {
    job_id: meta.job_id ?? jobId,
    source_filename: meta.source_filename ?? '',
    deck_hint: meta.deck_hint ?? null,
    words,
  }
}
