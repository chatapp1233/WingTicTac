package com.chatapp.backend.service;

import com.chatapp.backend.domain.Conversation;
import com.chatapp.backend.domain.User;
import com.chatapp.backend.dto.ConversationSummaryDto;
import com.chatapp.backend.dto.MessageDto;
import com.chatapp.backend.dto.ws.ReadReceiptEvent;
import com.chatapp.backend.dto.ws.TypingEvent;
import com.chatapp.backend.exception.ConflictException;
import com.chatapp.backend.exception.ForbiddenActionException;
import com.chatapp.backend.exception.ResourceNotFoundException;
import com.chatapp.backend.mapper.ConversationMapper;
import com.chatapp.backend.mapper.MessageMapper;
import com.chatapp.backend.repository.ConversationRepository;
import com.chatapp.backend.repository.MessageRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final ConversationMapper conversationMapper;
    private final MessageMapper messageMapper;
    private final NotificationService notificationService;
    private final PresenceService presenceService;

    public ConversationService(ConversationRepository conversationRepository,
                                MessageRepository messageRepository,
                                UserService userService,
                                ConversationMapper conversationMapper,
                                MessageMapper messageMapper,
                                NotificationService notificationService,
                                PresenceService presenceService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userService = userService;
        this.conversationMapper = conversationMapper;
        this.messageMapper = messageMapper;
        this.notificationService = notificationService;
        this.presenceService = presenceService;
    }

    @Transactional
    public Conversation getOrCreateWithUsername(UUID currentUserId, String otherUsername) {
        User other = userService.getByUsername(otherUsername);
        if (other.getId().equals(currentUserId)) {
            throw new ConflictException("You can't start a conversation with yourself");
        }
        return conversationRepository.findBetween(currentUserId, other.getId())
                .orElseGet(() -> createConversation(userService.getById(currentUserId), other));
    }

    private Conversation createConversation(User current, User other) {
        boolean currentIsA = current.getId().compareTo(other.getId()) < 0;
        Conversation conversation = Conversation.builder()
                .userA(currentIsA ? current : other)
                .userB(currentIsA ? other : current)
                .build();
        try {
            return conversationRepository.save(conversation);
        } catch (DataIntegrityViolationException raceLost) {
            // Another request created the same pair concurrently - fall back to it.
            return conversationRepository.findBetween(current.getId(), other.getId())
                    .orElseThrow(() -> raceLost);
        }
    }

    @Transactional(readOnly = true)
    public Conversation getForParticipant(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (!conversation.hasParticipant(userId)) {
            throw new ForbiddenActionException("You are not part of this conversation");
        }
        return conversation;
    }

    @Transactional(readOnly = true)
    public List<ConversationSummaryDto> listForUser(UUID userId, boolean viewerIsAdmin) {
        return conversationRepository.findAllForUser(userId).stream()
                .map(conversation -> toSummary(conversation, userId, viewerIsAdmin))
                .sorted((a, b) -> b.updatedAt().compareTo(a.updatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public ConversationSummaryDto getSummary(UUID conversationId, UUID userId, boolean viewerIsAdmin) {
        return toSummary(getForParticipant(conversationId, userId), userId, viewerIsAdmin);
    }

    private ConversationSummaryDto toSummary(Conversation conversation, UUID userId, boolean viewerIsAdmin) {
        MessageDto lastMessage = messageRepository.findLatestVisible(conversation.getId(), userId)
                .map(m -> messageMapper.toDto(m, viewerIsAdmin))
                .orElse(null);
        long unread = messageRepository.countUnread(conversation.getId(), userId);
        return conversationMapper.toSummaryDto(conversation, userId, lastMessage, unread);
    }

    @Transactional
    public void clearForUser(UUID conversationId, UUID userId) {
        Conversation conversation = getForParticipant(conversationId, userId);
        messageRepository.softDeleteSentByUserInConversation(conversation.getId(), userId);
        messageRepository.softDeleteReceivedByUserInConversation(conversation.getId(), userId);
    }

    @Transactional
    public void markRead(UUID conversationId, UUID readerId) {
        Conversation conversation = getForParticipant(conversationId, readerId);
        Instant now = Instant.now();
        int updated = messageRepository.markConversationRead(conversation.getId(), readerId, now);
        if (updated > 0) {
            User sender = conversation.otherParticipant(readerId);
            notificationService.notifyReadReceipt(sender.getUsername(), new ReadReceiptEvent(conversation.getId(), readerId, now));
        }
    }

    @Transactional
    public int markDelivered(UUID conversationId, UUID recipientId) {
        return messageRepository.markConversationDelivered(conversationId, recipientId, Instant.now());
    }

    /**
     * Resolves the conversation and pushes a typing event to the other participant, entirely
     * within one transaction - the {@code User} entities behind {@link Conversation#otherParticipant}
     * are lazy, so they must be touched before the Hibernate session backing this call closes.
     */
    @Transactional(readOnly = true)
    public void notifyTyping(UUID conversationId, UUID senderId, boolean typing) {
        Conversation conversation = getForParticipant(conversationId, senderId);
        User recipient = conversation.otherParticipant(senderId);
        notificationService.notifyTyping(recipient.getUsername(), new TypingEvent(conversationId, senderId, typing));
    }

    /** Notifies every conversation partner of {@code userId} that their online/last-seen status changed. */
    @Transactional(readOnly = true)
    public void broadcastPresenceChange(UUID userId, boolean online, Instant lastSeenAt) {
        for (Conversation conversation : conversationRepository.findAllForUser(userId)) {
            User peer = conversation.otherParticipant(userId);
            presenceService.notifyPeer(peer.getUsername(), userId, online, lastSeenAt);
        }
    }
}
