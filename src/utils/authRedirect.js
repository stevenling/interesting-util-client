/**
 * 登录成功后的 redirect 查询参数解析（防开放重定向：外链仅允许 2048 子域）。
 */

/** @typedef {{ kind: 'default' }} DefaultRedirect */
/** @typedef {{ kind: 'internal', path: string }} InternalRedirect */
/** @typedef {{ kind: 'external', url: string }} ExternalRedirect */
/** @typedef {DefaultRedirect|InternalRedirect|ExternalRedirect} PostLoginRedirect */

const ALLOWED_EXTERNAL_HOST = "2048.yunhujiang.top"

/**
 * @param {unknown} redirectQuery
 * @returns {PostLoginRedirect}
 */
export function normalizePostLoginRedirect(redirectQuery) {
  if (typeof redirectQuery !== "string" || !redirectQuery.trim()) {
    return { kind: "default" }
  }
  const t = redirectQuery.trim()
  if (t.startsWith("/")) {
    if (t.startsWith("/login") || t.startsWith("/register")) {
      return { kind: "default" }
    }
    return { kind: "internal", path: t }
  }
  try {
    const u = new URL(t)
    if (
      (u.protocol === "http:" || u.protocol === "https:") &&
      u.hostname.toLowerCase() === ALLOWED_EXTERNAL_HOST
    ) {
      return { kind: "external", url: u.href }
    }
  } catch {
    /* ignore */
  }
  return { kind: "default" }
}

/**
 * @param {unknown} redirectQuery
 * @param {import('vue-router').Router} router
 * @returns {Promise<void|import('vue-router').RouteLocationNormalizedLoaded>}
 */
export function applyPostLoginRedirect(redirectQuery, router) {
  const r = normalizePostLoginRedirect(redirectQuery)
  if (r.kind === "external") {
    window.location.replace(r.url)
    return Promise.resolve()
  }
  const path = r.kind === "internal" ? r.path : "/utilIndex"
  return router.replace(path)
}
