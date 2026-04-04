/**
 * 前端演示用账号体系（localStorage，无真实服务端）
 * 正式接入后端后应替换为 API + HttpOnly Cookie / JWT
 */

const TOKEN_KEY = 'user-token'
const USER_KEY = 'user-name'
const USERS_KEY = 'nyx-demo-users'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUsername() {
  return localStorage.getItem(USER_KEY) || ''
}

function setSession(username) {
  localStorage.setItem(TOKEN_KEY, `nyx-${Date.now()}`)
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
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function login(username, password) {
  const u = String(username || '').trim()
  const p = String(password || '')
  const users = readUsers()
  const found = users.find((x) => x.username === u && x.password === p)
  if (found) {
    setSession(u)
    return { ok: true }
  }
  if (users.length === 0) {
    return { ok: false, message: '请先在注册页创建账号' }
  }
  return { ok: false, message: '用户名或密码错误' }
}
