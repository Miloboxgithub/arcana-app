/**
 * api.ts — arcana-server HTTP client
 * Base URL: VITE_API_BASE_URL env var
 */

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://arcana-server-production-57c0.up.railway.app'

function getToken(): string | null {
  return localStorage.getItem('arcana_token')
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── Auth ─────────────────────────────────────────────────

export interface ApiUser {
  id: string
  email: string
  username: string | null
  avatar_id: string | null
  onboarding_done: boolean
}

export const api = {
  auth: {
    signup: (email: string, password: string, username: string) =>
      request<{ token: string; user: ApiUser }>('POST', '/api/auth/signup', { email, password, username }, false),

    signin: (email: string, password: string) =>
      request<{ token: string; user: ApiUser }>('POST', '/api/auth/signin', { email, password }, false),

    me: () =>
      request<{ user: ApiUser }>('GET', '/api/auth/me'),

    patchMe: (updates: Partial<Pick<ApiUser, 'username' | 'avatar_id' | 'onboarding_done'>>) =>
      request<{ ok: boolean }>('PATCH', '/api/auth/me', updates),
  },

  habits: {
    list: () =>
      request<Array<{
        id: string; name: string; slot: string; exp: number
        dimension: string; dimensions?: Array<{ dimension: string; exp: number }>
        is_anchor: boolean; streak: number; created_at: string
      }>>('GET', '/api/habits'),

    upsert: (habit: {
      id: string; name: string; slot: string; exp: number
      dimension: string; dimensions?: Array<{ dimension: string; exp: number }>
      is_anchor: boolean; streak: number
    }) =>
      request<{ ok: boolean }>('POST', '/api/habits', habit),

    remove: (id: string) =>
      request<{ ok: boolean }>('DELETE', `/api/habits/${id}`),

    records: (since?: string) =>
      request<Array<{ habit_id: string; date: string; completed_at: string }>>(
        'GET', `/api/habits/records${since ? `?since=${since}` : ''}`
      ),

    checkIn: (habit_id: string, date: string, completed_at: string) =>
      request<{ ok: boolean; newAchievements?: string[] }>('POST', '/api/habits/records', { habit_id, date, completed_at }),

    uncheck: (habit_id: string, date: string) =>
      request<{ ok: boolean }>('DELETE', '/api/habits/records', { habit_id, date }),
  },

  dimensions: {
    list: () =>
      request<Array<{ dim_id: string; total_exp: number }>>('GET', '/api/dimensions'),

    upsert: (items: Array<{ dim_id: string; total_exp: number }>) =>
      request<{ ok: boolean }>('POST', '/api/dimensions', items),
  },

  chat: {
    send: (messages: Array<{ role: string; content: string }>, system?: string) =>
      request<{ reply: string }>('POST', '/api/chat', { messages, system }),

    // 智能分析输入，判断是否应该添加经验值
    analyze: (userPrompt: string, systemPrompt: string) =>
      request<{
        shouldAddExp: boolean
        dimension: string | null
        exp: number
        dimensions?: Array<{ dimension: string; exp: number }>
        reason: string
      }>('POST', '/api/chat/analyze', { prompt: userPrompt, system: systemPrompt }),

    profile: () =>
      request<{
        habits: Array<{ name: string; slot: string; exp: number; dimension: string }>
        dimensions: Array<{ dim_id: string; total_exp: number }>
      }>('GET', '/api/chat/profile'),
  },

  achievements: {
    list: () =>
      request<{
        achievements: Array<{
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
        }>
      }>('GET', '/api/achievements'),
  },

  reports: {
    weekly: () =>
      request<Array<{
        id: string
        week_start: string
        week_end: string
        total_checks: number
        total_exp: number
        streak_days: number
        dim_changes: Record<string, number>
        top_habits: Array<{ name: string; count: number }>
        highlights: string[]
        suggestions: string[]
        created_at: string
      }>>('GET', '/api/reports/weekly'),

    generateWeekly: () =>
      request<{ id: string; week_start: string; highlights: string[]; suggestions: string[] }>(
        'POST', '/api/reports/weekly/generate'
      ),
  },

  notifications: {
    list: (limit = 20, unreadOnly = false) =>
      request<Array<{
        id: string
        type: string
        title: string
        body: string
        data: Record<string, unknown>
        read: boolean
        created_at: string
      }>>('GET', `/api/notifications?limit=${limit}&unread=${unreadOnly ? 1 : 0}`),

    unreadCount: () =>
      request<{ count: number }>('GET', '/api/notifications/unread-count'),

    markRead: (id: string) =>
      request<{ ok: boolean }>('PATCH', `/api/notifications/${id}/read`),

    markAllRead: () =>
      request<{ ok: boolean }>('POST', '/api/notifications/read-all'),
  },
}
