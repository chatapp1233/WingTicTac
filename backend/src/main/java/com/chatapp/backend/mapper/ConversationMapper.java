package com.chatapp.backend.mapper;

import com.chatapp.backend.domain.Conversation;
import com.chatapp.backend.dto.ConversationSummaryDto;
import com.chatapp.backend.dto.MessageDto;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

/**
 * Builds the viewer-scoped {@link ConversationSummaryDto}. Deliberately not a plain
 * {@link Mapper} - "other participant", "unread count" and "last message" are all
 * relative to whoever is asking, so the mapping needs that extra context.
 */
@Component
public class ConversationMapper {

    private final UserMapper userMapper;

    public ConversationMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public ConversationSummaryDto toSummaryDto(Conversation conversation, UUID viewerId, MessageDto lastMessage, long unreadCount) {
        Instant updatedAt = conversation.getLastMessageAt() != null ? conversation.getLastMessageAt() : conversation.getCreatedAt();
        return new ConversationSummaryDto(
                conversation.getId(),
                userMapper.toDto(conversation.otherParticipant(viewerId)),
                lastMessage,
                unreadCount,
                updatedAt
        );
    }
}
