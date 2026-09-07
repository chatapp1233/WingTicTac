# frontend

React + TypeScript + Vite client for **WingTicTac** - see the [repo root README](../README.md) for the full picture (what this app is, how the backend fits in, demo accounts).

## Deploying separately from the backend

This client and the API are deployed as two separate services (e.g. two
separate Render web services), so at build time you must point the client at
the backend's actual URL:

```bash
VITE_API_BASE_URL=https://your-backend.onrender.com/api \
VITE_WS_URL=wss://your-backend.onrender.com/ws \
npm run build
```

Without these, the client defaults to relative `/api` and `/ws` paths, which
only work when both are served from the same origin (i.e. local dev, via
Vite's proxy in `vite.config.ts`). The backend's `CORS_ALLOWED_ORIGINS` must
also include this client's deployed URL.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173 - proxies /api and /ws to the backend on :8080
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build locally
```

## Structure

```
src/
  components/
    game/        Tic-Tac-Toe board, engine (minimax AI), scoreboard
    chat/        Chat list, conversation view, message bubble/composer, wallpaper
    layout/      Authenticated app shell (nav, search, profile menu)
    common/      Avatar and other shared bits
  pages/         Route-level components (Landing, Login, Chats, Play)
  store/         Zustand stores - authStore (session), chatStore (conversations,
                 messages, presence, typing - wired to the WebSocket)
  lib/           api.ts (REST client), ws.ts (STOMP facade), gameEngine.ts,
                 avatar.ts, time.ts, notifications.ts
  hooks/         useLocalScore, useMediaQuery
```

State flows one way: WebSocket/REST events land in `chatStore`, components read
from it via selectors and call its actions - nothing talks to `lib/ws.ts` or
`lib/api.ts` directly except the stores.
