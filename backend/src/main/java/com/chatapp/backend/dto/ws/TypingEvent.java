package com.chatapp.backend.dto.ws;

import java.util.UUID;

/** Bidirectional payload for STOMP destination /app/chat.typing and /user/queue/typing */
public record TypingEvent(
        UUID conversationId,
        UUID fromUserId,
        boolean typing
) {
}
