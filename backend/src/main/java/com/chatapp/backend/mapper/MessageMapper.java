package com.chatapp.backend.mapper;

import com.chatapp.backend.domain.Message;
import com.chatapp.backend.dto.MessageDto;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper implements Mapper<Message, MessageDto> {

    private static final String TOMBSTONE_TEXT = "This message was deleted";

    /** Non-admin mapping (masks deleted-for-everyone content) - satisfies the generic {@link Mapper} contract. */
    @Override
    public MessageDto toDto(Message entity) {
        return toDto(entity, false);
    }

    /**
     * @param viewerIsAdmin when true and the message was deleted for everyone, the real content
     *                      is returned (with {@code adminRevealed=true}) instead of the tombstone -
     *                      an administrator who's a participant in the conversation can still see
     *                      what was deleted, invisibly to the other participant.
     */
    public MessageDto toDto(Message entity, boolean viewerIsAdmin) {
        boolean deleted = entity.isDeletedForEveryone();
        boolean reveal = deleted && viewerIsAdmin;
        String content = deleted && !reveal ? TOMBSTONE_TEXT : entity.getContent();
        return new MessageDto(
                entity.getId(),
                entity.getConversation().getId(),
                entity.getSender().getId(),
                content,
                entity.getStatus(),
                deleted,
                reveal,
                entity.getCreatedAt(),
                entity.getDeliveredAt(),
                entity.getReadAt()
        );
    }
}
