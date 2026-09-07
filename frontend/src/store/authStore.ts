import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, ApiError, setAuthToken, setUnauthorizedHandler } from '../lib/api'
import type { CurrentUser } from '../types'

interface AuthState {
  user: CurrentUser | null
  token: string | null
  status: 'idle' | 'checking' | 'authenticated' | 'unauthenticated'
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hydrate: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      status: 'idle',
      error: null,

      login: async (username, password) => {
        set({ error: null })
        try {
          const res = await api.login(username, password)
          setAuthToken(res.token)
          set({ token: res.token, user: res.user, status: 'authenticated' })
        } catch (e) {
          const message = e instanceof ApiError ? e.message : 'Could not sign in. Please try again.'
          set({ error: message })
          throw e
        }
      },

      logout: () => {
        setAuthToken(null)
        set({ token: null, user: null, status: 'unauthenticated' })
      },

      hydrate: async () => {
        const token = get().token
        if (!token) {
          set({ status: 'unauthenticated' })
          return
        }
        setAuthToken(token)
        set({ status: 'checking' })
        try {
          const user = await api.me()
          set({ user, status: 'authenticated' })
        } catch {
          setAuthToken(null)
          set({ token: null, user: null, status: 'unauthenticated' })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'wingtictac.auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)

setUnauthorizedHandler(() => {
  useAuthStore.getState().logout()
})
