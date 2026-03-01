/**
 * Rule-based classifier: maps user input text → dimension + EXP
 * Zero API calls, runs entirely in browser.
 */

import type { DimensionId } from '@/stores/useHabitStore'

interface ClassifyResult {
  dimension: DimensionId
  exp: number
  label: string  // display label for toast
}

// Keyword rules — ordered by priority (first match wins)
const RULES: Array<{ keywords: string[]; dimension: DimensionId; baseExp: number; label: string }> = [
  // 专业力 — coding, study, tech
  {
    keywords: ['leetcode','力扣','算法','代码','编程','coding','debug','调试','刷题','开发','写代码','技术','架构','设计','学习','看书','读书','看文章','读文章','文档','笔记','复盘','背单词','单词','英语','考研','数学','物理','化学','政治','专业'],
    dimension: 'pro', baseExp: 20, label: '专业力',
  },
  // 体能 — exercise
  {
    keywords: ['跑步','跑','健身','运动','锻炼','骑车','游泳','篮球','足球','羽毛球','乒乓','哑铃','俯卧撑','仰卧起坐','拉伸','yoga','瑜伽','散步','走路','爬山','km','公里','步','卡路里','减肥'],
    dimension: 'fitness', baseExp: 20, label: '体能',
  },
  // 社交 — social interactions
  {
    keywords: ['朋友','聚会','聊天','聚餐','约会','见面','家人','同学','社交','party','派对','认识','交流','分享','沟通','打电话','视频'],
    dimension: 'social', baseExp: 15, label: '社交',
  },
  // 创造力 — creative work
  {
    keywords: ['写作','画画','设计','创作','音乐','弹琴','唱歌','摄影','视频','剪辑','拍照','写文章','博客','创意','想法','灵感','手工','绘画','素描'],
    dimension: 'create', baseExp: 20, label: '创造力',
  },
  // 自律 — discipline, habits, routine
  {
    keywords: ['冥想','早起','早睡','睡觉','休息','计划','todo','打卡','坚持','完成','习惯','作息','规律','自律','记录','日记','复盘','反思','总结','整理'],
    dimension: 'self', baseExp: 15, label: '自律',
  },
  // 魅力 — personal development, appearance
  {
    keywords: ['穿搭','打扮','护肤','发型','形象','气质','演讲','表达','沟通技巧','魅力','自信','礼仪','礼节'],
    dimension: 'charm', baseExp: 15, label: '魅力',
  },
]

// EXP modifiers based on intensity words
const INTENSITY_KEYWORDS: Array<{ words: string[]; multiplier: number }> = [
  { words: ['30min','30分钟','半小时'], multiplier: 1.0 },
  { words: ['1小时','60min','一小时'], multiplier: 1.3 },
  { words: ['2小时','两小时'], multiplier: 1.5 },
  { words: ['5km','5公里'], multiplier: 1.2 },
  { words: ['10km','10公里','半马'], multiplier: 1.6 },
  { words: ['全马','马拉松'], multiplier: 2.0 },
  { words: ['点了一下','简单看了','随便'], multiplier: 0.6 },
]

export function classifyInput(text: string): ClassifyResult {
  const lower = text.toLowerCase()

  // Find matching rule
  let matched = RULES[RULES.length - 1] // default: 自律
  for (const rule of RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      matched = rule
      break
    }
  }

  // Apply intensity multiplier
  let multiplier = 1.0
  for (const { words, multiplier: m } of INTENSITY_KEYWORDS) {
    if (words.some(w => lower.includes(w))) {
      multiplier = m
      break
    }
  }

  // Base EXP + small random variance (±5)
  const base = matched.baseExp
  const variance = Math.floor(Math.random() * 11) - 5
  const exp = Math.max(5, Math.round((base + variance) * multiplier))

  return {
    dimension: matched.dimension,
    exp,
    label: matched.label,
  }
}
