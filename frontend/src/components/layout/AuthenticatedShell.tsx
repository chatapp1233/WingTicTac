import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { Avatar } from '../common/Avatar'
import { UserSearchOverlay } from '../chat/UserSearchOverlay'
import { Logo } from '../../pages/LandingPage'

const NAV_ITEMS = [
  { to: '/chats', label: 'Chats', icon: ChatIcon },
  { to: '/play', label: 'Play', icon: PlayIcon },
] as const

export function AuthenticatedShell() {
  const { user, token, logout } = useAuthStore()
  const init = useChatStore((s) => s.init)
  const teardown = useChatStore((s) => s.teardown)
  const location = useLocation()
  const navigate = useNavigate()
  const inConversation = useMatch('/chats/:conversationId')
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (token) init(token)
    return () => teardown()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    const open = () => setSearchOpen(true)
    window.addEventListener('open-user-search', open)
    return () => window.removeEventListener('open-user-search', open)
  }, [])

  const showBottomNav = !inConversation

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="safe-top sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  location.pathname.startsWith(item.to) ? 'bg-primary/15 text-primary-2' : 'text-text-dim hover:text-text'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search users"
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-dim transition-colors hover:bg-surface hover:text-text"
            >
              <SearchIcon />
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen((v) => !v)} aria-label="Profile menu">
                <Avatar name={user?.displayName ?? '?'} seed={user?.id} size="sm" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 animate-rise-in rounded-xl border border-border bg-bg-elevated p-1.5 shadow-glow backdrop-blur-md">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user?.displayName}</p>
                      <p className="text-xs text-text-faint">@{user?.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        logout()
                        navigate('/')
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-white/5"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </main>

      {showBottomNav && (
        <nav className="safe-bottom sticky bottom-0 z-20 border-t border-border bg-bg/90 backdrop-blur-md sm:hidden">
          <div className="flex items-center justify-around py-2">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center gap-0.5 px-6 py-1 text-xs font-medium ${
                    active ? 'text-primary-2' : 'text-text-faint'
                  }`}
                >
                  <item.icon active={active} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      )}

      {searchOpen && <UserSearchOverlay onClose={() => setSearchOpen(false)} />}
    </div>
  )
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16v11H8l-4 4V5Z" strokeLinejoin="round" />
    </svg>
  )
}

function PlayIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="13" rx="4" fill={active ? 'currentColor' : 'none'} fillOpacity="0.15" />
      <circle cx="9" cy="12.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.5" />
      <line x1="20" y1="20" x2="15.8" y2="15.8" strokeLinecap="round" />
    </svg>
  )
}
