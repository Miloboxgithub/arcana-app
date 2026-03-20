import { create } from 'zustand'
import { api } from '@/lib/api'

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  data: Record<string, unknown>
  read: boolean
  created_at: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean

  fetchNotifications: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markRead: (id: string) => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const notifications = await api.notifications.list(20, false)
      set({ notifications })
    } catch (e) {
      console.warn('[notifications] fetch error:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.notifications.unreadCount()
      set({ unreadCount: res.count })
    } catch (e) {
      console.warn('[notifications] unread count error:', e)
    }
  },

  markRead: (id: string) => {
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }))
    api.notifications.markRead(id).catch(() => {})
  },

  markAllRead: () => {
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }))
    api.notifications.markAllRead().catch(() => {})
  },
}))
