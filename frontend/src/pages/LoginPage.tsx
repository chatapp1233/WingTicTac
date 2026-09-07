import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Logo } from './LandingPage'

export function LoginPage() {
  const { status, login, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated') {
    const to = (location.state as { from?: string } | null)?.from ?? '/chats'
    return <Navigate to={to} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      navigate('/chats', { replace: true })
    } catch {
      // error surfaced via store
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-8">
        <Logo />
      </Link>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-glow sm:p-7"
      >
        <h1 className="font-display mb-1 text-xl font-bold">Welcome back</h1>
        <p className="mb-6 text-sm text-text-dim">Sign in to continue your games and chats.</p>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-text-dim uppercase">Username</span>
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. alex"
            autoComplete="username"
            className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-primary/60 focus:outline-none"
          />
        </label>

        <label className="mb-2 block">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-text-dim uppercase">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-primary/60 focus:outline-none"
          />
        </label>

        {error && <p className="mt-2 text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !username || !password}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-primary to-primary-2 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="mt-5 text-center text-xs text-text-faint">
          New accounts are set up by an administrator. Don't have one? Ask your game master.
        </p>
      </form>
    </div>
  )
}
