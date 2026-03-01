import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DimensionId } from './useHabitStore'

export interface Dimension {
  id: DimensionId
  name: string
  level: number
  exp: number
  maxExp: number
  color: string
  rankTitle: string
  nextRank: string
  iconType: string
}

interface ProfileStore {
  name: string
  title: string
  totalExp: number
  dimensions: Dimension[]
  addExp: (dimensionId: DimensionId, amount: number) => void
  removeExp: (dimensionId: DimensionId, amount: number) => void
  getTotalLevel: () => number
}

const defaultDimensions: Dimension[] = [
  { id: 'pro',     name: '专业力', level: 4, exp: 720,  maxExp: 1000, color: '#C3002F', rankTitle: 'SCHOLAR',   nextRank: 'VIRTUOSO',   iconType: 'bar' },
  { id: 'fitness', name: '体能',   level: 3, exp: 450,  maxExp: 1000, color: '#E8C840', rankTitle: 'ATHLETE',   nextRank: 'CHAMPION',   iconType: 'dumbbell' },
  { id: 'social',  name: '社交',   level: 2, exp: 280,  maxExp: 1000, color: '#4FC3F7', rankTitle: 'CHARMER',   nextRank: 'DIPLOMAT',   iconType: 'users' },
  { id: 'create',  name: '创造力', level: 3, exp: 600,  maxExp: 1000, color: '#A5D6A7', rankTitle: 'ARTISAN',   nextRank: 'VISIONARY',  iconType: 'star' },
  { id: 'self',    name: '自律',   level: 3, exp: 550,  maxExp: 1000, color: '#CE93D8', rankTitle: 'RESOLVED',  nextRank: 'STOIC',      iconType: 'grid' },
  { id: 'charm',   name: '魅力',   level: 2, exp: 320,  maxExp: 1000, color: '#FF8A65', rankTitle: 'ALLURING',  nextRank: 'CHARISMATIC',iconType: 'flame' },
]

const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      name: 'MILO',
      title: '怪盗团见习成员',
      totalExp: 2400,
      dimensions: defaultDimensions,

      addExp: (dimensionId, amount) => set(s => {
        const dims = s.dimensions.map(d => {
          if (d.id !== dimensionId) return d
          let newExp = d.exp + amount
          let newLevel = d.level
          let newMax = d.maxExp
          while (newExp >= newMax) {
            newExp -= newMax
            newLevel++
            newMax = Math.floor(newMax * 1.3)
          }
          return { ...d, exp: newExp, level: newLevel, maxExp: newMax }
        })
        return { dimensions: dims, totalExp: s.totalExp + amount }
      }),

      removeExp: (dimensionId, amount) => set(s => ({
        dimensions: s.dimensions.map(d =>
          d.id !== dimensionId ? d : { ...d, exp: Math.max(0, d.exp - amount) }
        ),
        totalExp: Math.max(0, s.totalExp - amount),
      })),

      getTotalLevel: () => {
        return Math.floor(get().dimensions.reduce((sum, d) => sum + d.level, 0) / get().dimensions.length)
      },
    }),
    { name: 'arcana-profile' }
  )
)

export default useProfileStore
