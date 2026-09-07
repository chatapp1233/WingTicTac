package com.chatapp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Payload used by an administrator to provision a new account (see AdminUserController). */
public record CreateUserRequest(
        @NotBlank @Pattern(regexp = "^[a-zA-Z0-9_.]{3,32}$", message = "3-32 chars: letters, numbers, underscore, dot") String username,
        @NotBlank @Size(min = 1, max = 64) String displayName,
        String avatarUrl,
        @NotBlank @Size(min = 8, max = 128) String password
) {
}
