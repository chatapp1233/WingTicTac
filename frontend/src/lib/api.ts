import type {
  AuthResponse,
  ConversationSummary,
  CurrentUser,
  DeleteScope,
  Message,
  MessagePage,
  UserSummary,
} from '../types'

// Defaults to a relative path, which works via Vite's dev proxy (see vite.config.ts)
// when frontend and backend are served from the same origin. In production the two
// are deployed as separate services with different URLs, so VITE_API_BASE_URL must be
// set at build time to the backend's absolute origin, e.g. https://wingtictac-api.onrender.com/api
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// The current JWT, mirrored here from the auth store so this module never has to
// import it back (would create a circular dependency). Call setAuthToken() whenever
// the store's token changes.
let currentToken: string | null = null
export function setAuthToken(token: string | null) {
  currentToken = token
}

let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (currentToken) headers.set('Authorization', `Bearer ${currentToken}`)

  const res = await fetch(API_BASE + path, { ...options, headers })

  if (res.status === 401) {
    onUnauthorized?.()
    throw new ApiError(401, 'Your session has expired. Please sign in again.')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.message ?? `Request failed (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  login: (username: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  me: () => request<CurrentUser>('/auth/me'),

  searchUsers: (query: string) => request<UserSummary[]>(`/users/search?q=${encodeURIComponent(query)}`),

  listConversations: () => request<ConversationSummary[]>('/conversations'),

  startConversation: (username: string) =>
    request<ConversationSummary>('/conversations', { method: 'POST', body: JSON.stringify({ username }) }),

  getMessages: (conversationId: string, before?: string) => {
    const qs = before ? `?before=${encodeURIComponent(before)}` : ''
    return request<MessagePage>(`/conversations/${conversationId}/messages${qs}`)
  },

  markRead: (conversationId: string) =>
    request<void>(`/conversations/${conversationId}/read`, { method: 'POST' }),

  clearConversation: (conversationId: string) =>
    request<void>(`/conversations/${conversationId}`, { method: 'DELETE' }),

  deleteMessage: (messageId: string, scope: DeleteScope) =>
    request<void>(`/messages/${messageId}?scope=${scope}`, { method: 'DELETE' }),
}

export type { Message }
