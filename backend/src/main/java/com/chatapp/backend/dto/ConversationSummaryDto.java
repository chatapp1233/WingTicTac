package com.chatapp.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record ConversationSummaryDto(
        UUID id,
        UserSummaryDto otherUser,
        MessageDto lastMessage,
        long unreadCount,
        Instant updatedAt
) {
}
