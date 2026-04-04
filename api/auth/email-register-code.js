/* eslint-env node */
/**
 * 注册邮箱验证码：发信 + 校验（单文件以便同一 Serverless 实例内共享内存中的验证码）
 * POST JSON: { action: 'send', email } | { action: 'verify', email, code }
 *
 * 环境变量（SMTP）：
 * - SMTP_HOST、SMTP_PORT（默认 587）、SMTP_USER、SMTP_PASS、SMTP_FROM
 * - SMTP_SECURE：'1' 或 'true' 时使用 TLS（如 465）
 * - SMTP_REGISTER_SUBJECT：邮件主题（可选）
 *
 * 本地调试不发信：SMTP_SKIP_SEND=1 时跳过 SMTP，并在响应体中带 devCode（勿用于生产）
 *
 * 注意：多实例 Serverless 下内存不共享，验证码可能偶发校验失败；高并发请接 Redis 等外部存储。
 */

const TTL_MS = 10 * 60 * 1000
const RESEND_MS = 60 * 1000

function getStore() {
  if (!globalThis.__nyxRegCodeStore) globalThis.__nyxRegCodeStore = new Map()
  if (!globalThis.__nyxRegLastSend) globalThis.__nyxRegLastSend = new Map()
  return { codes: globalThis.__nyxRegCodeStore, lastSend: globalThis.__nyxRegLastSend }
}

function normalizeEmail(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method not allowed' })
    return
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}')
    } catch {
      body = {}
    }
  }
  if (!body || typeof body !== 'object') body = {}

  const action = body.action
  const email = normalizeEmail(body.email)
  const { codes, lastSend } = getStore()

  if (action === 'send') {
    if (!isValidEmail(email)) {
      res.status(400).json({ ok: false, message: '邮箱格式不正确' })
      return
    }
    const now = Date.now()
    const last = lastSend.get(email) || 0
    if (now - last < RESEND_MS) {
      res.status(429).json({ ok: false, message: '发送过于频繁，请稍后再试' })
      return
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    codes.set(email, { code, exp: now + TTL_MS })
    lastSend.set(email, now)

    const skipSend =
      process.env.SMTP_SKIP_SEND === '1' || process.env.SMTP_SKIP_SEND === 'true'
    if (skipSend) {
      res.status(200).json({ ok: true, devCode: code })
      return
    }

    const smtpReady =
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM
    if (!smtpReady) {
      codes.delete(email)
      res.status(503).json({
        ok: false,
        message: '邮件服务未配置，请在服务端设置 SMTP_* 环境变量',
      })
      return
    }

    const { default: nodemailer } = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === '1' || process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: process.env.SMTP_REGISTER_SUBJECT || '注册验证码',
        text: `您的验证码是：${code}，10 分钟内有效。如非本人操作请忽略。`,
      })
    } catch (e) {
      console.error('[email-register-code] sendMail', e)
      codes.delete(email)
      res.status(500).json({ ok: false, message: '邮件发送失败，请稍后重试' })
      return
    }

    res.status(200).json({ ok: true })
    return
  }

  if (action === 'verify') {
    const code = String(body.code || '').trim()
    if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
      res.status(400).json({ ok: false, message: '邮箱或验证码格式不正确' })
      return
    }
    const row = codes.get(email)
    if (!row || Date.now() > row.exp) {
      codes.delete(email)
      res.status(400).json({ ok: false, message: '验证码无效或已过期' })
      return
    }
    if (row.code !== code) {
      res.status(400).json({ ok: false, message: '验证码错误' })
      return
    }
    codes.delete(email)
    res.status(200).json({ ok: true })
    return
  }

  res.status(400).json({ ok: false, message: '未知操作' })
}
