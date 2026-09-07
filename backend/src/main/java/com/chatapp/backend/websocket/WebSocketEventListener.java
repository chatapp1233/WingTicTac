package com.chatapp.backend.websocket;

import com.chatapp.backend.domain.User;
import com.chatapp.backend.service.ConversationService;
import com.chatapp.backend.service.PresenceService;
import com.chatapp.backend.service.UserService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Optional;

/**
 * Bridges raw WebSocket lifecycle events to {@link PresenceService}, notifying only the
 * users who actually share a conversation with the connecting/disconnecting user. The
 * actual conversation lookup happens inside {@link ConversationService}, which owns the
 * transaction boundary needed to safely read the lazily-loaded participant usernames.
 */
@Component
public class WebSocketEventListener {

    private final PresenceService presenceService;
    private final UserService userService;
    private final ConversationService conversationService;

    public WebSocketEventListener(PresenceService presenceService, UserService userService, ConversationService conversationService) {
        this.presenceService = presenceService;
        this.userService = userService;
        this.conversationService = conversationService;
    }

    @EventListener
    public void handleConnected(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        resolveUsername(accessor).ifPresent(username -> {
            User user = userService.getByUsername(username);
            presenceService.markOnline(user.getId());
            conversationService.broadcastPresenceChange(user.getId(), true, user.getLastSeenAt());
        });
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        resolveUsername(accessor).ifPresent(username -> {
            User user = userService.getByUsername(username);
            presenceService.markOffline(user.getId());
            userService.touchLastSeen(user.getId());
            User refreshed = userService.getByUsername(username);
            conversationService.broadcastPresenceChange(refreshed.getId(), false, refreshed.getLastSeenAt());
        });
    }

    private Optional<String> resolveUsername(StompHeaderAccessor accessor) {
        return accessor.getUser() == null ? Optional.empty() : Optional.ofNullable(accessor.getUser().getName());
    }
}
