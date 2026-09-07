import { Avatar } from '../common/Avatar'
import { shortTimestamp } from '../../lib/time'
import type { ConversationSummary } from '../../types'

function previewText(conversation: ConversationSummary): string {
  const msg = conversation.lastMessage
  if (!msg) return 'Say hi 👋'
  if (msg.adminRevealed) return `🗑️ ${msg.content}`
  if (msg.deletedForEveryone) return 'This message was deleted'
  return msg.content
}

export function ConversationListItem({ conversation, active, onClick }: { conversation: ConversationSummary; active: boolean; onClick: () => void }) {
  const { otherUser, unreadCount } = conversation
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
        active ? 'bg-surface-2' : 'hover:bg-surface'
      }`}
    >
      <Avatar name={otherUser.displayName} seed={otherUser.id} online={otherUser.online} showStatus />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium">{otherUser.displayName}</p>
          {conversation.lastMessage && (
            <span className={`shrink-0 text-[11px] ${unreadCount > 0 ? 'font-semibold text-primary-2' : 'text-text-faint'}`}>
              {shortTimestamp(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-text-dim">{previewText(conversation)}</p>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
