import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { bubbleTimestamp } from '../../lib/time'
import type { Message } from '../../types'

function StatusTicks({ status }: { status: Message['status'] }) {
  const color = status === 'READ' ? 'text-primary-2' : 'text-white/50'
  if (status === 'SENT') {
    return (
      <svg viewBox="0 0 16 12" className="h-3 w-3 text-white/50">
        <path d="M1 6.5 5 10.5 15 1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 20 12" className={`h-3 w-4 ${color}`}>
      <path d="M1 6.5 5 10.5 12 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6.5 11 10.5 19 1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const MENU_WIDTH = 160
const MENU_MARGIN = 6

interface Props {
  message: Message
  isMine: boolean
  onDelete: (scope: 'ME' | 'EVERYONE') => void
}

export function MessageBubble({ message, isMine, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; openUp: boolean } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // Masked (tombstone) for everyone except an admin who's been handed the real content -
  // see MessageMapper on the backend. adminRevealed implies deletedForEveryone is true.
  const deleted = message.deletedForEveryone && !message.adminRevealed

  // The message list is a scrolling container (overflow-y-auto), so a plain
  // absolute-positioned popover gets clipped whenever it opens near the top or
  // bottom edge of that scroll area. Rendering it in a portal, fixed to viewport
  // coordinates computed from the trigger's bounding rect, sidesteps that entirely.
  function openMenu() {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const menuHeight = isMine ? 84 : 44
    const openUp = rect.top - menuHeight - MENU_MARGIN > 0
    const left = isMine
      ? Math.max(8, rect.right - MENU_WIDTH)
      : Math.min(window.innerWidth - MENU_WIDTH - 8, rect.left)
    const top = openUp ? rect.top - MENU_MARGIN : rect.bottom + MENU_MARGIN
    setMenuPos({ top, left, openUp })
    setMenuOpen(true)
  }

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [menuOpen])

  return (
    <div className={`group flex ${isMine ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
      <div className={`flex max-w-[78%] items-end gap-1 sm:max-w-[65%] ${isMine ? 'flex-row' : 'flex-row-reverse'}`}>
        {!deleted && (
          <button
            ref={triggerRef}
            onClick={openMenu}
            className="mb-1 shrink-0 rounded-full p-1 text-text-faint opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Message options"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4">
              <circle cx="10" cy="4" r="1.6" fill="currentColor" />
              <circle cx="10" cy="10" r="1.6" fill="currentColor" />
              <circle cx="10" cy="16" r="1.6" fill="currentColor" />
            </svg>
          </button>
        )}

        <div
          className={`animate-rise-in rounded-2xl px-3.5 py-2 ${
            deleted
              ? 'border border-border bg-surface text-text-faint italic'
              : message.adminRevealed
                ? 'border border-dashed border-accent-amber/50 bg-surface-2 text-text'
                : isMine
                  ? 'bg-gradient-to-br from-primary to-[#5c3fd1] text-white'
                  : 'border border-border bg-surface-2 text-text'
          } ${isMine ? 'rounded-br-md' : 'rounded-bl-md'}`}
        >
          {message.adminRevealed && (
            <p className="mb-1 text-[10.5px] font-medium tracking-wide text-accent-amber uppercase">
              Deleted by sender · visible to you as admin
            </p>
          )}
          <p className="text-[0.925rem] leading-snug break-words whitespace-pre-wrap">
            {deleted ? 'This message was deleted' : message.content}
          </p>
          <div className={`mt-1 flex items-center justify-end gap-1 ${isMine && !message.adminRevealed ? 'text-white/70' : 'text-text-faint'}`}>
            <span className="text-[10.5px]">{bubbleTimestamp(message.createdAt)}</span>
            {isMine && !deleted && !message.adminRevealed && <StatusTicks status={message.status} />}
          </div>
        </div>
      </div>

      {menuOpen &&
        menuPos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div
              style={{
                position: 'fixed',
                top: menuPos.openUp ? undefined : menuPos.top,
                bottom: menuPos.openUp ? window.innerHeight - menuPos.top : undefined,
                left: menuPos.left,
                width: MENU_WIDTH,
              }}
              className="animate-rise-in z-50 rounded-xl border border-border bg-bg-elevated p-1 shadow-glow backdrop-blur-md"
            >
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onDelete('ME')
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"
              >
                Delete for me
              </button>
              {isMine && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete('EVERYONE')
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-white/5"
                >
                  Delete for everyone
                </button>
              )}
            </div>
          </>,
          document.body,
        )}
    </div>
  )
}
