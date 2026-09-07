/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin + /api, e.g. https://wingtictac-api.onrender.com/api. Omit for same-origin dev (Vite proxy). */
  readonly VITE_API_BASE_URL?: string
  /** Backend WebSocket URL, e.g. wss://wingtictac-api.onrender.com/ws. Omit for same-origin dev (Vite proxy). */
  readonly VITE_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
