package com.chatapp.backend.dto;

import java.time.Instant;
import java.util.List;

public record MessagePageDto(
        List<MessageDto> items,
        boolean hasMore,
        Instant nextBeforeCreatedAt
) {
}
