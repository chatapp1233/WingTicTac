import { Client, type IMessage } from '@stomp/stompjs'
import type { Message, PresenceEvent, ReadReceiptEvent, TypingEvent } from '../types'

type Unsubscribe = () => void

/**
 * Thin facade around the STOMP client: hides connection/reconnection details and
 * exposes just the destinations this app cares about. Mirrors the backend's
 * ChatWebSocketController + NotificationService destinations one-to-one.
 */
class ChatSocket {
  private client: Client | null = null
  private connected = false
  private connectPromise: Promise<void> | null = null

  connect(token: string): Promise<void> {
    if (this.connectPromise) return this.connectPromise

    // Same origin-vs-separate-deployment story as lib/api.ts: falls back to this page's
    // own host (works via Vite's dev proxy) unless VITE_WS_URL points at the backend's
    // own origin, e.g. wss://wingtictac-api.onrender.com/ws
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = import.meta.env.VITE_WS_URL ?? `${protocol}//${window.location.host}/ws`
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    })

    this.connectPromise = new Promise((resolve) => {
      client.onConnect = () => {
        this.connected = true
        resolve()
      }
      client.onStompError = (frame) => {
        console.error('STOMP error', frame.headers['message'], frame.body)
      }
      client.onWebSocketClose = () => {
        this.connected = false
      }
      client.activate()
    })

    this.client = client
    return this.connectPromise
  }

  disconnect() {
    this.client?.deactivate()
    this.client = null
    this.connected = false
    this.connectPromise = null
  }

  isConnected() {
    return this.connected
  }

  private subscribe<T>(destination: string, handler: (payload: T) => void): Unsubscribe {
    if (!this.client) return () => {}
    const sub = this.client.subscribe(destination, (msg: IMessage) => {
      handler(JSON.parse(msg.body) as T)
    })
    return () => sub.unsubscribe()
  }

  onMessage(handler: (message: Message) => void) {
    return this.subscribe<Message>('/user/queue/messages', handler)
  }

  onMessageUpdated(handler: (message: Message) => void) {
    return this.subscribe<Message>('/user/queue/messages.updated', handler)
  }

  onTyping(handler: (event: TypingEvent) => void) {
    return this.subscribe<TypingEvent>('/user/queue/typing', handler)
  }

  onReceipt(handler: (event: ReadReceiptEvent) => void) {
    return this.subscribe<ReadReceiptEvent>('/user/queue/receipts', handler)
  }

  onPresence(handler: (event: PresenceEvent) => void) {
    return this.subscribe<PresenceEvent>('/user/queue/presence', handler)
  }

  private publish(destination: string, body: unknown) {
    if (!this.client || !this.connected) {
      console.warn(`Not connected - dropped publish to ${destination}`)
      return
    }
    this.client.publish({ destination, body: JSON.stringify(body) })
  }

  sendMessage(conversationId: string, content: string) {
    this.publish('/app/chat.send', { conversationId, content })
  }

  sendTyping(conversationId: string, typing: boolean) {
    this.publish('/app/chat.typing', { conversationId, typing })
  }

  sendRead(conversationId: string) {
    this.publish('/app/chat.read', { conversationId })
  }
}

export const chatSocket = new ChatSocket()
