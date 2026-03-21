/**
 * 英语词汇量测试题库
 * level 1–6：大致对应常用度 / 难度（非严格 CEFR），用于估算被动阅读词汇量
 */
const RAW = `
apple|苹果|1
water|水|1
book|书|1
house|房子|1
school|学校|1
friend|朋友|1
happy|快乐的|1
time|时间|1
love|爱|1
family|家庭|1
city|城市|1
food|食物|1
money|钱|1
work|工作|1
study|学习|1
beautiful|美丽的|1
important|重要的|1
different|不同的|1
understand|理解|2
remember|记住|2
believe|相信|2
decide|决定|2
develop|发展|2
government|政府|2
society|社会|2
culture|文化|2
education|教育|2
environment|环境|2
technology|技术|2
experience|经验|2
knowledge|知识|2
opportunity|机会|2
challenge|挑战|2
influence|影响|2
situation|情况|2
community|社区|2
economic|经济的|2
political|政治的|2
achieve|达到|2
consider|考虑|2
require|需要|2
available|可获得的|2
significant|重要的|3
establish|建立|3
maintain|维持|3
participate|参与|3
consequence|后果|3
approach|方法；接近|3
capacity|能力；容量|3
circumstance|环境；情况|3
commitment|承诺|3
comprehensive|全面的|3
contribute|贡献|3
demonstrate|证明；展示|3
distribute|分配|3
emphasize|强调|3
evaluate|评估|3
evidence|证据|3
flexible|灵活的|3
framework|框架|3
hypothesis|假设|3
implement|实施|3
indicate|表明|3
interpret|解释|3
justify|证明…正当|3
mechanism|机制|4
phenomenon|现象|4
paradigm|范式|4
ambiguous|模棱两可的|4
coherent|连贯的|4
substantial|大量的；实质的|4
underlying|潜在的|4
arbitrary|任意的|4
inevitable|不可避免的|4
preliminary|初步的|4
simultaneous|同时的|4
compensate|补偿|4
elaborate|详细阐述|4
facilitate|促进|4
inherent|固有的|4
integrate|整合|4
mediate|调解|4
moderate|适度的|4
precise|精确的|4
reluctant|不情愿的|4
resilient|有韧性的|4
scrutinize|仔细审查|5
ubiquitous|无处不在的|5
ephemeral|短暂的|5
pragmatic|务实的|5
ambiguously|含糊地|5
conjecture|推测|5
dichotomy|二分法|5
discrepancy|差异|5
exacerbate|加剧|5
heterogeneous|异质的|5
immutable|不可改变的|5
juxtapose|并置|5
mitigate|减轻|5
nefarious|邪恶的|5
obfuscate|混淆|5
paradox|悖论|5
perfunctory|敷衍的|5
recalcitrant|顽抗的|5
sanction|制裁；批准|5
tacit|心照不宣的|5
venerate|崇敬|5
warrant|保证；授权|5
aberration|反常|6
cacophony|刺耳杂音|6
deleterious|有害的|6
egregious|惊人的（坏）|6
fastidious|挑剔的|6
gregarious|合群的|6
histrionic|做作的|6
iconoclast|反传统者|6
jettison|抛弃|6
kowtow|卑躬屈膝|6
laconic|简洁的|6
maudlin|伤感的|6
nadir|最低点|6
obsequious|谄媚的|6
panacea|万灵药|6
quixotic|不切实际的|6
recidivism|再犯|6
sycophant|马屁精|6
turgid|浮夸的|6
verisimilitude|逼真|6
vicissitude|变迁|6
zeitgeist|时代精神|6
alacrity|乐意；敏捷|6
bucolic|田园的|6
capricious|反复无常的|6
`

function parseRaw() {
  const lines = RAW.trim().split(/\n/).map((l) => l.trim()).filter(Boolean)
  const pool = []
  const seen = new Set()
  for (const line of lines) {
    const parts = line.split('|')
    if (parts.length < 3) continue
    const en = parts[0].trim().toLowerCase()
    const zh = parts[1].trim()
    const level = Math.min(6, Math.max(1, parseInt(parts[2], 10) || 1))
    if (!en || !zh || seen.has(en)) continue
    seen.add(en)
    pool.push({ en, zh, level })
  }
  return pool
}

export const VOCAB_POOL = parseRaw()

/**
 * 从题库随机抽取 n 道题（不重复）
 */
export function pickQuestions(n) {
  const pool = [...VOCAB_POOL]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(n, pool.length))
}

/**
 * 为一道题生成 4 个中文选项（1 正 3 误）
 */
export function buildOptions(correct, allPool) {
  const wrongPool = allPool.filter((w) => w.zh !== correct.zh)
  const wrong = []
  const used = new Set([correct.zh])
  const shuffled = [...wrongPool].sort(() => Math.random() - 0.5)
  for (const w of shuffled) {
    if (wrong.length >= 3) break
    if (!used.has(w.zh)) {
      used.add(w.zh)
      wrong.push(w.zh)
    }
  }
  while (wrong.length < 3) {
    wrong.push(`（干扰项${wrong.length}）`)
  }
  const opts = [correct.zh, ...wrong.slice(0, 3)]
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[opts[i], opts[j]] = [opts[j], opts[i]]
  }
  return opts
}

const LEVEL_MID = {
  1: 1200,
  2: 2800,
  3: 4800,
  4: 7000,
  5: 9800,
  6: 13200,
}

/**
 * 根据答题结果估算被动阅读词汇量（粗估，仅供娱乐与学习参考）
 * @param {{ level: number, correct: boolean }[]} results
 */
export function estimateVocabulary(results) {
  if (!results.length) return 800
  let score = 0
  for (const r of results) {
    const mid = LEVEL_MID[r.level] ?? 4000
    if (r.correct) score += mid
    else score -= mid * 0.22
  }
  let est = score / results.length
  const acc = results.filter((r) => r.correct).length / results.length
  est *= 0.85 + acc * 0.35
  return Math.round(Math.max(400, Math.min(16500, est)))
}

export function accuracyPercent(correct, total) {
  if (!total) return 0
  return Math.round((correct / total) * 100)
}

/**
 * 根据估算词汇量给出通俗阶段与考试分数粗估（非官方换算，仅供学习参考）
 * @param {number} v - estimateVocabulary 返回值
 */
export function getVocabLevelDescriptors(v) {
  const n = Number(v) || 0
  /** @type {{ school: string, cet4: string, cet6: string, ielts: string, toefl: string }} */
  let out = {
    school: '小学',
    cet4: '低于 CET-4 常见词汇量要求（约 4500 词）',
    cet6: '低于 CET-6 常见词汇量要求（约 6000 词）',
    ielts: '约 4.0–4.5',
    toefl: '约 40–55',
  }
  if (n >= 1200 && n < 2500) {
    out = {
      school: '初中',
      cet4: '低于 CET-4 常见要求',
      cet6: '低于 CET-6 常见要求',
      ielts: '约 4.5–5.0',
      toefl: '约 55–70',
    }
  } else if (n >= 2500 && n < 4500) {
    out = {
      school: '高中',
      cet4: '接近 CET-4 水平（词汇侧粗估）',
      cet6: '通常未达 CET-6 门槛',
      ielts: '约 5.0–5.5',
      toefl: '约 65–80',
    }
  } else if (n >= 4500 && n < 6500) {
    out = {
      school: '大学（基础）',
      cet4: '约达到或略超 CET-4 常见要求',
      cet6: '接近 CET-6 水平',
      ielts: '约 5.5–6.0',
      toefl: '约 75–90',
    }
  } else if (n >= 6500 && n < 9000) {
    out = {
      school: '大学（中等）',
      cet4: '超过 CET-4 常见要求',
      cet6: '约达到 CET-6 常见要求',
      ielts: '约 6.0–6.5',
      toefl: '约 85–100',
    }
  } else if (n >= 9000 && n < 12000) {
    out = {
      school: '大学（较高）',
      cet4: '明显高于 CET-4 要求',
      cet6: '超过 CET-6 常见门槛',
      ielts: '约 6.5–7.5',
      toefl: '约 95–105',
    }
  } else if (n >= 12000) {
    out = {
      school: '大学（高阶）及以上',
      cet4: '显著高于 CET-4 要求',
      cet6: '显著高于 CET-6 常见门槛',
      ielts: '约 7.0–8.5（词汇侧粗估）',
      toefl: '约 100–115+（词汇侧粗估）',
    }
  }
  return out
}

/** 答题选项：表示「不知道」的固定文案（勿与题库释义重复） */
export const OPTION_DONT_KNOW = '不知道'
