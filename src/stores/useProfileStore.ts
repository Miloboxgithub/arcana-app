import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DimensionId } from './useHabitStore'
import { pushDimExp } from '@/lib/sync'

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
  setDimensionExp: (map: Record<string, number>) => void
}

const defaultDimensions: Dimension[] = [
  { id: 'pro',     name: '专业力', level: 1, exp: 0,  maxExp: 1000, color: '#C3002F', rankTitle: 'NOVICE',   nextRank: 'SCHOLAR',      iconType: 'bar'      },
  { id: 'fitness', name: '体能',   level: 1, exp: 0,  maxExp: 1000, color: '#E8C840', rankTitle: 'ROOKIE',   nextRank: 'ATHLETE',      iconType: 'dumbbell' },
  { id: 'social',  name: '社交',   level: 1, exp: 0,  maxExp: 1000, color: '#4FC3F7', rankTitle: 'SHY',      nextRank: 'CHARMER',      iconType: 'users'    },
  { id: 'create',  name: '创造力', level: 1, exp: 0,  maxExp: 1000, color: '#A5D6A7', rankTitle: 'DABBLER',  nextRank: 'ARTISAN',      iconType: 'star'     },
  { id: 'self',    name: '自律',   level: 1, exp: 0,  maxExp: 1000, color: '#CE93D8', rankTitle: 'DRIFTER',  nextRank: 'RESOLVED',     iconType: 'grid'     },
  { id: 'charm',   name: '魅力',   level: 1, exp: 0,  maxExp: 1000, color: '#FF8A65', rankTitle: 'PLAIN',    nextRank: 'ALLURING',     iconType: 'flame'    },
]

/** Compute level/exp/maxExp from total accumulated EXP */
function computeLevel(totalExp: number): { level: number; exp: number; maxExp: number } {
  let level = 1, maxExp = 1000, remaining = totalExp
  while (remaining >= maxExp) {
    remaining -= maxExp
    level++
    maxExp = Math.floor(maxExp * 1.3)
  }
  return { level, exp: remaining, maxExp }
}

const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      name: 'PHANTOM',
      title: '怪盗团见习成员',
      totalExp: 0,
      dimensions: defaultDimensions,

      addExp: (dimensionId, amount) => {
        set(s => {
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
        })
        // Cloud sync: compute current total exp for this dim
        const dim = get().dimensions.find(d => d.id === dimensionId)
        if (dim) {
          const totalDimExp = dim.exp + dim.level * dim.maxExp
          pushDimExp(dimensionId, totalDimExp)
        }
      },

      removeExp: (dimensionId, amount) => {
        set(s => ({
          dimensions: s.dimensions.map(d =>
            d.id !== dimensionId ? d : { ...d, exp: Math.max(0, d.exp - amount) }
          ),
          totalExp: Math.max(0, s.totalExp - amount),
        }))
        const dim = get().dimensions.find(d => d.id === dimensionId)
        if (dim) {
          const totalDimExp = dim.exp + dim.level * dim.maxExp
          pushDimExp(dimensionId, totalDimExp)
        }
      },

      getTotalLevel: () => {
        const dims = get().dimensions
        return Math.floor(dims.reduce((sum, d) => sum + d.level, 0) / dims.length)
      },

      setDimensionExp: (map) => set(s => {
        let totalExp = 0
        const dims = s.dimensions.map(d => {
          const raw = map[d.id]
          if (raw === undefined) return d
          const { level, exp, maxExp } = computeLevel(raw)
          totalExp += raw
          return { ...d, level, exp, maxExp }
        })
        return { dimensions: dims, totalExp }
      }),
    }),
    { name: 'arcana-profile' }
  )
)

export default useProfileStore
