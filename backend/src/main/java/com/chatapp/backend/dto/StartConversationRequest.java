package com.chatapp.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record StartConversationRequest(
        @NotBlank String username
) {
}
