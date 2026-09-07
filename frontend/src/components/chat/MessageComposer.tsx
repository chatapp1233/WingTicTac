import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { EmojiPicker } from './EmojiPicker'

const TYPING_IDLE_MS = 1500

export function MessageComposer({ onSend, onTyping }: { onSend: (text: string) => void; onTyping: (typing: boolean) => void }) {
  const [value, setValue] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingRef = useRef(false)
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [value])

  useEffect(
    () => () => {
      clearTimeout(idleTimer.current)
      if (typingRef.current) onTyping(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  function notifyTyping() {
    if (!typingRef.current) {
      typingRef.current = true
      onTyping(true)
    }
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      typingRef.current = false
      onTyping(false)
    }, TYPING_IDLE_MS)
  }

  function send() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
    clearTimeout(idleTimer.current)
    if (typingRef.current) {
      typingRef.current = false
      onTyping(false)
    }
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="safe-bottom relative z-10 border-t border-border bg-bg/90 px-2.5 py-2.5 backdrop-blur-md sm:px-3">
      <div className="flex items-end gap-2">
        <div className="relative">
          <button
            onClick={() => setEmojiOpen((v) => !v)}
            aria-label="Add emoji"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-text-dim transition-colors hover:bg-surface"
          >
            😊
          </button>
          {emojiOpen && (
            <EmojiPicker
              onClose={() => setEmojiOpen(false)}
              onSelect={(emoji) => {
                setValue((v) => v + emoji)
                textareaRef.current?.focus()
              }}
            />
          )}
        </div>

        <div className="flex flex-1 items-end rounded-3xl border border-border bg-surface px-3.5 py-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (e.target.value.trim()) notifyTyping()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="max-h-[120px] flex-1 resize-none bg-transparent text-sm text-text placeholder:text-text-faint focus:outline-none"
          />
        </div>

        <button
          onClick={send}
          disabled={!value.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-glow transition-opacity disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor">
            <path d="M3 11.5 20.5 3 15 20.5l-3.5-7L3 11.5Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
