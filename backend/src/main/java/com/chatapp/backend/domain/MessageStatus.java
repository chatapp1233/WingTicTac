package com.chatapp.backend.domain;

/**
 * Ordered lifecycle of a message. Ordinal order matters for
 * {@link #isAtLeast(MessageStatus)} comparisons (SENT &lt; DELIVERED &lt; READ).
 */
public enum MessageStatus {
    SENT,
    DELIVERED,
    READ;

    public boolean isAtLeast(MessageStatus other) {
        return this.ordinal() >= other.ordinal();
    }
}
