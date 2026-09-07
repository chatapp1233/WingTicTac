package com.chatapp.backend.dto;

import java.time.Instant;

public record AuthResponseDto(
        String token,
        Instant expiresAt,
        CurrentUserDto user
) {
}
