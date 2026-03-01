import { supabase } from '@/lib/supabase'
import useHabitStore from '@/stores/useHabitStore'
import useProfileStore from '@/stores/useProfileStore'

/** 登录后调用：从云端拉数据，合并到本地 store */
export async function syncFromCloud(userId: string) {
  try {
    // 拉习惯列表
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)

    // 拉打卡记录（最近90天）
    const since = new Date()
    since.setDate(since.getDate() - 90)
    const sinceStr = since.toISOString().split('T')[0]

    const { data: records } = await supabase
      .from('check_records')
      .select('*')
      .eq('user_id', userId)
      .gte('date', sinceStr)

    // 拉维度经验
    const { data: dimensions } = await supabase
      .from('dimensions')
      .select('*')
      .eq('user_id', userId)

    const habitStore = useHabitStore.getState()
    const profileStore = useProfileStore.getState()

    // 如果云端有习惯数据，用云端的
    if (habits && habits.length > 0) {
      habitStore.setHabits(habits.map((h: any) => ({
        id: h.id,
        name: h.name,
        timeSlot: h.slot,
        exp: h.exp,
        dimension: h.dimension,
      })))
    } else {
      // 云端无数据 → 把本地习惯上传
      await pushHabitsToCloud(userId)
    }

    // 同步打卡记录
    if (records && records.length > 0) {
      const checkMap: Record<string, string[]> = {}
      for (const r of records) {
        if (!checkMap[r.habit_id]) checkMap[r.habit_id] = []
        checkMap[r.habit_id].push(r.date)
      }
      habitStore.setCheckRecords(checkMap)
    }

    // 同步维度经验
    if (dimensions && dimensions.length > 0) {
      const dimExp: Record<string, number> = {}
      for (const d of dimensions) {
        dimExp[d.dim_id] = d.exp
      }
      profileStore.setDimensionExp(dimExp)
    } else {
      // 云端无维度数据 → 上传本地的
      await pushDimensionsToCloud(userId)
    }

    console.log('[sync] cloud → local complete')
  } catch (e) {
    console.error('[sync] failed:', e)
  }
}

/** 把本地习惯上传到云端 */
export async function pushHabitsToCloud(userId: string) {
  const habits = useHabitStore.getState().habits
  if (!habits.length) return
  const rows = habits.map(h => ({
    id: h.id,
    user_id: userId,
    name: h.name,
    slot: h.timeSlot,
    exp: h.exp,
    dimension: h.dimension,
    icon: '⚡',
    active: true,
  }))
  await supabase.from('habits').upsert(rows, { onConflict: 'id' })
}

/** 把本地维度经验上传 */
export async function pushDimensionsToCloud(userId: string) {
  const dims = useProfileStore.getState().dimensions
  const rows = Object.entries(dims).map(([dim_id, d]) => ({
    user_id: userId,
    dim_id,
    exp: d.exp,
  }))
  await supabase.from('dimensions').upsert(rows, { onConflict: 'user_id,dim_id' })
}

/** 打卡时调用：写一条记录到云端 */
export async function pushCheckRecord(userId: string, habitId: string, date: string) {
  const id = `${userId}-${habitId}-${date}`
  await supabase.from('check_records').upsert(
    { id, user_id: userId, habit_id: habitId, date },
    { onConflict: 'id' }
  )
}

/** 取消打卡时调用 */
export async function deleteCheckRecord(userId: string, habitId: string, date: string) {
  await supabase
    .from('check_records')
    .delete()
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .eq('date', date)
}

/** 维度经验变化时调用 */
export async function pushDimensionExp(userId: string, dimId: string, exp: number) {
  await supabase.from('dimensions').upsert(
    { user_id: userId, dim_id: dimId, exp },
    { onConflict: 'user_id,dim_id' }
  )
}
