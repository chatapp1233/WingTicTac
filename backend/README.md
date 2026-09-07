# backend

Spring Boot API + WebSocket server for **WingTicTac** - see the [repo root README](../README.md) for the full picture.

## Running

Zero setup required for local development - the default `local` profile uses a
file-based H2 database (in PostgreSQL compatibility mode) at `./data/chatapp`,
seeded with demo accounts.

```bash
./mvnw spring-boot:run
# or: mvn spring-boot:run
```

Server starts on `http://localhost:8080`. Health check: `GET /actuator/health`.

### Running against real PostgreSQL

```bash
export SPRING_PROFILES_ACTIVE=postgres
export DATABASE_URL=jdbc:postgresql://localhost:5432/chatapp
export DATABASE_USERNAME=chatapp
export DATABASE_PASSWORD=chatapp
export JWT_SECRET=$(openssl rand -base64 48)
mvn spring-boot:run
```

Or use the root `docker-compose.yml`, which wires this up automatically.

Note: the `postgres` profile does **not** load the demo-account seed data (see
"No public sign-up" below) - insert your first admin account by hand, or run
locally against `local` first and copy the row.

## Architecture

- **Auth**: JWT (HS256), issued at `/api/auth/login`, validated by
  `JwtAuthenticationFilter` for REST and `WebSocketAuthChannelInterceptor` for
  STOMP CONNECT frames. Passwords hashed with BCrypt.
- **No public sign-up**: accounts are provisioned by an administrator, either
  directly in the database or via `POST /api/admin/users` (requires
  `ROLE_ADMIN`). See `db/dev-seed/V2__seed_demo_users.sql` for how the local
  demo accounts are seeded - the `postgres` profile intentionally does **not**
  load that location.
- **Real-time**: STOMP over a raw WebSocket at `/ws`. `ChatWebSocketController`
  handles `/app/chat.send`, `/app/chat.typing`, `/app/chat.read`;
  `NotificationService` (a Strategy - the WebSocket implementation is the only
  one today, but the interface leaves room for e.g. a push-notification
  strategy later) pushes to `/user/queue/{messages,typing,receipts,presence}`.
  `PresenceService` tracks who's online and, combined with
  `WebSocketEventListener`, notifies only the users who actually share a
  conversation with whoever just connected/disconnected.
- **Authorization**: every conversation/message operation re-checks that the
  caller is a participant (`ConversationService.getForParticipant`) - the
  frontend's own checks are not trusted.
- **Migrations**: Flyway, plain ANSI SQL so the same scripts run unmodified on
  H2 and Postgres (`db/migration/`). Dev-only seed data lives in a separate
  `db/dev-seed/` location, only added to `spring.flyway.locations` by the
  `local` profile.
- **Mapping**: entity -> DTO conversion goes through small `Mapper` classes,
  not exposed JPA entities, so the API shape is decoupled from the schema.
- **Admin audit visibility on delete-for-everyone**: when a message is deleted
  for everyone, an admin who's a participant in that conversation still sees
  the real content (`MessageDto.adminRevealed=true`) - the other participant
  gets the normal tombstone, with no indication anyone else can still see it.
  Scoped entirely by `MessageMapper`/`MessageService`/`ConversationService`
  taking a `viewerIsAdmin` flag (sourced from `AppUserPrincipal.isAdmin()`) -
  it does not grant admins access to conversations they aren't part of; that
  stays gated by `getForParticipant` like everything else. `CurrentUserDto`
  (only for `/api/auth/login` and `/api/auth/me`) is the one place a user's
  own role is exposed - `UserSummaryDto` (search results, conversation
  partners) deliberately omits it so admin status isn't visible to others.

## API summary

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | current user |
| GET | `/api/users/search?q=` | prefix match on username, excludes self |
| GET | `/api/conversations` | list with last message + unread count |
| POST | `/api/conversations` | `{username}` - get-or-create |
| GET | `/api/conversations/{id}/messages?before=&limit=` | keyset pagination |
| POST | `/api/conversations/{id}/read` | mark all as read |
| DELETE | `/api/conversations/{id}` | clear for the caller only |
| DELETE | `/api/messages/{id}?scope=ME\|EVERYONE` | `EVERYONE` requires being the sender |
| POST | `/api/admin/users` | `ROLE_ADMIN` only - provision an account |

WebSocket (`/ws`, STOMP, `Authorization: Bearer <token>` on CONNECT):

| Client sends | Server pushes to |
|---|---|
| `/app/chat.send` | `/user/queue/messages` |
| `/app/chat.typing` | `/user/queue/typing` |
| `/app/chat.read` | `/user/queue/receipts` |
| - | `/user/queue/presence` (on connect/disconnect) |
| - | `/user/queue/messages.updated` (delete-for-everyone) |

## Tests

```bash
mvn test
```
