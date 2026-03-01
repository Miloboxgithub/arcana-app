import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  date: string // 'YYYY-MM-DD'
  completedAt: number
}

interface HabitStore {
  habits: Habit[]
  checkRecords: CheckRecord[]
  // Today's completed habit ids
  todayCompleted: string[]

  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'createdAt'>) => string
  removeHabit: (id: string) => void
  toggleToday: (habitId: string) => boolean // returns whether it was checked (true) or unchecked (false)
  getTodayCompleted: () => string[]
  getHabitsBySlot: (slot: TimeSlot) => Habit[]
  getStreak: () => number
  getTodayDate: () => string
  initDay: () => void // reset todayCompleted if it's a new day
  // Cloud sync setters
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
      habits: [
        { id: 'h1', name: '刷 LeetCode 2题', dimension: 'pro', timeSlot: 'afternoon', exp: 30, isAnchor: true, streak: 21, createdAt: Date.now() },
        { id: 'h2', name: '读技术文章 30min', dimension: 'pro', timeSlot: 'afternoon', exp: 20, isAnchor: false, streak: 5, createdAt: Date.now() },
        { id: 'h3', name: '跑步 5km', dimension: 'fitness', timeSlot: 'afternoon', exp: 25, isAnchor: false, streak: 7, createdAt: Date.now() },
        { id: 'h4', name: '晨跑 3km', dimension: 'fitness', timeSlot: 'morning', exp: 20, isAnchor: false, streak: 14, createdAt: Date.now() },
        { id: 'h5', name: '背单词 30个', dimension: 'pro', timeSlot: 'morning', exp: 15, isAnchor: false, streak: 7, createdAt: Date.now() },
        { id: 'h6', name: '复盘今日笔记', dimension: 'pro', timeSlot: 'evening', exp: 15, isAnchor: false, streak: 3, createdAt: Date.now() },
        { id: 'h7', name: '冥想 10min', dimension: 'self', timeSlot: 'evening', exp: 10, isAnchor: false, streak: 12, createdAt: Date.now() },
        { id: 'h8', name: '阅读 30min', dimension: 'create', timeSlot: 'evening', exp: 20, isAnchor: false, streak: 9, createdAt: Date.now() },
      ],
      checkRecords: [],
      todayCompleted: [],

      getTodayDate: () => todayStr(),

      initDay: () => {
        // Called on app start — if stored date differs from today, reset todayCompleted
        // (persist middleware stores todayCompleted; we need to check the date it was set)
        // Simple: todayCompleted is always for today; the persist key stores today's date too
      },

      getTodayCompleted: () => get().todayCompleted,

      addHabit: (habit) => {
        const id = Math.random().toString(36).slice(2, 9)
        set(s => ({
          habits: [...s.habits, { ...habit, id, streak: 0, createdAt: Date.now() }]
        }))
        return id
      },

      removeHabit: (id) => set(s => ({
        habits: s.habits.filter(h => h.id !== id),
        todayCompleted: s.todayCompleted.filter(hid => hid !== id),
      })),

      toggleToday: (habitId) => {
        const { todayCompleted } = get()
        const isDone = todayCompleted.includes(habitId)
        if (isDone) {
          set({ todayCompleted: todayCompleted.filter(id => id !== habitId) })
          return false
        } else {
          set({ todayCompleted: [...todayCompleted, habitId] })
          // Update streak
          set(s => ({
            habits: s.habits.map(h =>
              h.id === habitId ? { ...h, streak: h.streak + 1 } : h
            )
          }))
          // Record check
          set(s => ({
            checkRecords: [...s.checkRecords, {
              habitId,
              date: todayStr(),
              completedAt: Date.now(),
            }]
          }))
          return true
        }
      },

      getHabitsBySlot: (slot) => get().habits.filter(h => h.timeSlot === slot),

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
        const records: CheckRecord[] = []
        const today = todayStr()
        const completed: string[] = []
        for (const [habitId, dates] of Object.entries(map)) {
          for (const date of dates) {
            records.push({ habitId, date, completedAt: Date.now() })
          }
          if (dates.includes(today)) completed.push(habitId)
        }
        set({ checkRecords: records, todayCompleted: completed })
      },

      getStreak: () => {
        // Count consecutive days with at least 1 check
        const { checkRecords } = get()
        if (checkRecords.length === 0) return 0
        const dates = [...new Set(checkRecords.map(r => r.date))].sort().reverse()
        let streak = 0
        let current = new Date()
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
    }),
    {
      name: 'arcana-habits',
      // Reset todayCompleted if day changed
      onRehydrateStorage: () => (state) => {
        if (state) {
          const today = todayStr()
          const lastDate = state.checkRecords
            .filter(r => state.todayCompleted.includes(r.habitId))
            .map(r => r.date)
            .sort()
            .pop()
          if (lastDate && lastDate !== today) {
            state.todayCompleted = []
          }
        }
      }
    }
  )
)

export default useHabitStore
