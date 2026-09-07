package com.chatapp.backend.websocket;

import com.chatapp.backend.domain.User;
import com.chatapp.backend.dto.MessageDto;
import com.chatapp.backend.dto.ws.ConversationRefEvent;
import com.chatapp.backend.dto.ws.SendMessageEvent;
import com.chatapp.backend.dto.ws.TypingEvent;
import com.chatapp.backend.exception.ApiException;
import com.chatapp.backend.service.ConversationService;
import com.chatapp.backend.service.MessageService;
import com.chatapp.backend.service.NotificationService;
import com.chatapp.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * Handles inbound STOMP application messages sent to /app/**. Persistence and
 * cross-user notification is delegated to the same services the REST controllers use,
 * so behavior (authorization, delivery/read rules) stays identical across both transports.
 */
@Controller
public class ChatWebSocketController {

    private final MessageService messageService;
    private final ConversationService conversationService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(MessageService messageService,
                                    ConversationService conversationService,
                                    UserService userService,
                                    NotificationService notificationService,
                                    SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.conversationService = conversationService;
        this.userService = userService;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void send(@Valid @Payload SendMessageEvent event, Principal principal) {
        User sender = userService.getByUsername(principal.getName());
        MessageDto dto = messageService.send(event.conversationId(), sender.getId(), event.content());
        // Echo the canonical, server-assigned message back to the sender's own session(s).
        notificationService.notifyNewMessage(sender.getUsername(), dto);
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingEvent event, Principal principal) {
        User sender = userService.getByUsername(principal.getName());
        conversationService.notifyTyping(event.conversationId(), sender.getId(), event.typing());
    }

    @MessageMapping("/chat.read")
    public void read(@Payload ConversationRefEvent event, Principal principal) {
        User reader = userService.getByUsername(principal.getName());
        conversationService.markRead(event.conversationId(), reader.getId());
    }

    @MessageExceptionHandler(ApiException.class)
    public void handleApiException(ApiException ex, Principal principal) {
        if (principal != null) {
            messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/errors", ex.getMessage());
        }
    }
}
