package com.chatapp.backend.dto.ws;

import java.time.Instant;
import java.util.UUID;

/** Outbound payload for STOMP destination /user/queue/receipts */
public record ReadReceiptEvent(
        UUID conversationId,
        UUID readerId,
        Instant readAt
) {
}
