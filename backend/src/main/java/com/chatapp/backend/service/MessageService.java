package com.chatapp.backend.service;

import com.chatapp.backend.domain.Conversation;
import com.chatapp.backend.domain.DeleteScope;
import com.chatapp.backend.domain.Message;
import com.chatapp.backend.domain.MessageStatus;
import com.chatapp.backend.domain.Role;
import com.chatapp.backend.domain.User;
import com.chatapp.backend.dto.MessageDto;
import com.chatapp.backend.dto.MessagePageDto;
import com.chatapp.backend.exception.ForbiddenActionException;
import com.chatapp.backend.exception.ResourceNotFoundException;
import com.chatapp.backend.mapper.MessageMapper;
import com.chatapp.backend.repository.MessageRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class MessageService {

    private static final int DEFAULT_PAGE_SIZE = 30;
    private static final int MAX_PAGE_SIZE = 100;

    private final MessageRepository messageRepository;
    private final ConversationService conversationService;
    private final PresenceService presenceService;
    private final MessageMapper messageMapper;
    private final NotificationService notificationService;

    public MessageService(MessageRepository messageRepository,
                           ConversationService conversationService,
                           PresenceService presenceService,
                           MessageMapper messageMapper,
                           NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.conversationService = conversationService;
        this.presenceService = presenceService;
        this.messageMapper = messageMapper;
        this.notificationService = notificationService;
    }

    @Transactional
    public MessageDto send(UUID conversationId, UUID senderId, String content) {
        Conversation conversation = conversationService.getForParticipant(conversationId, senderId);
        User sender = conversation.getUserA().getId().equals(senderId) ? conversation.getUserA() : conversation.getUserB();
        User recipient = conversation.otherParticipant(senderId);

        boolean recipientOnline = presenceService.isOnline(recipient.getId());
        Instant now = Instant.now();

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .status(recipientOnline ? MessageStatus.DELIVERED : MessageStatus.SENT)
                .deliveredAt(recipientOnline ? now : null)
                .build();
        message = messageRepository.save(message);

        conversation.setLastMessageAt(message.getCreatedAt());

        MessageDto dto = messageMapper.toDto(message);
        notificationService.notifyNewMessage(recipient.getUsername(), dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public MessagePageDto getPage(UUID conversationId, UUID viewerId, Instant beforeCreatedAt, Integer limit, boolean viewerIsAdmin) {
        conversationService.getForParticipant(conversationId, viewerId);
        int pageSize = Math.min(limit == null || limit <= 0 ? DEFAULT_PAGE_SIZE : limit, MAX_PAGE_SIZE);

        List<Message> page = messageRepository.findVisiblePage(
                conversationId, viewerId, beforeCreatedAt, PageRequest.of(0, pageSize + 1));

        boolean hasMore = page.size() > pageSize;
        List<Message> trimmed = hasMore ? page.subList(0, pageSize) : page;

        List<MessageDto> ascending = trimmed.stream()
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .map(m -> messageMapper.toDto(m, viewerIsAdmin))
                .toList();

        Instant nextCursor = hasMore && !trimmed.isEmpty() ? trimmed.get(trimmed.size() - 1).getCreatedAt() : null;
        return new MessagePageDto(ascending, hasMore, nextCursor);
    }

    @Transactional
    public void delete(UUID messageId, UUID requesterId, DeleteScope scope) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        Conversation conversation = message.getConversation();
        if (!conversation.hasParticipant(requesterId)) {
            throw new ForbiddenActionException("You are not part of this conversation");
        }
        boolean isSender = message.getSender().getId().equals(requesterId);

        if (scope == DeleteScope.EVERYONE) {
            if (!isSender) {
                throw new ForbiddenActionException("Only the sender can delete a message for everyone");
            }
            message.setDeletedForEveryone(true);
        } else if (isSender) {
            message.setDeletedForSender(true);
        } else {
            message.setDeletedForReceiver(true);
        }
        messageRepository.save(message);

        if (scope == DeleteScope.EVERYONE) {
            User recipient = conversation.otherParticipant(requesterId);
            boolean recipientIsAdmin = recipient.getRole() == Role.ADMIN;
            notificationService.notifyMessageUpdated(recipient.getUsername(), messageMapper.toDto(message, recipientIsAdmin));
        }
    }
}
