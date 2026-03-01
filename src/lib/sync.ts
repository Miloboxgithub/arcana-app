/**
 * sync.ts — Supabase 云端数据同步层
 *
 * 设计原则：
 * - 所有写操作 fire-and-forget（不阻塞 UI）
 * - 读操作（syncFromCloud）在登录后调用一次
 * - 本地 store 永远是 source of truth，云端是持久化备份
 */

import { supabase } from '@/lib/supabase'
import useHabitStore from '@/stores/useHabitStore'
import useProfileStore from '@/stores/useProfileStore'
import useAuthStore from '@/stores/useAuthStore'

// ─── 获取当前登录用户 ID（同步）────────────────────────────
function uid(): string | null {
  return useAuthStore.getState().user?.id ?? null
}

// ─── fire-and-forget 工具 ───────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function quietly(builder: any) {
  Promise.resolve(builder).catch((e: unknown) => console.warn('[sync]', e))
}

// ═══════════════════════════════════════════════════════════
// 登录后：云端 → 本地（初始化同步）
// ═══════════════════════════════════════════════════════════
export async function syncFromCloud(userId: string) {
  try {
    const [habitsRes, recordsRes, dimsRes] = await Promise.all([
      supabase
        .from('habits')
        .select('id, name, slot, exp, dimension, is_anchor, streak, created_at')
        .eq('user_id', userId)
        .eq('active', true),

      supabase
        .from('check_records')
        .select('habit_id, date, completed_at')
        .eq('user_id', userId)
        .gte('date', (() => {
          const d = new Date()
          d.setDate(d.getDate() - 90)
          return d.toISOString().split('T')[0]
        })()),

      supabase
        .from('dimensions')
        .select('dim_id, total_exp')
        .eq('user_id', userId),
    ])

    const habitStore = useHabitStore.getState()
    const profileStore = useProfileStore.getState()

    // ── 习惯 ──
    if (habitsRes.data && habitsRes.data.length > 0) {
      habitStore.setHabitsFromCloud(habitsRes.data.map((h: any) => ({
        id: h.id,
        name: h.name,
        timeSlot: h.slot,
        exp: h.exp,
        dimension: h.dimension,
        isAnchor: h.is_anchor ?? false,
        streak: h.streak ?? 0,
        createdAt: h.created_at ? new Date(h.created_at).getTime() : Date.now(),
      })))
    } else {
      // 云端无数据 → 把本地数据上推
      await pushAllHabitsToCloud(userId)
    }

    // ── 打卡记录 ──
    if (recordsRes.data && recordsRes.data.length > 0) {
      habitStore.setCheckRecordsFromCloud(
        recordsRes.data.map((r: any) => ({
          habitId: r.habit_id,
          date: r.date,
          completedAt: r.completed_at ? new Date(r.completed_at).getTime() : Date.now(),
        }))
      )
    }

    // ── 维度经验 ──
    if (dimsRes.data && dimsRes.data.length > 0) {
      const expMap: Record<string, number> = {}
      for (const d of dimsRes.data) {
        expMap[d.dim_id] = d.total_exp ?? 0
      }
      profileStore.setDimensionExp(expMap)
    } else {
      await pushAllDimsToCloud(userId)
    }

    console.log('[sync] ✓ cloud → local complete')
  } catch (e) {
    console.error('[sync] syncFromCloud failed:', e)
  }
}

// ═══════════════════════════════════════════════════════════
// 本地 → 云端（初始全量上推）
// ═══════════════════════════════════════════════════════════
export async function pushAllHabitsToCloud(userId: string) {
  const habits = useHabitStore.getState().habits
  if (!habits.length) return
  const rows = habits.map(h => ({
    id: h.id,
    user_id: userId,
    name: h.name,
    slot: h.timeSlot,
    exp: h.exp,
    dimension: h.dimension,
    is_anchor: h.isAnchor,
    streak: h.streak,
    active: true,
  }))
  await supabase.from('habits').upsert(rows, { onConflict: 'id' })
}

export async function pushAllDimsToCloud(userId: string) {
  const dims = useProfileStore.getState().dimensions
  const rows = dims.map(d => ({
    user_id: userId,
    dim_id: d.id,
    total_exp: d.exp + d.level * d.maxExp,
  }))
  await supabase.from('dimensions').upsert(rows, { onConflict: 'user_id,dim_id' })
}

// ═══════════════════════════════════════════════════════════
// 增量写入（每次操作时调用）
// ═══════════════════════════════════════════════════════════

/** 添加习惯 */
export function pushAddHabit(habit: {
  id: string; name: string; timeSlot: string; exp: number
  dimension: string; isAnchor: boolean
}) {
  const userId = uid(); if (!userId) return
  quietly(supabase.from('habits').upsert({
    id: habit.id,
    user_id: userId,
    name: habit.name,
    slot: habit.timeSlot,
    exp: habit.exp,
    dimension: habit.dimension,
    is_anchor: habit.isAnchor,
    streak: 0,
    active: true,
  }, { onConflict: 'id' }))
}

/** 删除习惯（软删除） */
export function pushRemoveHabit(habitId: string) {
  const userId = uid(); if (!userId) return
  quietly(supabase.from('habits').update({ active: false }).eq('id', habitId).eq('user_id', userId))
}

/** 打卡 */
export function pushCheckIn(habitId: string, date: string, completedAt: number) {
  const userId = uid(); if (!userId) return
  const id = `${userId.slice(0, 8)}-${habitId}-${date}`
  quietly(supabase.from('check_records').upsert(
    { id, user_id: userId, habit_id: habitId, date, completed_at: new Date(completedAt).toISOString() },
    { onConflict: 'id' }
  ))
}

/** 取消打卡 */
export function pushUncheck(habitId: string, date: string) {
  const userId = uid(); if (!userId) return
  quietly(supabase.from('check_records')
    .delete()
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .eq('date', date))
}

/** 维度经验同步（打卡/取消打卡后调用） */
export function pushDimExp(dimId: string, totalExp: number) {
  const userId = uid(); if (!userId) return
  quietly(supabase.from('dimensions').upsert(
    { user_id: userId, dim_id: dimId, total_exp: totalExp },
    { onConflict: 'user_id,dim_id' }
  ))
}

/** Onboarding 完成后：批量写入初始维度经验 */
export async function pushOnboardingDims(expMap: Record<string, number>) {
  const userId = uid(); if (!userId) return
  const rows = Object.entries(expMap).map(([dim_id, total_exp]) => ({
    user_id: userId,
    dim_id,
    total_exp,
  }))
  await supabase.from('dimensions').upsert(rows, { onConflict: 'user_id,dim_id' })
}
