/**
 * morgana.ts — 莫尔加纳 AI 对话模块
 * 通过后端 API 转发请求，避免直接暴露 API Key
 */

import { api } from './api'
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
    ...recentHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ]

  try {
    // 通过后端 API 转发请求
    const res = await api.chat.send(messages, systemPrompt)
    return res.reply
  } catch (e) {
    console.warn('[morgana] API error:', e)
    return fallback()
  }
}

// 智能分析输入，判断是否应该添加经验值
// 返回：是否添加成功、添加了哪个维度、经验值数量
export interface AnalyzeResult {
  shouldAddExp: boolean
  dimension: DimensionId | null
  exp: number
  reason: string  // AI 给的原因，用于显示给用户
}

// 智能分析的系统 prompt
const ANALYZE_SYSTEM_PROMPT = `你是 ARCANA 系统的经验值分析器。

你的任务：根据用户的输入，判断是否应该给予经验值奖励。

## 判断标准

**应该给予经验值的情况：**
1. 用户明确提到完成了某个习惯/任务（如：跑步、看书、刷题、冥想等）
2. 用户描述了具体的行动（如：写了 1 小时代码、跑了 5km、看了一章书等）
3. 用户记录了当天的学习/工作/锻炼进展

**不应该给予经验值的情况：**
1. 用户只是在提问/闲聊，没有具体行动（如："今天该干什么？""怎么提高？""有什么建议？"）
2. 用户只是在抱怨/发牢骚，没有行动
3. 用户只是在打招呼/闲聊
4. 内容无意义或无法判断

## 维度映射

将行动归类到以下维度：
- pro（专业力）：学习、 coding、阅读、工作、技术提升
- fitness（体能）：运动、跑步、健身、锻炼
- social（社交）：社交、聚会、聊天、交流
- create（创造力）：创作、写作、绘画、设计
- self（自律）：冥想、早起、计划、复盘、习惯坚持
- charm（魅力）：穿搭、打扮、表达、演讲

## 输出格式

请返回 JSON 格式：
{
  "shouldAddExp": true/false,
  "dimension": "pro/fitness/social/create/self/charm"（如果 shouldAddExp 为 true）,
  "exp": 经验值数量（10-50之间的整数，根据行动的价值估算）,
  "reason": "一句话说明为什么给予/不给予经验值"
}

注意：
- 如果是通用的学习/工作/提升，默认归类到 pro
- 如果是运动/锻炼，归类到 fitness
- 如果是社交活动，归类到 social
- 如果是创意创作，归类到 create
- 如果是习惯坚持/自我管理，归类到 self
- 如果是个人形象/表达，归类到 charm
- 经验值不要太高，一般 15-30 为主`

export async function analyzeAndAddExp(
  userMessage: string,
  ctx: UserContext
): Promise<AnalyzeResult> {
  const userContextInfo = `
用户维度状态：
${ctx.dimensions.map(d => `- ${d.name}: Lv${d.level}, ${d.exp}/${d.maxExp} EXP`).join('\n')}
用户习惯列表：
${ctx.habits.length > 0 ? ctx.habits.map(h => `- ${h.name}（${h.dimension}·${h.timeSlot}·+${h.exp}EXP）`).join('\n') : '暂无习惯'}
今日已打卡：${ctx.todayCompleted.length} 个
`

  const prompt = `${userContextInfo}

用户输入："${userMessage}"

请分析这段输入，判断是否应该给予经验值奖励。`

  try {
    // 调用后端的 analyze API
    const res = await api.chat.analyze(prompt, ANALYZE_SYSTEM_PROMPT)
    return {
      shouldAddExp: res.shouldAddExp,
      dimension: res.dimension as DimensionId | null,
      exp: res.exp,
      reason: res.reason,
    }
  } catch (e) {
    console.warn('[analyze] API error:', e)
    // 出错时保守处理，不添加经验值
    return {
      shouldAddExp: false,
      dimension: null,
      exp: 0,
      reason: '系统繁忙，无法分析',
    }
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
