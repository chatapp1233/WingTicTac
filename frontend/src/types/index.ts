export interface UserSummary {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  online: boolean
  lastSeenAt: string | null
}

export type Role = 'USER' | 'ADMIN'

/** The logged-in user's own profile - includes `role`, which UserSummary deliberately omits. */
export interface CurrentUser extends UserSummary {
  role: Role
}

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  status: MessageStatus
  deletedForEveryone: boolean
  /** True only for an admin viewer seeing the real content of a deleted-for-everyone message. */
  adminRevealed: boolean
  createdAt: string
  deliveredAt: string | null
  readAt: string | null
}

export interface ConversationSummary {
  id: string
  otherUser: UserSummary
  lastMessage: Message | null
  unreadCount: number
  updatedAt: string
}

export interface MessagePage {
  items: Message[]
  hasMore: boolean
  nextBeforeCreatedAt: string | null
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: CurrentUser
}

export interface TypingEvent {
  conversationId: string
  fromUserId: string
  typing: boolean
}

export interface ReadReceiptEvent {
  conversationId: string
  readerId: string
  readAt: string
}

export interface PresenceEvent {
  userId: string
  online: boolean
  lastSeenAt: string | null
}

export type DeleteScope = 'ME' | 'EVERYONE'

export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  details: string[]
}
