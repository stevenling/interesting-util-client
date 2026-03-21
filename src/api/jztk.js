/**
 * 驾考题目 API + Spring Boot 同步
 *
 * 环境变量（Vite）：
 * - VITE_JZTK_API_URL  拉题接口完整 URL（可带 query，如 key=xxx&subject=1）
 * - VITE_JZTK_SYNC_URL  每次拉题成功后 POST 到 Spring Boot 的地址（可为空则不同步）
 *   未配置时：前端会将本次接口返回的完整 JSON 触发浏览器下载到本机（下载目录）
 * - VITE_JZTK_SYNC_TOKEN 可选，存在则请求头 Authorization: Bearer <token>
 * - VITE_JZTK_ALSO_DOWNLOAD  已配置同步时仍要本机 JSON 备份：设为 1 或 true
 *
 * 刷题页会按所选科目在请求 URL 上设置 subject：1=科目一，4=科目四（与 Juhe / 常见后端一致）。
 * 可选 batchSize：查询参数 size=<n>（Spring 常见）；若你的接口用别的名字请在后端兼容或改此处）。
 */

const API_URL = import.meta.env.VITE_JZTK_API_URL || ""
/** 每批题量参数名，可通过 .env 覆盖，例如 VITE_JZTK_BATCH_SIZE_PARAM=count */
const BATCH_PARAM =
  (import.meta.env.VITE_JZTK_BATCH_SIZE_PARAM || "size").trim() || "size"
const SYNC_URL = import.meta.env.VITE_JZTK_SYNC_URL || ""
const SYNC_TOKEN = import.meta.env.VITE_JZTK_SYNC_TOKEN || ""
const ALSO_DL = import.meta.env.VITE_JZTK_ALSO_DOWNLOAD || ""

/**
 * 页面/同步使用的统一题目结构（与 Juhe result[] 单项对齐）
 * @typedef {object} JztkQuestionNormalized
 * @property {string|number} id
 * @property {string} question
 * @property {string} answer
 * @property {string} item1
 * @property {string} item2
 * @property {string} item3
 * @property {string} item4
 * @property {string} explains
 * @property {string|null} url 配图，无则为 null
 */

/**
 * @typedef {object} JztkApiResponse
 * @property {number} error_code
 * @property {string} [reason]
 * @property {JztkQuestionNormalized[]} result
 */

/**
 * Spring Boot / 自建接口：camelCase 题目 → 与 Juhe 一致字段
 * @param {Record<string, unknown>} raw
 * @returns {JztkQuestionNormalized}
 */
export function normalizeJztkQuestion(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      question: "",
      answer: "",
      item1: "",
      item2: "",
      item3: "",
      item4: "",
      explains: "",
      url: null,
    }
  }
  const hasSpringShape =
    Object.prototype.hasOwnProperty.call(raw, "questionText") ||
    Object.prototype.hasOwnProperty.call(raw, "questionId") ||
    Object.prototype.hasOwnProperty.call(raw, "imageUrl")

  if (hasSpringShape) {
    const imageUrl = raw.imageUrl
    return {
      id: raw.questionId ?? raw.id ?? "",
      question: String(raw.questionText ?? raw.question ?? ""),
      answer: String(raw.answer ?? "").trim(),
      item1: String(raw.item1 ?? ""),
      item2: String(raw.item2 ?? ""),
      item3: String(raw.item3 ?? ""),
      item4: String(raw.item4 ?? ""),
      explains: String(raw.explains ?? ""),
      url:
        imageUrl != null && String(imageUrl).trim() !== ""
          ? String(imageUrl)
          : null,
    }
  }

  return {
    id: raw.id ?? "",
    question: String(raw.question ?? ""),
    answer: String(raw.answer ?? "").trim(),
    item1: String(raw.item1 ?? ""),
    item2: String(raw.item2 ?? ""),
    item3: String(raw.item3 ?? ""),
    item4: String(raw.item4 ?? ""),
    explains: String(raw.explains ?? ""),
    url:
      raw.url != null && String(raw.url).trim() !== ""
        ? String(raw.url)
        : null,
  }
}

/**
 * 在环境变量基址上附带科目、本批题量（覆盖已有同名 query）
 * @param {string|number} [subject=1] 1=科目一，4=科目四
 * @param {number} [batchSize] 本批题目数量；不传则不附加题量参数
 * @returns {string}
 */
export function resolveJztkApiUrl(subject = "1", batchSize) {
  const base = (API_URL || "").trim()
  if (!base) return ""
  const sub = String(subject).replace(/[^\d]/g, "") || "1"
  const n =
    batchSize != null && Number(batchSize) > 0
      ? Math.min(500, Math.floor(Number(batchSize)))
      : null
  try {
    const isAbsolute = /^https?:\/\//i.test(base)
    const url = isAbsolute
      ? new URL(base)
      : new URL(
          base.startsWith("/") ? base : `/${base}`,
          typeof window !== "undefined" && window.location?.origin
            ? window.location.origin
            : "http://localhost"
        )
    url.searchParams.set("subject", sub)
    if (n != null) {
      url.searchParams.set(BATCH_PARAM, String(n))
    }
    return isAbsolute ? url.href : `${url.pathname}${url.search}${url.hash}`
  } catch {
    let extra = `subject=${encodeURIComponent(sub)}`
    if (n != null) {
      extra += `&${encodeURIComponent(BATCH_PARAM)}=${encodeURIComponent(String(n))}`
    }
    const sep = base.includes("?") ? "&" : "?"
    return `${base}${sep}${extra}`
  }
}

/**
 * 将 fetch 网络层错误转成更易排查的中文提示（浏览器原生多为 Failed to fetch）
 * @param {unknown} err
 * @param {"api"|"sync"} [kind]
 * @returns {Error}
 */
function toJztkFetchError(err, kind = "api") {
  const msg = err instanceof Error ? err.message : String(err)
  const lower = msg.toLowerCase()
  if (
    msg === "Failed to fetch" ||
    lower.includes("networkerror") ||
    lower.includes("load failed") ||
    lower.includes("network request failed")
  ) {
    const isSync = kind === "sync"
    const target = isSync ? "同步后端" : "题目接口"
    const envKey = isSync ? "VITE_JZTK_SYNC_URL" : "VITE_JZTK_API_URL"
    return new Error(
      `网络请求失败，无法连接${target}。请检查：1) 后端是否已启动、${envKey} 地址端口是否正确；2) 是否跨域（需在接口服务配置 CORS，或开发环境用 Vite 代理同源访问）；3) 若页面为 HTTPS，接口不可为 HTTP；4) 网络/VPN 是否稳定。`
    )
  }
  return err instanceof Error ? err : new Error(msg)
}

/**
 * 从第三方 Juhe、或 Spring Boot（如 /jztk/question/random）获取题目 JSON
 * @param {{ subject?: string|number, batchSize?: number }} [options] subject：1=科目一，4=科目四；batchSize：本批题数（由刷题页传入，默认 10）
 * @returns {Promise<JztkApiResponse>}
 */
export async function fetchJztkQuestions(options = {}) {
  const subject = options.subject ?? "1"
  const batchSize = options.batchSize
  const requestUrl = resolveJztkApiUrl(subject, batchSize)
  if (!requestUrl) {
    throw new Error(
      "未配置 VITE_JZTK_API_URL，请在 .env / .env.local 中配置驾考题目接口地址"
    )
  }
  let res
  try {
    res = await fetch(requestUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    })
  } catch (e) {
    throw toJztkFetchError(e, "api")
  }
  if (!res.ok) {
    throw new Error(`拉题失败：HTTP ${res.status}`)
  }
  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(
      "题目接口返回不是合法 JSON，请确认 VITE_JZTK_API_URL 指向拉题接口且未被代理/登录页劫持。"
    )
  }

  /** Spring Boot：直接返回题目数组 */
  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new Error("本次未返回题目（空数组）")
    }
    return {
      error_code: 0,
      reason: "ok",
      result: data.map((q) => normalizeJztkQuestion(q)),
    }
  }

  /** 聚合 Juhe：{ error_code, result }（优先于 data，避免与统一响应里多余字段冲突） */
  if (typeof data.error_code === "number") {
    if (data.error_code !== 0) {
      throw new Error(data.reason || `接口错误 error_code=${data.error_code}`)
    }
    if (!Array.isArray(data.result) || data.result.length === 0) {
      throw new Error("本次未返回题目（result 为空）")
    }
    return {
      ...data,
      result: data.result.map((q) => normalizeJztkQuestion(q)),
    }
  }

  /**
   * Spring / RuoYi 等：{ code: 200|0, msg, data: [...] }
   * 不再要求「没有 result 字段」：部分全局包装会带空 result: []，会导致旧逻辑整段跳过并报格式错
   */
  if (data && Array.isArray(data.data)) {
    if (data.data.length === 0) {
      throw new Error("本次未返回题目（data 为空）")
    }
    const c = data.code
    if (typeof c === "number" && c !== 200 && c !== 0) {
      throw new Error(data.msg || `接口错误 code=${c}`)
    }
    return {
      error_code: 0,
      reason: String(data.msg || "ok"),
      result: data.data.map((q) => normalizeJztkQuestion(q)),
    }
  }

  throw new Error(
    "接口返回格式异常：需为题目数组、或 { code, data }、或 Juhe { error_code, result }"
  )
}

/**
 * 将完整响应体 POST 到 Spring Boot，便于后端落库（与第三方 JSON 结构一致）
 * @param {JztkApiResponse} payload
 * @returns {Promise<{ ok: boolean, skipped?: boolean, status?: number, message?: string }>}
 */
export async function syncJztkToBackend(payload) {
  if (!SYNC_URL) {
    return { ok: true, skipped: true }
  }
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }
  if (SYNC_TOKEN) {
    headers.Authorization = `Bearer ${SYNC_TOKEN}`
  }
  let res
  try {
    res = await fetch(SYNC_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      credentials: "omit",
    })
  } catch (e) {
    return { ok: false, message: toJztkFetchError(e, "sync").message }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return {
      ok: false,
      status: res.status,
      message: text || res.statusText,
    }
  }
  return { ok: true, status: res.status }
}

export function isJztkApiConfigured() {
  return Boolean(API_URL)
}

/** 是否已配置 Spring Boot 同步地址 */
export function isJztkSyncConfigured() {
  return Boolean(SYNC_URL && SYNC_URL.trim())
}

/** 已配后端时是否仍下载 JSON 备份 */
export function shouldJztkAlsoDownloadBackup() {
  const v = String(ALSO_DL).toLowerCase()
  return v === "1" || v === "true" || v === "yes"
}

/**
 * 将聚合数据返回的完整对象保存为本机 JSON 文件（通过浏览器下载，无法直接写入仓库目录）
 * @param {JztkApiResponse} payload
 * @param {string} [filename]
 */
export function downloadJztkResponseAsJsonFile(payload, filename) {
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download =
    filename ||
    `jztk-response-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
