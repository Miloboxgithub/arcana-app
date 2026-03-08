import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeId = 'p5' | 'p3' | 'p4'

interface ThemeConfig {
  id: ThemeId
  name: string
  description: string
}

export const THEMES: ThemeConfig[] = [
  { id: 'p5', name: 'P5 · 涡轮红', description: 'Pop Punk · 动态激进' },
  { id: 'p3', name: 'P3 · 深海蓝', description: '沉静 · 神秘氛围' },
  { id: 'p4', name: 'P4 · 黄金乡', description: '温暖 · 活力怀旧' },
]

interface UIStore {
  modalOpen: boolean
  theme: ThemeId
  openModal: () => void
  closeModal: () => void
  setTheme: (theme: ThemeId) => void
}

const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      modalOpen: false,
      theme: 'p5',
      openModal: () => set({ modalOpen: true }),
      closeModal: () => set({ modalOpen: false }),
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        set({ theme })
      },
    }),
    {
      name: 'arcana-theme',
    }
  )
)

// Initialize theme on load
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('arcana-theme')
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme)
      if (parsed.state?.theme) {
        document.documentElement.setAttribute('data-theme', parsed.state.theme)
      }
    } catch {}
  }
}

export default useUIStore
