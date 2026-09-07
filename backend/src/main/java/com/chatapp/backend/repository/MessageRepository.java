package com.chatapp.backend.repository;

import com.chatapp.backend.domain.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    // Postgres can't infer the parameter type for a nullable "?  is null or ..." predicate,
    // so the cursor-present and cursor-absent cases are two separate queries rather than one
    // with an optional parameter.
    @Query("""
            select m from Message m
            where m.conversation.id = :conversationId
              and ((m.sender.id = :viewerId and m.deletedForSender = false)
                or (m.sender.id <> :viewerId and m.deletedForReceiver = false))
            order by m.createdAt desc
            """)
    List<Message> findVisibleFirstPage(
            @Param("conversationId") UUID conversationId,
            @Param("viewerId") UUID viewerId,
            Pageable pageable);

    @Query("""
            select m from Message m
            where m.conversation.id = :conversationId
              and ((m.sender.id = :viewerId and m.deletedForSender = false)
                or (m.sender.id <> :viewerId and m.deletedForReceiver = false))
              and m.createdAt < :beforeCreatedAt
            order by m.createdAt desc
            """)
    List<Message> findVisiblePageBefore(
            @Param("conversationId") UUID conversationId,
            @Param("viewerId") UUID viewerId,
            @Param("beforeCreatedAt") Instant beforeCreatedAt,
            Pageable pageable);

    default List<Message> findVisiblePage(UUID conversationId, UUID viewerId, Instant beforeCreatedAt, Pageable pageable) {
        return beforeCreatedAt == null
                ? findVisibleFirstPage(conversationId, viewerId, pageable)
                : findVisiblePageBefore(conversationId, viewerId, beforeCreatedAt, pageable);
    }

    @Query("""
            select m from Message m
            where m.conversation.id = :conversationId
              and ((m.sender.id = :viewerId and m.deletedForSender = false)
                or (m.sender.id <> :viewerId and m.deletedForReceiver = false))
            order by m.createdAt desc
            """)
    List<Message> findLatestVisible(@Param("conversationId") UUID conversationId, @Param("viewerId") UUID viewerId, Pageable pageable);

    default Optional<Message> findLatestVisible(UUID conversationId, UUID viewerId) {
        return findLatestVisible(conversationId, viewerId, Pageable.ofSize(1)).stream().findFirst();
    }

    @Query("""
            select count(m) from Message m
            where m.conversation.id = :conversationId
              and m.sender.id <> :viewerId
              and m.status <> com.chatapp.backend.domain.MessageStatus.READ
              and m.deletedForReceiver = false
            """)
    long countUnread(@Param("conversationId") UUID conversationId, @Param("viewerId") UUID viewerId);

    @Modifying
    @Query("""
            update Message m set m.status = com.chatapp.backend.domain.MessageStatus.DELIVERED, m.deliveredAt = :now
            where m.conversation.id = :conversationId
              and m.sender.id <> :recipientId
              and m.status = com.chatapp.backend.domain.MessageStatus.SENT
            """)
    int markConversationDelivered(@Param("conversationId") UUID conversationId, @Param("recipientId") UUID recipientId, @Param("now") Instant now);

    @Modifying
    @Query("""
            update Message m set m.status = com.chatapp.backend.domain.MessageStatus.READ, m.readAt = :now,
                m.deliveredAt = coalesce(m.deliveredAt, :now)
            where m.conversation.id = :conversationId
              and m.sender.id <> :readerId
              and m.status <> com.chatapp.backend.domain.MessageStatus.READ
            """)
    int markConversationRead(@Param("conversationId") UUID conversationId, @Param("readerId") UUID readerId, @Param("now") Instant now);

    @Modifying
    @Query("update Message m set m.deletedForSender = true where m.conversation.id = :conversationId and m.sender.id = :userId")
    void softDeleteSentByUserInConversation(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);

    @Modifying
    @Query("update Message m set m.deletedForReceiver = true where m.conversation.id = :conversationId and m.sender.id <> :userId")
    void softDeleteReceivedByUserInConversation(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);
}
