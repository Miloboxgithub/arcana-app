import { create } from 'zustand'
import { api } from '../lib/api'

export interface Achievement {
  id: string
  category: string
  name: string
  description: string
  icon: string
  target: number
  progress: number
  progressPct: number
  done: boolean
  unlockedAt: string | null
  expReward: number
  rarity: string
  isHidden: boolean
}

interface AchievementStore {
  achievements: Achievement[]
  loading: boolean
  error: string | null
  fetchAchievements: () => Promise<void>
  lastUnlocked: string[] // IDs of newly unlocked achievements
}

export const useAchievementStore = create<AchievementStore>((set) => ({
  achievements: [],
  loading: false,
  error: null,
  lastUnlocked: [],

  fetchAchievements: async () => {
    set({ loading: true, error: null })
    try {
      const { achievements } = await api.achievements.list()
      set({ achievements, loading: false })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },
}))
