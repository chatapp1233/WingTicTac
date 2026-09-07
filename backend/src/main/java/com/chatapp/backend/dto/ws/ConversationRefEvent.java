package com.chatapp.backend.dto.ws;

import java.util.UUID;

/** Inbound payload for STOMP destination /app/chat.read */
public record ConversationRefEvent(UUID conversationId) {
}
