import { create } from 'zustand'

interface Habit {
  id: string
  name: string
  dimension: string
  timeSlot: 'morning' | 'afternoon' | 'evening'
  completedToday: boolean
  streak: number
}

interface HabitStore {
  habits: Habit[]
  addHabit: (habit: Omit<Habit, 'id' | 'completedToday' | 'streak'>) => void
  toggleHabit: (id: string) => void
}

const useHabitStore = create<HabitStore>((set) => ({
  habits: [],
  addHabit: (habit) =>
    set((state) => ({
      habits: [
        ...state.habits,
        {
          ...habit,
          id: Math.random().toString(36).slice(2),
          completedToday: false,
          streak: 0,
        },
      ],
    })),
  toggleHabit: (id) =>
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id ? { ...h, completedToday: !h.completedToday } : h
      ),
    })),
}))

export default useHabitStore
