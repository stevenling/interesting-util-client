/**
 * 驾考题目 API + 可选同步 POST
 *
 * 环境变量（Vite）：
 * - VITE_JZTK_API_URL  拉题基址。开发推荐 `/api`，由 Vite 代理到本机 FastAPI（默认目标
 *   `VITE_DEV_PROXY_TARGET` 或 `http://localhost:11219`，见 vite.config.js）。生产可用 Nginx
 *   同源反代 `/api`（见 docs/JZTK_NGINX.md）。直连 FastAPI 示例：`http://127.0.0.1:11219/api`。
 *   未包含 …/question/random 时会自动拼接 VITE_JZTK_API_RANDOM_PATH（默认 /jztk/question/random）。
 * - VITE_JZTK_SYNC_URL  同步 POST 地址；同源反代时写 `/api/jztk/sync` 等相对路径（可为空则不同步）
 * - VITE_JZTK_SYNC_TOKEN 可选，存在则请求头 Authorization: Bearer <token>
 *
 * 刷题页会按所选科目在请求 URL 上设置 subject：1=科目一，4=科目四（与 Juhe / 常见后端一致）。
 * 可选 batchSize：查询参数 size=<n>；若你的接口用别的名字请在后端兼容或改此处）。
 */

const API_URL = import.meta.env.VITE_JZTK_API_URL || ""
/** 拉题路径（拼在基址后）；Nginx 下浏览器请求 /api/jztk/question/random，rewrite 后对应后端 /jztk/question/random */
const API_RANDOM_PATH =
  (import.meta.env.VITE_JZTK_API_RANDOM_PATH || "/jztk/question/random").trim() ||
  "/jztk/question/random"

/** 每批题量参数名，可通过 .env 覆盖，例如 VITE_JZTK_BATCH_SIZE_PARAM=count */
const BATCH_PARAM =
  (import.meta.env.VITE_JZTK_BATCH_SIZE_PARAM || "size").trim() || "size"
const SYNC_URL = import.meta.env.VITE_JZTK_SYNC_URL || ""
const SYNC_TOKEN = import.meta.env.VITE_JZTK_SYNC_TOKEN || ""

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
 * 解析拉题 URL：基址 /api 或完整 URL；未含 question/random 时拼接 API_RANDOM_PATH
 * @returns {string}
 */
function getJztkRandomFetchBase() {
  const raw = (API_URL || "").trim()
  if (!raw) return ""
  const suffix = API_RANDOM_PATH.startsWith("/")
    ? API_RANDOM_PATH
    : `/${API_RANDOM_PATH}`

  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw)
      if (/question\/random/i.test(u.pathname)) return raw
      u.pathname = `${u.pathname.replace(/\/+$/, "")}${suffix}`
      return u.href
    } catch {
      return raw
    }
  }

  const pathOnly = raw.split(/[?#]/)[0] || raw
  if (/question\/random/i.test(pathOnly)) return raw
  const base = raw.replace(/\/+$/, "")
  return `${base}${suffix}`
}

/**
 * 在环境变量基址上附带科目、本批题量（覆盖已有同名 query）
 * @param {string|number} [subject=1] 1=科目一，4=科目四
 * @param {number} [batchSize] 本批题目数量；不传则不附加题量参数
 * @returns {string}
 */
export function resolveJztkApiUrl(subject = "1", batchSize) {
  const base = getJztkRandomFetchBase()
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
 * 从第三方 Juhe、或本仓库 FastAPI（如 /jztk/question/random）等获取题目 JSON
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
    let bodySnippet = ""
    try {
      bodySnippet = (await res.text()).trim().slice(0, 240)
    } catch {
      /* ignore */
    }
    const proxyHint =
      res.status >= 502
        ? " 常见原因：Vite 无法连接代理目标（后端未启动或地址错误）。请先在本项目执行 npm run server（默认 127.0.0.1:11219），或在 .env.local 设置 VITE_DEV_PROXY_TARGET=http://127.0.0.1:11219。"
        : res.status === 500
          ? " 若请求走开发代理 /api，也可能是上游未启动或 localhost/IPv6 连不上，请确认已运行 npm run server，并优先使用 127.0.0.1:11219 作为代理目标。"
          : ""
    const extra = bodySnippet ? ` ${bodySnippet}` : ""
    throw new Error(`拉题失败：HTTP ${res.status}${extra}${proxyHint}`)
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

/** 是否已配置同步 POST 地址 */
export function isJztkSyncConfigured() {
  return Boolean(SYNC_URL && SYNC_URL.trim())
}
