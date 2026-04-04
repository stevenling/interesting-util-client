/**
 * 注册邮箱验证码 API（Vercel / 同源代理到 Node 的 /api/auth/email-register-code）
 */

const DEFAULT_PATH = '/api/auth/email-register-code'

function endpoint() {
  const base = (import.meta.env.VITE_AUTH_EMAIL_API || '').replace(/\/$/, '')
  return base || DEFAULT_PATH
}

async function postJson(body) {
  const res = await fetch(endpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || data.error || `请求失败 (${res.status})`
    throw new Error(msg)
  }
  return data
}

/**
 * @param {string} email
 * @returns {Promise<{ ok: boolean, devCode?: string }>}
 */
export function sendRegisterCode(email) {
  return postJson({ action: 'send', email })
}

/**
 * @param {string} email
 * @param {string} code
 * @returns {Promise<{ ok: boolean }>}
 */
export function verifyRegisterCode(email, code) {
  return postJson({ action: 'verify', email, code })
}
