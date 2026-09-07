package com.chatapp.backend.repository;

import com.chatapp.backend.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("""
            select c from Conversation c
            where (c.userA.id = :userAId and c.userB.id = :userBId)
               or (c.userA.id = :userBId and c.userB.id = :userAId)
            """)
    Optional<Conversation> findBetween(@Param("userAId") UUID userAId, @Param("userBId") UUID userBId);

    @Query("""
            select c from Conversation c
            where c.userA.id = :userId or c.userB.id = :userId
            order by coalesce(c.lastMessageAt, c.createdAt) desc
            """)
    List<Conversation> findAllForUser(@Param("userId") UUID userId);
}
