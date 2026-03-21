/**
 * 驾考刷题本地存储（按科目隔离）
 * @typedef {{ id: string|number, question: string, answer: string, item1: string, item2: string, item3: string, item4: string, explains: string, url: string|null }} JztkQuestionSnapshot
 */

const VERSION = 1
const PREFIX = "jztk_ls_v1"

/** @param {string} subject */
export function jztkStorageKey(subject) {
  return `${PREFIX}_${subject}`
}

function defaultState() {
  return {
    v: VERSION,
    stats: { correct: 0, wrong: 0 },
    /** @type {JztkQuestionSnapshot[]} */
    favorites: [],
    /** @type {JztkQuestionSnapshot[]} */
    wrongBook: [],
  }
}

/**
 * @param {unknown} q
 * @returns {string}
 */
export function jztkQuestionKey(q) {
  if (!q || typeof q !== "object") return ""
  const id = String(/** @type {Record<string, unknown>} */ (q).id ?? "").trim()
  if (id) return id
  const text = String(/** @type {Record<string, unknown>} */ (q).question ?? "")
  let h = 0
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h + text.charCodeAt(i)) | 0
  }
  return `h:${h}`
}

/**
 * @param {Record<string, unknown>} q
 * @returns {JztkQuestionSnapshot}
 */
export function jztkCloneQuestion(q) {
  return {
    id: q.id ?? "",
    question: String(q.question ?? ""),
    answer: String(q.answer ?? "").trim(),
    item1: String(q.item1 ?? ""),
    item2: String(q.item2 ?? ""),
    item3: String(q.item3 ?? ""),
    item4: String(q.item4 ?? ""),
    explains: String(q.explains ?? ""),
    url:
      q.url != null && String(q.url).trim() !== ""
        ? String(q.url)
        : null,
  }
}

/**
 * @param {string} subject
 */
export function loadJztkSubjectState(subject) {
  try {
    const raw = localStorage.getItem(jztkStorageKey(subject))
    if (!raw) return defaultState()
    const o = JSON.parse(raw)
    if (!o || typeof o !== "object") return defaultState()
    const stats = o.stats && typeof o.stats === "object" ? o.stats : {}
    return {
      v: typeof o.v === "number" ? o.v : VERSION,
      stats: {
        correct: Math.max(0, Number(stats.correct) || 0),
        wrong: Math.max(0, Number(stats.wrong) || 0),
      },
      favorites: Array.isArray(o.favorites) ? o.favorites : [],
      wrongBook: Array.isArray(o.wrongBook) ? o.wrongBook : [],
    }
  } catch {
    return defaultState()
  }
}

/**
 * @param {string} subject
 * @param {ReturnType<typeof defaultState>} state
 */
export function saveJztkSubjectState(subject, state) {
  try {
    localStorage.setItem(jztkStorageKey(subject), JSON.stringify(state))
  } catch {
    /* quota / private mode */
  }
}

/**
 * 答错入错题本（同题只保留一条，新的在前）
 * @param {JztkQuestionSnapshot[]} book
 * @param {Record<string, unknown>} q
 */
export function jztkUpsertWrongBook(book, q) {
  const snap = jztkCloneQuestion(q)
  const k = jztkQuestionKey(snap)
  const rest = book.filter((x) => jztkQuestionKey(x) !== k)
  return [snap, ...rest]
}

/**
 * @param {JztkQuestionSnapshot[]} book
 * @param {string} key
 */
export function jztkRemoveFromWrongBookByKey(book, key) {
  return book.filter((x) => jztkQuestionKey(x) !== key)
}

/**
 * @param {JztkQuestionSnapshot[]} favs
 * @param {Record<string, unknown>} q
 * @returns {{ next: JztkQuestionSnapshot[], added: boolean }}
 */
export function jztkToggleFavorite(favs, q) {
  const snap = jztkCloneQuestion(q)
  const k = jztkQuestionKey(snap)
  const idx = favs.findIndex((x) => jztkQuestionKey(x) === k)
  if (idx >= 0) {
    const next = favs.filter((x) => jztkQuestionKey(x) !== k)
    return { next, added: false }
  }
  return { next: [snap, ...favs.filter((x) => jztkQuestionKey(x) !== k)], added: true }
}

/**
 * @param {JztkQuestionSnapshot[]} list
 * @param {string} key
 */
export function jztkIsFavorite(list, key) {
  return list.some((x) => jztkQuestionKey(x) === key)
}

/**
 * Fisher–Yates 洗牌（拷贝）
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function jztkShuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
