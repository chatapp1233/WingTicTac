import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useChatStore } from '../../store/chatStore'
import type { UserSummary } from '../../types'
import { Avatar } from '../common/Avatar'

export function UserSearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const startConversationWithUsername = useChatStore((s) => s.startConversationWithUsername)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const trimmed = query.trim().replace(/^@/, '')
    if (!trimmed) {
      setResults([])
      setNotFound(false)
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const found = await api.searchUsers(trimmed)
        setResults(found)
        setNotFound(found.length === 0)
      } catch {
        setResults([])
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  async function openConversation(user: UserSummary) {
    setStarting(user.id)
    try {
      const conversation = await startConversationWithUsername(user.username)
      onClose()
      navigate(`/chats/${conversation.id}`)
    } finally {
      setStarting(null)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-bg/95 backdrop-blur-sm">
      <div className="safe-top flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2">
          <span className="text-text-faint">@</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username"
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-faint focus:outline-none"
          />
        </div>
        <button onClick={onClose} className="px-2 text-sm font-medium text-text-dim hover:text-text">
          Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading && <p className="px-3 py-4 text-sm text-text-faint">Searching…</p>}
        {!loading && notFound && query.trim() && (
          <p className="px-3 py-4 text-sm text-text-faint">No player found with username "@{query.trim().replace(/^@/, '')}"</p>
        )}
        {!loading &&
          results.map((user) => (
            <button
              key={user.id}
              onClick={() => openConversation(user)}
              disabled={starting === user.id}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface disabled:opacity-60"
            >
              <Avatar name={user.displayName} seed={user.id} online={user.online} showStatus />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.displayName}</p>
                <p className="truncate text-xs text-text-faint">@{user.username}</p>
              </div>
              {starting === user.id && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
              )}
            </button>
          ))}
        {!loading && !query.trim() && (
          <p className="px-3 py-4 text-sm text-text-faint">Type a username to find someone to chat with.</p>
        )}
      </div>
    </div>
  )
}
