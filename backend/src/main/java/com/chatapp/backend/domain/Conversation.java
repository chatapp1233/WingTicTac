package com.chatapp.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * A private one-to-one conversation between exactly two users.
 * {@code userA} is always the lexicographically/UUID-smaller participant so a
 * (userA, userB) pair is unique regardless of who started the conversation -
 * this lets us enforce "one conversation per pair" with a DB unique constraint.
 */
@Entity
@Table(
        name = "conversation",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_a_id", "user_b_id"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_a_id", nullable = false)
    private User userA;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_b_id", nullable = false)
    private User userB;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    public boolean hasParticipant(UUID userId) {
        return userA.getId().equals(userId) || userB.getId().equals(userId);
    }

    public User otherParticipant(UUID userId) {
        return userA.getId().equals(userId) ? userB : userA;
    }
}
