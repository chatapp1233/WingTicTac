const EMOJIS = [
  '😀', '😂', '😍', '😎', '🤔', '😅', '😭', '😡', '👍', '👎',
  '🙏', '👏', '🔥', '🎉', '❤️', '💯', '✨', '🎮', '🕹️', '🎲',
  '♟️', '🃏', '⭐', '🏆', '😴', '🤝', '👀', '🙌', '💪', '✅',
]

export function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute bottom-full left-0 z-20 mb-2 grid w-64 animate-rise-in grid-cols-6 gap-1 rounded-2xl border border-border bg-bg-elevated p-2.5 shadow-glow backdrop-blur-md">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji)
              onClose()
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors hover:bg-white/10"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  )
}
