package com.chatapp.backend.dto;

import com.chatapp.backend.domain.MessageStatus;

import java.time.Instant;
import java.util.UUID;

public record MessageDto(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String content,
        MessageStatus status,
        boolean deletedForEveryone,
        // True only when this viewer is an admin and is seeing the real content of a
        // deleted-for-everyone message rather than the tombstone - see MessageMapper.
        boolean adminRevealed,
        Instant createdAt,
        Instant deliveredAt,
        Instant readAt
) {
}
