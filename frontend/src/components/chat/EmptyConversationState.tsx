export function EmptyConversationState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="font-display flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-2 text-2xl font-bold text-white opacity-80">
        #
      </div>
      <p className="text-sm text-text-dim">Select a conversation to start chatting</p>
    </div>
  )
}
