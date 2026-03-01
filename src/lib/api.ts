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
        dimension: string; is_anchor: boolean; streak: number; created_at: string
      }>>('GET', '/api/habits'),

    upsert: (habit: {
      id: string; name: string; slot: string; exp: number
      dimension: string; is_anchor: boolean; streak: number
    }) =>
      request<{ ok: boolean }>('POST', '/api/habits', habit),

    remove: (id: string) =>
      request<{ ok: boolean }>('DELETE', `/api/habits/${id}`),

    records: (since?: string) =>
      request<Array<{ habit_id: string; date: string; completed_at: string }>>(
        'GET', `/api/habits/records${since ? `?since=${since}` : ''}`
      ),

    checkIn: (habit_id: string, date: string, completed_at: string) =>
      request<{ ok: boolean }>('POST', '/api/habits/records', { habit_id, date, completed_at }),

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

    profile: () =>
      request<{
        habits: Array<{ name: string; slot: string; exp: number; dimension: string }>
        dimensions: Array<{ dim_id: string; total_exp: number }>
      }>('GET', '/api/chat/profile'),
  },
}
