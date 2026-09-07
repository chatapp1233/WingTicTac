package com.chatapp.backend.dto.ws;

import java.time.Instant;
import java.util.UUID;

/** Outbound payload for STOMP destination /user/queue/presence */
public record PresenceEvent(
        UUID userId,
        boolean online,
        Instant lastSeenAt
) {
}
