/**
 * sync.ts — arcana-server 云端数据同步层
 *
 * 设计原则：
 * - 所有写操作 fire-and-forget（不阻塞 UI）
 * - 读操作（syncFromCloud）在登录后调用一次
 * - 本地 store 永远是 source of truth，云端是持久化备份
 */

import { api } from '@/lib/api'
import useHabitStore from '@/stores/useHabitStore'
import useProfileStore from '@/stores/useProfileStore'
import { useAchievementStore, Achievement } from '@/stores/useAchievementStore'
import { showAchievementUnlock } from '@/components/ui/AchievementUnlock'

// ─── fire-and-forget 工具 ───────────────────────────────
function quietly(p: Promise<unknown>) {
  p.catch((e: unknown) => console.warn('[sync] error:', e))
}

// ═══════════════════════════════════════════════════════════
// 登录后：云端 → 本地（初始化同步）
// ═══════════════════════════════════════════════════════════
export async function syncFromCloud(_userId?: string) {
  try {
    const since = (() => {
      const d = new Date()
      d.setDate(d.getDate() - 90)
      return d.toISOString().split('T')[0]
    })()

    const [habits, records, dims] = await Promise.all([
      api.habits.list(),
      api.habits.records(since),
      api.dimensions.list(),
    ])

    const habitStore = useHabitStore.getState()
    const profileStore = useProfileStore.getState()

    // ── 习惯 ──
    if (habits.length > 0) {
      habitStore.setHabitsFromCloud(habits.map(h => ({
        id: h.id,
        name: h.name,
        timeSlot: h.slot as 'morning' | 'afternoon' | 'evening' | 'night',
        // 优先使用 dimensions 字段（多维度），兼容旧的 dimension 字段
        dimensions: h.dimensions ? h.dimensions.map((d: any) => ({ 
          dimension: d.dimension as import('@/stores/useHabitStore').DimensionId, 
          exp: d.exp 
        })) : [{ dimension: h.dimension as import('@/stores/useHabitStore').DimensionId, exp: h.exp || 10 }],
        isAnchor: h.is_anchor ?? false,
        streak: h.streak ?? 0,
        createdAt: h.created_at ? new Date(h.created_at).getTime() : Date.now(),
      })))
    } else {
      await pushAllHabitsToCloud()
    }

    // ── 打卡记录 ──
    if (records.length > 0) {
      habitStore.setCheckRecordsFromCloud(records.map(r => ({
        habitId: r.habit_id,
        date: r.date,
        completedAt: r.completed_at ? new Date(r.completed_at).getTime() : Date.now(),
      })))
    }

// ── 维度经验 ──
    if (dims.length > 0) {
      const expMap: Record<string, number> = {}
      for (const d of dims) expMap[d.dim_id] = d.total_exp ?? 0
       // console.log 后端获取的维度经验:', expMap)
      
      // 清除旧的 localStorage，强制从后端拉取最新数据
      localStorage.removeItem('arcana-profile')
      
      profileStore.setDimensionExp(expMap)
       // console.log 已调用 setDimensionExp')
    } else {
      await pushAllDimsToCloud()
    }

     // console.log ✓ cloud → local complete')
  } catch (e) {
    console.error('[sync] syncFromCloud failed:', e)
  }
}

// ═══════════════════════════════════════════════════════════
// 本地 → 云端（初始全量上推）
// ═══════════════════════════════════════════════════════════
export async function pushAllHabitsToCloud() {
  const habits = useHabitStore.getState().habits
  if (!habits.length) return
  for (const h of habits) {
    const dims = h.dimensions || [{ dimension: 'pro', exp: 10 }]
    const mainDim = dims[0] || { dimension: 'pro', exp: 10 }
    await api.habits.upsert({
      id: h.id, name: h.name, slot: h.timeSlot, 
      exp: dims.reduce((s, d) => s + d.exp, 0),
      dimension: mainDim.dimension,
      dimensions: dims,
      is_anchor: h.isAnchor, 
      streak: h.streak,
    }).catch(() => {})
  }
}

export async function pushAllDimsToCloud() {
  const dims = useProfileStore.getState().dimensions
  if (!dims.length) return
  const items = dims.map(d => ({ dim_id: d.id, total_exp: d.exp + d.level * d.maxExp }))
  await api.dimensions.upsert(items).catch(() => {})
}

// ═══════════════════════════════════════════════════════════
// 增量写入（每次操作时调用）
// ═══════════════════════════════════════════════════════════

export function pushAddHabit(habit: {
  id: string; name: string; timeSlot: string; exp: number
  dimension: string; dimensions: { dimension: string; exp: number }[]; isAnchor: boolean; streak: number
}) {
  quietly(api.habits.upsert({
    id: habit.id, name: habit.name, slot: habit.timeSlot, exp: habit.exp,
    dimension: habit.dimension, dimensions: habit.dimensions, is_anchor: habit.isAnchor, streak: habit.streak,
  }))
}

export function pushRemoveHabit(habitId: string) {
  quietly(api.habits.remove(habitId))
}

export function pushCheckIn(habitId: string, date: string, completedAt: number) {
  // 异步检查成就，不阻塞打卡
  api.habits.checkIn(habitId, date, new Date(completedAt).toISOString())
    .then(async res => {
      // 成就解锁通知
      if (res.newAchievements && res.newAchievements.length > 0) {
        const achievementStore = useAchievementStore.getState()
        await achievementStore.fetchAchievements() // 刷新成就列表
        
        // 获取新解锁的成就详情，触发弹窗
        const newUnlocked = achievementStore.achievements.filter(a => 
          res.newAchievements!.includes(a.id) && a.done
        )
        
        // 依次显示每个成就解锁弹窗
        for (const achievement of newUnlocked) {
          showAchievementUnlock(achievement)
          // 每个弹窗间隔 1.5 秒
          await new Promise(r => setTimeout(r, 1500))
        }
      }
    })
    .catch((e: unknown) => console.warn('[sync] checkIn error:', e))
}

export function pushUncheck(habitId: string, date: string) {
  quietly(api.habits.uncheck(habitId, date))
}

export function pushDimExp(dimId: string, totalExp: number) {
  quietly(api.dimensions.upsert([{ dim_id: dimId, total_exp: totalExp }]))
}

export async function pushOnboardingDims(expMap: Record<string, number>) {
  const items = Object.entries(expMap).map(([dim_id, total_exp]) => ({ dim_id, total_exp }))
  await api.dimensions.upsert(items)
}
