import { create } from 'zustand'
import { api, type ApiUser } from '@/lib/api'

interface AuthState {
  user: ApiUser | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => void
  init: () => Promise<void>
  refreshUser: () => Promise<void>
  updateUser: (updates: Partial<Pick<ApiUser, 'username' | 'avatar_id' | 'onboarding_done'>>) => Promise<void>
}

const TOKEN_KEY = 'arcana_token'

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { set({ loading: false }); return }
    try {
      const { user } = await api.auth.me()
      set({ user, loading: false })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      set({ user: null, loading: false })
    }
  },

  signUp: async (email, password, username) => {
    try {
      const { token, user } = await api.auth.signup(email, password, username)
      localStorage.setItem(TOKEN_KEY, token)
      set({ user })
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  },

  signIn: async (email, password) => {
    try {
      const { token, user } = await api.auth.signin(email, password)
      localStorage.setItem(TOKEN_KEY, token)
      set({ user })
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  },

  signOut: () => {
    localStorage.removeItem(TOKEN_KEY)
    // 清理所有本地数据，确保切换账号时数据隔离
    localStorage.removeItem('arcana-habits')
    localStorage.removeItem('arcana-profile')
    localStorage.removeItem('arcana-auth')
    set({ user: null })
  },

  refreshUser: async () => {
    try {
      const { user } = await api.auth.me()
      set({ user })
    } catch { /* ignore */ }
  },

  updateUser: async (updates) => {
    await api.auth.patchMe(updates)
    // Optimistically update local state
    const current = get().user
    if (current) set({ user: { ...current, ...updates } })
  },
}))

export default useAuthStore
