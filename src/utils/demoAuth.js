/**
 * 认证：默认走 FastAPI + MySQL（注册/登录写库）；无后端时设 VITE_USE_SERVER_AUTH=false 回退 localStorage。
 */

const TOKEN_KEY = 'user-token'
const USER_KEY = 'user-name'
const USERS_KEY = 'nyx-demo-users'

/** 默认 true；仅当显式设为字符串 'false' 时用本地 nyx-demo-users */
export function useServerAuth() {
  return import.meta.env.VITE_USE_SERVER_AUTH !== 'false'
}

const API_BASE = (import.meta.env.VITE_AUTH_API_BASE || '').replace(/\/$/, '')

function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}

function parseApiError(data, status) {
  return (
    data.message ||
    data.error ||
    (typeof data.detail === 'string' ? data.detail : '') ||
    (data.detail && typeof data.detail === 'object' && data.detail.message) ||
    `请求失败 (${status})`
  )
}

async function postAuth(path, body) {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { ok: false, message: parseApiError(data, res.status) }
  }
  return { ok: true, data }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUsername() {
  return localStorage.getItem(USER_KEY) || ''
}

function setSession(username, token) {
  localStorage.setItem(TOKEN_KEY, token || `nyx-${Date.now()}`)
  localStorage.setItem(USER_KEY, username)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function normalizeEmail(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * @param {string} username
 * @param {string} password
 * @param {string} email 已通过服务端验证码校验的邮箱
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function register(username, password, email) {
  const u = String(username || '').trim()
  const p = String(password || '')
  const e = normalizeEmail(email)
  if (u.length < 2) {
    return { ok: false, message: '用户名至少 2 个字符' }
  }
  if (p.length < 6) {
    return { ok: false, message: '密码至少 6 位' }
  }
  if (!isValidEmail(e)) {
    return { ok: false, message: '请填写有效邮箱并完成验证' }
  }
  const users = readUsers()
  if (users.some((x) => x.username === u)) {
    return { ok: false, message: '该用户名已被注册' }
  }
  if (users.some((x) => normalizeEmail(x.email) === e)) {
    return { ok: false, message: '该邮箱已被注册' }
  }
  users.push({ username: u, password: p, email: e })
  writeUsers(users)
  return { ok: true }
}

/**
 * 服务端注册（验证码在接口内校验并消费，无需先调 verify）
 * @returns {Promise<{ ok: true } | { ok: false, message: string }>}
 */
export async function registerWithServer(username, password, email, code) {
  const out = await postAuth('/api/auth/register', {
    username: String(username || '').trim(),
    password: String(password || ''),
    email: String(email || '').trim(),
    code: String(code || '').trim(),
  })
  if (!out.ok) return out
  return { ok: true }
}

/**
 * @returns {Promise<{ ok: true } | { ok: false, message: string }>}
 */
export async function login(username, password) {
  const u = String(username || '').trim()
  const p = String(password || '')
  if (useServerAuth()) {
    const out = await postAuth('/api/auth/login', { username: u, password: p })
    if (!out.ok) return out
    setSession(out.data.username, out.data.access_token)
    return { ok: true }
  }
  const users = readUsers()
  const found = users.find((x) => x.username === u && x.password === p)
  if (found) {
    setSession(u, null)
    return { ok: true }
  }
  if (users.length === 0) {
    return { ok: false, message: '请先在注册页创建账号' }
  }
  return { ok: false, message: '用户名或密码错误' }
}
