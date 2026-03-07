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
        let totalDimExp = 0
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
            // 计算更新后的总经验值
            totalDimExp = newExp + (newLevel - 1) * newMax
            return { ...d, exp: newExp, level: newLevel, maxExp: newMax }
          })
          return { dimensions: dims, totalExp: s.totalExp + amount }
        })
        // Cloud sync: push updated total exp
        if (totalDimExp > 0) {
          pushDimExp(dimensionId, totalDimExp)
        }
      },

      removeExp: (dimensionId, amount) => {
        let totalDimExp = 0
        set(s => ({
          dimensions: s.dimensions.map(d => {
            if (d.id !== dimensionId) return d
            const newExp = Math.max(0, d.exp - amount)
            totalDimExp = newExp + (d.level - 1) * d.maxExp
            return { ...d, exp: newExp }
          }),
          totalExp: Math.max(0, s.totalExp - amount),
        }))
        // Cloud sync
        if (totalDimExp >= 0) {
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
