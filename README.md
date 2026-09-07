# WingTicTac

A mobile-first web app that looks like a casual gaming site - a playable,
unbeatable-if-you-want-it Tic-Tac-Toe game sits on the public landing page -
but is actually a private, WhatsApp-style one-to-one messaging platform once
you sign in. There is no public sign-up: accounts are provisioned by an
administrator.

```
chat-app/
  backend/    Spring Boot 3 (Java 17) - REST + STOMP/WebSocket API
  frontend/   React 19 + TypeScript + Vite + Tailwind CSS 4
  docker-compose.yml   Postgres + backend, for a real deployment
```

## Quick start

**Backend** (zero setup - uses an embedded file-based DB, see [backend/README.md](backend/README.md)):

```bash
cd backend
mvn spring-boot:run        # http://localhost:8080
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173. The landing page is the game; the **Sign In**
button is top-right.

### Demo accounts (local profile only)

| username | password | role |
|---|---|---|
| `admin` | `admin123` | ADMIN - can provision new accounts via `POST /api/admin/users` |
| `alex` / `sarah` / `mike` | `password123` | regular users |

These are seeded only by the backend's `local` dev profile
(`backend/src/main/resources/db/dev-seed/`). A real/`postgres` deployment
starts with an empty `app_user` table - create the first account by hand or
via the admin endpoint once one exists.

## What's implemented

- **Disguise**: the unauthenticated home page is a real, playable Tic-Tac-Toe
  game (choose X/O, difficulty, local scoreboard) with gaming-site chrome
  (a "more games coming soon" teaser grid, neon/glassmorphism visual identity).
  Messaging is invisible until you sign in.
- **Auth**: JWT-based, BCrypt-hashed passwords, no self-registration.
- **Messaging**: real-time send/receive over WebSocket (STOMP), delivered/read
  receipts, typing indicators, online/last-seen presence, message pagination,
  delete-for-me / delete-for-everyone, clear conversation, emoji picker,
  multiline composer with Enter-to-send.
- **Chat list**: WhatsApp-style, with avatar, last message preview, timestamp,
  unread badge, online dot - matches the mock in the product spec.
- **Responsive**: single-pane mobile layout with a back button and bottom nav;
  desktop gets a WhatsApp-style split pane (list + conversation). Safe-area
  insets for notched phones, fixed composer, no horizontal overflow at 390px.
- **Security**: every conversation/message endpoint re-checks server-side that
  the caller is a participant - tested to return 401 (no token), 403 (wrong
  user), and 403 (non-admin hitting the admin endpoint). See
  [backend/README.md](backend/README.md#architecture) for details.
- **Browser notifications**: a native `Notification` fires for new messages
  while the tab is in the background (permission requested on login).

Verified end-to-end with a real Postgres instance and a real browser
(Playwright) during development: login, search, start a conversation, live
two-session message delivery, typing indicator, read receipts, delete/clear,
and mobile viewport rendering all confirmed working with no console errors.

## Design patterns used (backend)

- **Strategy** - `NotificationService` interface (WebSocket is the only
  implementation today; a push-notification strategy could be added without
  touching callers).
- **Repository** - Spring Data JPA repositories are the only thing that talks
  to the database.
- **Mapper** - a generic `Mapper<Entity, Dto>` interface keeps entity/DTO
  conversion in one place per type, so JPA entities never leak into JSON
  responses.
- **Observer/Pub-sub** - `PresenceService` + STOMP's user-destination routing:
  connecting/disconnecting publishes to whichever peers actually share a
  conversation with you.
- **Builder** - Lombok `@Builder` on entities.
- **Chain of responsibility** - `GlobalExceptionHandler`
  (`@RestControllerAdvice`) centralizes exception -> HTTP response mapping so
  controllers stay free of try/catch noise.

## Tech stack

Java 17 · Spring Boot 3.5 (Web, Security, Data JPA, WebSocket, Validation,
Actuator) · PostgreSQL (H2 for zero-setup local dev) · Flyway · JJWT ·
React 19 · TypeScript · Vite · Tailwind CSS 4 · Zustand · react-router ·
@stomp/stompjs.

## Deploying for real

```bash
cp .env.example .env   # set JWT_SECRET, CORS_ALLOWED_ORIGINS
docker compose up --build
```

This runs Postgres + the backend (`postgres` profile). Build and serve
`frontend/` (`npm run build` -> `dist/`) from any static host or reverse
proxy in front of the backend; put the whole thing behind HTTPS.
