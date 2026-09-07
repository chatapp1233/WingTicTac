package com.chatapp.backend.dto.ws;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/** Inbound payload for STOMP destination /app/chat.send */
public record SendMessageEvent(
        @NotNull UUID conversationId,
        @NotBlank String content
) {
}
