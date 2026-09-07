import { useParams } from 'react-router-dom'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { ConversationListPane } from '../components/chat/ConversationListPane'
import { EmptyConversationState } from '../components/chat/EmptyConversationState'
import { ConversationPage } from './ConversationPage'

export function ChatsPage() {
  const { conversationId } = useParams()
  const isDesktop = useIsDesktop()

  const showList = isDesktop || !conversationId
  const showConversation = isDesktop || !!conversationId

  return (
    <div className="flex h-full">
      {showList && (
        <div className={isDesktop ? 'w-[360px] shrink-0 border-r border-border' : 'w-full'}>
          <ConversationListPane activeId={conversationId} />
        </div>
      )}
      {showConversation && (
        <div className="min-w-0 flex-1">{conversationId ? <ConversationPage /> : <EmptyConversationState />}</div>
      )}
    </div>
  )
}
