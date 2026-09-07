/** Thin wrapper around the browser Notification API - new-message alerts while the tab is backgrounded. */

export function requestNotificationPermission() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'default') return
  Notification.requestPermission().catch(() => {})
}

export function notifyNewMessage(title: string, body: string, onClick?: () => void) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  if (document.visibilityState === 'visible') return
  try {
    const n = new Notification(title, { body, icon: '/favicon.svg', tag: 'wingtictac-message' })
    if (onClick) n.onclick = () => {
      window.focus()
      onClick()
    }
  } catch {
    // Notification constructor can throw on some platforms (e.g. iOS Safari) - fail silently
  }
}
