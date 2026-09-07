package com.chatapp.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "message", indexes = {
        @Index(name = "idx_message_conversation_created", columnList = "conversation_id,created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "deleted_for_sender", nullable = false)
    @Builder.Default
    private boolean deletedForSender = false;

    @Column(name = "deleted_for_receiver", nullable = false)
    @Builder.Default
    private boolean deletedForReceiver = false;

    @Column(name = "deleted_for_everyone", nullable = false)
    @Builder.Default
    private boolean deletedForEveryone = false;

    public boolean isVisibleTo(UUID viewerId) {
        boolean isSender = sender.getId().equals(viewerId);
        if (deletedForEveryone) {
            return true; // shown as a tombstone, not hidden entirely
        }
        return isSender ? !deletedForSender : !deletedForReceiver;
    }
}
