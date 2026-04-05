/**
 * 注册邮箱验证码 API（Vercel / 同源代理到 Node 的 /api/auth/email-register-code）
 */

const DEFAULT_PATH = '/api/auth/email-register-code'

/**
 * 验证码接口 URL。
 * 未设置 VITE_AUTH_EMAIL_API 时用相对路径 DEFAULT_PATH（开发中由 Vite 代理到后端）。
 * 设置了则为完整地址（例如独立域名上的同一接口），并去掉末尾 /。
 */
function endpoint() {
  const base = (import.meta.env.VITE_AUTH_EMAIL_API || '').replace(/\/$/, '')
  return base || DEFAULT_PATH
}

/**
 * POST JSON，成功返回解析后的 body；失败则抛出带可读文案的 Error。
 * 错误文案兼容：自建 JSON（message）、FastAPI（detail 字符串或对象）、通用 error 字段。
 */
async function postJson(body) {
  const res = await fetch(endpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  // 非 JSON 或空 body 时用 {}，避免后续读字段报错
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg =
      data.message ||
      data.error ||
      (typeof data.detail === 'string' ? data.detail : '') ||
      (data.detail && typeof data.detail === 'object' && data.detail.message) ||
      `请求失败 (${res.status})`
    throw new Error(msg)
  }
  return data
}

/**
 * 请求服务端生成并向该邮箱发送注册验证码（受服务端频率限制）。
 * 成功时一般返回 `{ ok: true }`；本地调试若开启 SMTP_SKIP_SEND 可能带 `devCode`。
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
