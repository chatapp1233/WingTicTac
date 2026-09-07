package com.chatapp.backend.service;

import com.chatapp.backend.dto.ws.PresenceEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks which users currently have a live WebSocket session (Subject in the
 * Observer pattern) and pushes presence changes to interested peers, i.e. the
 * users who share a conversation with the affected user.
 */
@Service
public class PresenceService {

    private final Set<UUID> onlineUserIds = ConcurrentHashMap.newKeySet();
    private final SimpMessagingTemplate messagingTemplate;

    public PresenceService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public boolean isOnline(UUID userId) {
        return userId != null && onlineUserIds.contains(userId);
    }

    public void markOnline(UUID userId) {
        onlineUserIds.add(userId);
    }

    public void markOffline(UUID userId) {
        onlineUserIds.remove(userId);
    }

    /** Notifies a single peer (by username, per Spring's user-destination routing) of a presence change. */
    public void notifyPeer(String peerUsername, UUID subjectUserId, boolean online, Instant lastSeenAt) {
        messagingTemplate.convertAndSendToUser(peerUsername, "/queue/presence",
                new PresenceEvent(subjectUserId, online, lastSeenAt));
    }
}
