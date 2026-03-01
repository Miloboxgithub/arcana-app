/**
 * morgana.ts — 莫尔加纳 AI 对话模块
 * 使用 MiniMax LLM，OpenAI 兼容接口
 */

import type { DimensionId } from '@/stores/useHabitStore'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface UserContext {
  username: string
  dimensions: Array<{ id: DimensionId; name: string; level: number; exp: number; maxExp: number }>
  habits: Array<{ name: string; dimension: string; timeSlot: string; exp: number }>
  todayCompleted: string[]
  habitIds: Record<string, string> // habitId → name
  streak: number
  totalExp: number
  weekExp: number
  recentChecks: number  // last 7 days
}

const API_KEY = import.meta.env.VITE_MINIMAX_API_KEY as string

// 莫尔加纳的系统 prompt — P5 风格，有个性
function buildSystemPrompt(ctx: UserContext): string {
  const dimSummary = ctx.dimensions
    .map(d => `${d.name} Lv${d.level}（${d.exp}/${d.maxExp} EXP）`)
    .join('、')

  const habitSummary = ctx.habits.length > 0
    ? ctx.habits.map(h => `"${h.name}"（${h.dimension}·${h.timeSlot}·+${h.exp}EXP）`).join('、')
    : '暂无习惯'

  const todayDone = ctx.todayCompleted.length
  const todayTotal = ctx.habits.length

  return `你是莫尔加纳（Morgana），来自《女神异闻录5》的智慧黑猫，现在是 ARCANA 习惯追踪系统的 AI 顾问。

你的性格：
- 聪明、直接，偶尔傲娇，但真心关心用户的成长
- 用"侦探"称呼用户，偶尔叫全名
- 会根据数据给出具体、有见地的建议，不说废话
- 用P5游戏风格的措辞，但不夸张
- 回复简洁，一般 2-4 句话，最多 6 句

用户信息：
- 名字：${ctx.username}
- 连击天数：${ctx.streak} 天
- 本周打卡：${ctx.recentChecks} 次
- 今日进度：${todayDone}/${todayTotal} 个习惯完成
- 总经验：${ctx.totalExp.toLocaleString()} EXP
- 属性状态：${dimSummary || '全部初始状态'}
- 习惯列表：${habitSummary}

你可以：
1. 分析用户输入，判断属于哪个维度的进步，给予鼓励
2. 根据属性短板给出具体建议
3. 回答用户关于习惯、成长、学习的问题
4. 偶尔"吐槽"用户的薄弱项，但要有建设性

注意：保持 P5 莫尔加纳的语气，不要太正式，不要用 AI 腔调。`
}

export async function askMorgana(
  userMessage: string,
  history: ChatMessage[],
  ctx: UserContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt(ctx)

  // 只保留最近 10 条历史（节省 token）
  const recentHistory = history.slice(-10)

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ]

  try {
    const res = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages,
        temperature: 0.85,
        max_tokens: 300,
        top_p: 0.95,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.warn('[morgana] API error:', res.status, errText)
      return fallback()
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content?.trim()
    return reply || fallback()
  } catch (e) {
    console.warn('[morgana] fetch failed:', e)
    return fallback()
  }
}

// 网络失败时的备用回复
const FALLBACKS = [
  '侦探，信号不太好，但你的数据我都看到了。继续。',
  '……稍微有点卡，但没关系。你刚才说的我记住了，继续行动。',
  '系统有点忙，不过你的打卡记录了在案。别停下来。',
]
let fbIdx = 0
function fallback() {
  return FALLBACKS[fbIdx++ % FALLBACKS.length]
}
