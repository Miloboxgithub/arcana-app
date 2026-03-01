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
        exp: h.exp,
        dimension: h.dimension as import('@/stores/useHabitStore').DimensionId,
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
      profileStore.setDimensionExp(expMap)
    } else {
      await pushAllDimsToCloud()
    }

    console.log('[sync] ✓ cloud → local complete')
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
    await api.habits.upsert({
      id: h.id, name: h.name, slot: h.timeSlot, exp: h.exp,
      dimension: h.dimension, is_anchor: h.isAnchor, streak: h.streak,
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
  dimension: string; isAnchor: boolean; streak: number
}) {
  quietly(api.habits.upsert({
    id: habit.id, name: habit.name, slot: habit.timeSlot, exp: habit.exp,
    dimension: habit.dimension, is_anchor: habit.isAnchor, streak: habit.streak,
  }))
}

export function pushRemoveHabit(habitId: string) {
  quietly(api.habits.remove(habitId))
}

export function pushCheckIn(habitId: string, date: string, completedAt: number) {
  quietly(api.habits.checkIn(habitId, date, new Date(completedAt).toISOString()))
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
