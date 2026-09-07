export function TypingIndicator() {
  return (
    <div className="flex justify-start px-3 py-0.5">
      <div className="flex animate-rise-in items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-surface-2 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-text-dim"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
