package com.chatapp.backend.dto;

import com.chatapp.backend.domain.Role;

import java.time.Instant;
import java.util.UUID;

/**
 * Like {@link UserSummaryDto} but includes the caller's own role - returned only by
 * /api/auth/login and /api/auth/me, which always describe the caller themselves.
 * UserSummaryDto (used for search results and conversation partners) deliberately omits
 * role so a user's admin status isn't exposed to the people they chat with.
 */
public record CurrentUserDto(
        UUID id,
        String username,
        String displayName,
        String avatarUrl,
        boolean online,
        Instant lastSeenAt,
        Role role
) {
}
