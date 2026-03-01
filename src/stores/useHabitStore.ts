import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pushAddHabit, pushRemoveHabit, pushCheckIn, pushUncheck } from '@/lib/sync'

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night'
export type DimensionId = 'pro' | 'fitness' | 'social' | 'create' | 'self' | 'charm'

export interface Habit {
  id: string
  name: string
  dimension: DimensionId
  timeSlot: TimeSlot
  exp: number
  isAnchor: boolean
  streak: number
  createdAt: number
}

export interface CheckRecord {
  habitId: string
  date: string       // 'YYYY-MM-DD'
  completedAt: number
}

interface HabitStore {
  habits: Habit[]
  checkRecords: CheckRecord[]
  todayCompleted: string[]
  _lastTodayDate: string  // internal: track which date todayCompleted belongs to

  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'createdAt'>) => string
  removeHabit: (id: string) => void
  /** Toggle today's check. Returns true=checked, false=unchecked */
  toggleToday: (habitId: string) => boolean
  getTodayCompleted: () => string[]
  getHabitsBySlot: (slot: TimeSlot) => Habit[]
  getStreak: () => number
  getTodayDate: () => string
  initDay: () => void

  // Cloud sync setters
  setHabitsFromCloud: (habits: Habit[]) => void
  setCheckRecordsFromCloud: (records: CheckRecord[]) => void
  /** Legacy compat — used by old sync code */
  setHabits: (habits: Omit<Habit, 'streak' | 'createdAt' | 'isAnchor'>[]) => void
  setCheckRecords: (map: Record<string, string[]>) => void
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      checkRecords: [],
      todayCompleted: [],
      _lastTodayDate: '',

      getTodayDate: () => todayStr(),

      initDay: () => {
        const today = todayStr()
        if (get()._lastTodayDate !== today) {
          set({ todayCompleted: [], _lastTodayDate: today })
        }
      },

      getTodayCompleted: () => {
        // Lazily reset if stale
        const today = todayStr()
        if (get()._lastTodayDate !== today) {
          set({ todayCompleted: [], _lastTodayDate: today })
          return []
        }
        return get().todayCompleted
      },

      addHabit: (habit) => {
        const id = Math.random().toString(36).slice(2, 9)
        const full: Habit = { ...habit, id, streak: 0, createdAt: Date.now() }
        set(s => ({ habits: [...s.habits, full] }))
        // cloud
        pushAddHabit({ id, name: habit.name, timeSlot: habit.timeSlot, exp: habit.exp, dimension: habit.dimension, isAnchor: habit.isAnchor, streak: 0 })
        return id
      },

      removeHabit: (id) => {
        set(s => ({
          habits: s.habits.filter(h => h.id !== id),
          todayCompleted: s.todayCompleted.filter(hid => hid !== id),
        }))
        pushRemoveHabit(id)
      },

      toggleToday: (habitId) => {
        const { todayCompleted } = get()
        const today = todayStr()
        const isDone = todayCompleted.includes(habitId)

        if (isDone) {
          // Uncheck
          set({
            todayCompleted: todayCompleted.filter(id => id !== habitId),
            _lastTodayDate: today,
          })
          // Remove check record for today
          set(s => ({
            checkRecords: s.checkRecords.filter(r => !(r.habitId === habitId && r.date === today))
          }))
          // Decrement streak
          set(s => ({
            habits: s.habits.map(h =>
              h.id === habitId ? { ...h, streak: Math.max(0, h.streak - 1) } : h
            )
          }))
          pushUncheck(habitId, today)
          return false
        } else {
          // Check
          const completedAt = Date.now()
          set({
            todayCompleted: [...todayCompleted, habitId],
            _lastTodayDate: today,
          })
          set(s => ({
            checkRecords: [...s.checkRecords, { habitId, date: today, completedAt }],
            habits: s.habits.map(h =>
              h.id === habitId ? { ...h, streak: h.streak + 1 } : h
            )
          }))
          pushCheckIn(habitId, today, completedAt)
          return true
        }
      },

      getHabitsBySlot: (slot) => get().habits.filter(h => h.timeSlot === slot),

      getStreak: () => {
        const { checkRecords } = get()
        if (!checkRecords.length) return 0
        const dates = [...new Set(checkRecords.map(r => r.date))].sort().reverse()
        let streak = 0
        const current = new Date()
        for (const d of dates) {
          const expected = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`
          if (d === expected) {
            streak++
            current.setDate(current.getDate() - 1)
          } else {
            break
          }
        }
        return streak
      },

      // ── Cloud setters ──────────────────────────────────────

      setHabitsFromCloud: (habits) => {
        set({ habits })
      },

      setCheckRecordsFromCloud: (records) => {
        const today = todayStr()
        const completed = records
          .filter(r => r.date === today)
          .map(r => r.habitId)
        set({ checkRecords: records, todayCompleted: completed, _lastTodayDate: today })
      },

      // Legacy compat
      setHabits: (incoming) => {
        set(s => ({
          habits: incoming.map(h => ({
            ...h,
            timeSlot: (h as any).slot ?? (h as any).timeSlot ?? 'morning',
            isAnchor: false,
            streak: s.habits.find(x => x.id === h.id)?.streak ?? 0,
            createdAt: s.habits.find(x => x.id === h.id)?.createdAt ?? Date.now(),
          }))
        }))
      },

      setCheckRecords: (map) => {
        const today = todayStr()
        const records: CheckRecord[] = []
        const completed: string[] = []
        for (const [habitId, dates] of Object.entries(map)) {
          for (const date of dates) {
            records.push({ habitId, date, completedAt: Date.now() })
          }
          if (dates.includes(today)) completed.push(habitId)
        }
        set({ checkRecords: records, todayCompleted: completed, _lastTodayDate: today })
      },
    }),
    {
      name: 'arcana-habits',
      onRehydrateStorage: () => (state) => {
        // Auto-reset todayCompleted if it's a new day
        if (state) {
          const today = todayStr()
          if (state._lastTodayDate && state._lastTodayDate !== today) {
            state.todayCompleted = []
            state._lastTodayDate = today
          }
        }
      },
    }
  )
)

export default useHabitStore
