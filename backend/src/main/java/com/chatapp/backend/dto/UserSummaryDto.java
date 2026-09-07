package com.chatapp.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record UserSummaryDto(
        UUID id,
        String username,
        String displayName,
        String avatarUrl,
        boolean online,
        Instant lastSeenAt
) {
}
