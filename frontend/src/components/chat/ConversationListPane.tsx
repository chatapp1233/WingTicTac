import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../../store/chatStore'
import { ConversationListItem } from './ConversationListItem'

export function ConversationListPane({ activeId }: { activeId?: string }) {
  const conversations = useChatStore((s) => s.conversations)
  const conversationsLoaded = useChatStore((s) => s.conversationsLoaded)
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pt-3 pb-1">
        <h1 className="font-display px-1 text-xl font-bold">Chats</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {conversationsLoaded && conversations.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="text-sm text-text-dim">No conversations yet</p>
            <button
              onClick={() => window.dispatchEvent(new Event('open-user-search'))}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow"
            >
              Find someone to chat with
            </button>
          </div>
        )}
        {!conversationsLoaded && (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        )}
        {conversations.map((c) => (
          <ConversationListItem key={c.id} conversation={c} active={c.id === activeId} onClick={() => navigate(`/chats/${c.id}`)} />
        ))}
      </div>
    </div>
  )
}
