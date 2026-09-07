import { create } from 'zustand'
import { api } from '../lib/api'
import { chatSocket } from '../lib/ws'
import { notifyNewMessage, requestNotificationPermission } from '../lib/notifications'
import { useAuthStore } from './authStore'
import type { ConversationSummary, DeleteScope, Message, PresenceEvent, ReadReceiptEvent, TypingEvent } from '../types'

const TYPING_AUTO_CLEAR_MS = 3000

interface ConversationPagination {
  hasMore: boolean
  nextBefore: string | null
  loading: boolean
}

interface ChatState {
  conversations: ConversationSummary[]
  conversationsLoaded: boolean
  messagesByConversation: Record<string, Message[]>
  pagination: Record<string, ConversationPagination>
  typingByConversation: Record<string, boolean>
  presenceByUser: Record<string, { online: boolean; lastSeenAt: string | null }>
  activeConversationId: string | null
  connected: boolean

  init: (token: string) => Promise<void>
  teardown: () => void
  loadConversations: () => Promise<void>
  setActiveConversation: (id: string | null) => void
  openConversation: (id: string) => Promise<void>
  loadOlderMessages: (id: string) => Promise<void>
  sendMessage: (id: string, content: string) => void
  setTyping: (id: string, typing: boolean) => void
  deleteMessage: (conversationId: string, messageId: string, scope: DeleteScope) => Promise<void>
  clearConversation: (id: string) => Promise<void>
  startConversationWithUsername: (username: string) => Promise<ConversationSummary>
}

let typingClearTimers: Record<string, ReturnType<typeof setTimeout>> = {}

function myUserId(): string | undefined {
  return useAuthStore.getState().user?.id
}

function upsertConversation(list: ConversationSummary[], updated: ConversationSummary): ConversationSummary[] {
  const idx = list.findIndex((c) => c.id === updated.id)
  const next = idx === -1 ? [...list, updated] : list.map((c, i) => (i === idx ? updated : c))
  return next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  conversationsLoaded: false,
  messagesByConversation: {},
  pagination: {},
  typingByConversation: {},
  presenceByUser: {},
  activeConversationId: null,
  connected: false,

  init: async (token) => {
    requestNotificationPermission()
    await chatSocket.connect(token)
    set({ connected: true })

    chatSocket.onMessage((message) => handleIncomingMessage(get, set, message))
    chatSocket.onMessageUpdated((message) => handleMessageUpdated(set, message))

    chatSocket.onTyping((event: TypingEvent) => {
      set((state) => ({
        typingByConversation: { ...state.typingByConversation, [event.conversationId]: event.typing },
      }))
      clearTimeout(typingClearTimers[event.conversationId])
      if (event.typing) {
        typingClearTimers[event.conversationId] = setTimeout(() => {
          set((state) => ({ typingByConversation: { ...state.typingByConversation, [event.conversationId]: false } }))
        }, TYPING_AUTO_CLEAR_MS)
      }
    })

    chatSocket.onReceipt((event: ReadReceiptEvent) => handleReceipt(set, event))
    chatSocket.onPresence((event: PresenceEvent) => handlePresence(set, event))

    await get().loadConversations()
  },

  teardown: () => {
    chatSocket.disconnect()
    Object.values(typingClearTimers).forEach(clearTimeout)
    typingClearTimers = {}
    set({
      conversations: [],
      conversationsLoaded: false,
      messagesByConversation: {},
      pagination: {},
      typingByConversation: {},
      presenceByUser: {},
      activeConversationId: null,
      connected: false,
    })
  },

  loadConversations: async () => {
    const conversations = await api.listConversations()
    set({
      conversations: conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      conversationsLoaded: true,
    })
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  openConversation: async (id) => {
    set({ activeConversationId: id })
    const existing = get().messagesByConversation[id]
    if (!existing) {
      set((state) => ({ pagination: { ...state.pagination, [id]: { hasMore: false, nextBefore: null, loading: true } } }))
      const page = await api.getMessages(id)
      set((state) => ({
        messagesByConversation: { ...state.messagesByConversation, [id]: page.items },
        pagination: { ...state.pagination, [id]: { hasMore: page.hasMore, nextBefore: page.nextBeforeCreatedAt, loading: false } },
      }))
    }
    const hadUnread = (get().conversations.find((c) => c.id === id)?.unreadCount ?? 0) > 0
    if (hadUnread) {
      set((state) => ({
        conversations: state.conversations.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
      }))
      await api.markRead(id)
    }
    chatSocket.sendRead(id)
  },

  loadOlderMessages: async (id) => {
    const p = get().pagination[id]
    if (!p || !p.hasMore || p.loading) return
    set((state) => ({ pagination: { ...state.pagination, [id]: { ...p, loading: true } } }))
    const page = await api.getMessages(id, p.nextBefore ?? undefined)
    set((state) => ({
      messagesByConversation: { ...state.messagesByConversation, [id]: [...page.items, ...(state.messagesByConversation[id] ?? [])] },
      pagination: { ...state.pagination, [id]: { hasMore: page.hasMore, nextBefore: page.nextBeforeCreatedAt, loading: false } },
    }))
  },

  sendMessage: (id, content) => {
    const trimmed = content.trim()
    if (!trimmed) return
    chatSocket.sendMessage(id, trimmed)
  },

  setTyping: (id, typing) => chatSocket.sendTyping(id, typing),

  deleteMessage: async (conversationId, messageId, scope) => {
    await api.deleteMessage(messageId, scope)
    if (scope === 'ME') {
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: (state.messagesByConversation[conversationId] ?? []).filter((m) => m.id !== messageId),
        },
      }))
    } else {
      // An admin deleting their own message still sees its real content locally (mirrors
      // what MessageMapper does server-side) - everyone else gets the normal tombstone.
      const viewerIsAdmin = useAuthStore.getState().user?.role === 'ADMIN'
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: (state.messagesByConversation[conversationId] ?? []).map((m) =>
            m.id === messageId
              ? viewerIsAdmin
                ? { ...m, deletedForEveryone: true, adminRevealed: true }
                : { ...m, deletedForEveryone: true, content: 'This message was deleted' }
              : m,
          ),
        },
      }))
    }
  },

  clearConversation: async (id) => {
    await api.clearConversation(id)
    set((state) => ({
      messagesByConversation: { ...state.messagesByConversation, [id]: [] },
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, lastMessage: null, unreadCount: 0 } : c)),
    }))
  },

  startConversationWithUsername: async (username) => {
    const summary = await api.startConversation(username)
    set((state) => ({ conversations: upsertConversation(state.conversations, summary) }))
    return summary
  },
}))

function handleIncomingMessage(get: () => ChatState, set: (partial: Partial<ChatState> | ((s: ChatState) => Partial<ChatState>)) => void, message: Message) {
  const state = get()
  const isMine = message.senderId === myUserId()
  const isActive = state.activeConversationId === message.conversationId

  if (state.messagesByConversation[message.conversationId]) {
    set((s) => ({
      messagesByConversation: {
        ...s.messagesByConversation,
        [message.conversationId]: dedupeAppend(s.messagesByConversation[message.conversationId], message),
      },
    }))
  }

  const existing = state.conversations.find((c) => c.id === message.conversationId)
  if (existing) {
    const unreadCount = isMine || isActive ? existing.unreadCount : existing.unreadCount + 1
    set((s) => ({
      conversations: upsertConversation(s.conversations, { ...existing, lastMessage: message, updatedAt: message.createdAt, unreadCount }),
    }))
    if (!isMine) {
      notifyNewMessage(existing.otherUser.displayName, message.content, () => {
        window.location.assign(`/chats/${message.conversationId}`)
      })
    }
  } else {
    // Someone we don't have a conversation row for yet (their first message to us) - refresh from server.
    get().loadConversations()
  }

  if (isActive && !isMine) {
    chatSocket.sendRead(message.conversationId)
  }
}

function handleMessageUpdated(set: (partial: Partial<ChatState> | ((s: ChatState) => Partial<ChatState>)) => void, message: Message) {
  set((s) => ({
    messagesByConversation: {
      ...s.messagesByConversation,
      [message.conversationId]: (s.messagesByConversation[message.conversationId] ?? []).map((m) => (m.id === message.id ? message : m)),
    },
    conversations: s.conversations.map((c) => (c.lastMessage?.id === message.id ? { ...c, lastMessage: message } : c)),
  }))
}

function handleReceipt(set: (partial: Partial<ChatState> | ((s: ChatState) => Partial<ChatState>)) => void, event: ReadReceiptEvent) {
  const uid = myUserId()
  set((s) => ({
    messagesByConversation: {
      ...s.messagesByConversation,
      [event.conversationId]: (s.messagesByConversation[event.conversationId] ?? []).map((m) =>
        m.senderId === uid && new Date(m.createdAt) <= new Date(event.readAt) && m.status !== 'READ'
          ? { ...m, status: 'READ', readAt: event.readAt }
          : m,
      ),
    },
  }))
}

function handlePresence(set: (partial: Partial<ChatState> | ((s: ChatState) => Partial<ChatState>)) => void, event: PresenceEvent) {
  set((s) => ({
    presenceByUser: { ...s.presenceByUser, [event.userId]: { online: event.online, lastSeenAt: event.lastSeenAt } },
    conversations: s.conversations.map((c) =>
      c.otherUser.id === event.userId ? { ...c, otherUser: { ...c.otherUser, online: event.online, lastSeenAt: event.lastSeenAt } } : c,
    ),
  }))
}

function dedupeAppend(list: Message[], message: Message): Message[] {
  if (list.some((m) => m.id === message.id)) {
    return list.map((m) => (m.id === message.id ? message : m))
  }
  return [...list, message]
}
