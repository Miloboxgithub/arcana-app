import { create } from 'zustand'

interface Dimension {
  id: string
  name: string
  level: number
  exp: number
  maxExp: number
  color: string
}

interface ProfileStore {
  name: string
  dimensions: Dimension[]
  totalLevel: number
  addExp: (dimensionId: string, amount: number) => void
}

const defaultDimensions: Dimension[] = [
  { id: 'pro',     name: '专业力', level: 1, exp: 0, maxExp: 100, color: '#C3002F' },
  { id: 'fitness', name: '体能',   level: 1, exp: 0, maxExp: 100, color: '#E8C840' },
  { id: 'social',  name: '社交',   level: 1, exp: 0, maxExp: 100, color: '#4FC3F7' },
  { id: 'create',  name: '创造',   level: 1, exp: 0, maxExp: 100, color: '#A5D6A7' },
  { id: 'self',    name: '自律',   level: 1, exp: 0, maxExp: 100, color: '#CE93D8' },
]

const useProfileStore = create<ProfileStore>((set) => ({
  name: 'MILO',
  dimensions: defaultDimensions,
  totalLevel: 1,
  addExp: (dimensionId, amount) =>
    set((state) => ({
      dimensions: state.dimensions.map((d) => {
        if (d.id !== dimensionId) return d
        const newExp = d.exp + amount
        if (newExp >= d.maxExp) {
          return { ...d, level: d.level + 1, exp: newExp - d.maxExp, maxExp: Math.floor(d.maxExp * 1.5) }
        }
        return { ...d, exp: newExp }
      }),
    })),
}))

export default useProfileStore
