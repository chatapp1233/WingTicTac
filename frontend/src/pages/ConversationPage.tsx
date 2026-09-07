import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { Avatar } from '../components/common/Avatar'
import { ChatWallpaper } from '../components/chat/ChatWallpaper'
import { MessageBubble } from '../components/chat/MessageBubble'
import { MessageComposer } from '../components/chat/MessageComposer'
import { TypingIndicator } from '../components/chat/TypingIndicator'
import { dateSeparatorLabel, lastSeenLabel } from '../lib/time'
import type { DeleteScope, Message } from '../types'

const NEAR_BOTTOM_THRESHOLD = 80
const NEAR_TOP_THRESHOLD = 60

// A stable reference for "no messages yet" - a fresh `?? []` literal inside the zustand
// selector would return a new array every call, which breaks reference-equality checks in
// useSyncExternalStore and causes an infinite render loop ("Maximum update depth exceeded").
const EMPTY_MESSAGES: Message[] = []

function groupByDay(messages: Message[]): { label: string; items: Message[] }[] {
  const groups: { label: string; items: Message[] }[] = []
  for (const m of messages) {
    const label = dateSeparatorLabel(m.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(m)
    else groups.push({ label, items: [m] })
  }
  return groups
}

export function ConversationPage() {
  const { conversationId = '' } = useParams()
  const navigate = useNavigate()
  const myId = useAuthStore((s) => s.user?.id)

  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === conversationId))
  const messages = useChatStore((s) => s.messagesByConversation[conversationId] ?? EMPTY_MESSAGES)
  const pagination = useChatStore((s) => s.pagination[conversationId])
  const isTyping = useChatStore((s) => s.typingByConversation[conversationId] ?? false)
  const openConversation = useChatStore((s) => s.openConversation)
  const loadOlderMessages = useChatStore((s) => s.loadOlderMessages)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const setTyping = useChatStore((s) => s.setTyping)
  const deleteMessage = useChatStore((s) => s.deleteMessage)
  const clearConversation = useChatStore((s) => s.clearConversation)

  const [menuOpen, setMenuOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const prevScrollHeight = useRef(0)
  const stickToBottom = useRef(true)

  useEffect(() => {
    stickToBottom.current = true
    prevScrollHeight.current = 0
    openConversation(conversationId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    if (prevScrollHeight.current) {
      el.scrollTop = el.scrollHeight - prevScrollHeight.current
      prevScrollHeight.current = 0
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  function handleScroll() {
    const el = listRef.current
    if (!el) return
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD
    if (el.scrollTop < NEAR_TOP_THRESHOLD && pagination?.hasMore && !pagination.loading) {
      prevScrollHeight.current = el.scrollHeight
      loadOlderMessages(conversationId)
    }
  }

  async function handleClear() {
    setMenuOpen(false)
    if (confirm(`Clear this conversation with ${conversation?.otherUser.displayName}? This can't be undone.`)) {
      await clearConversation(conversationId)
    }
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    )
  }

  const { otherUser } = conversation
  const statusLabel = isTyping ? 'typing…' : otherUser.online ? 'online' : lastSeenLabel(otherUser.lastSeenAt)

  return (
    <div className="flex h-full flex-col">
      <div className="relative z-10 flex items-center gap-2.5 border-b border-border bg-bg-elevated px-3 py-2.5 backdrop-blur-md">
        <button
          onClick={() => navigate('/chats')}
          aria-label="Back to chats"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-dim hover:bg-surface sm:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19 8 12l7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <Avatar name={otherUser.displayName} seed={otherUser.id} online={otherUser.online} showStatus size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{otherUser.displayName}</p>
          <p className={`truncate text-xs ${isTyping ? 'text-primary-2' : 'text-text-faint'}`}>{statusLabel}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Conversation menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-dim hover:bg-surface"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5">
              <circle cx="10" cy="4" r="1.6" fill="currentColor" />
              <circle cx="10" cy="10" r="1.6" fill="currentColor" />
              <circle cx="10" cy="16" r="1.6" fill="currentColor" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-48 animate-rise-in rounded-xl border border-border bg-bg-elevated p-1.5 shadow-glow backdrop-blur-md">
                <button onClick={handleClear} className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-white/5">
                  Clear conversation
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <ChatWallpaper />
        <div ref={listRef} onScroll={handleScroll} className="relative h-full overflow-y-auto py-3">
          {pagination?.loading && (
            <div className="flex justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          )}
          {groupByDay(messages).map((group) => (
            <div key={group.label}>
              <div className="my-2 flex justify-center">
                <span className="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-medium text-text-dim">{group.label}</span>
              </div>
              {group.items.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isMine={message.senderId === myId}
                  onDelete={(scope: DeleteScope) => deleteMessage(conversationId, message.id, scope)}
                />
              ))}
            </div>
          ))}
          {messages.length === 0 && !pagination?.loading && (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-text-faint">
              No messages yet. Say hi to {otherUser.displayName}!
            </div>
          )}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      <MessageComposer onSend={(text) => sendMessage(conversationId, text)} onTyping={(typing) => setTyping(conversationId, typing)} />
    </div>
  )
}
