package com.chatapp.backend.service;

import com.chatapp.backend.dto.MessageDto;
import com.chatapp.backend.dto.ws.ReadReceiptEvent;
import com.chatapp.backend.dto.ws.TypingEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketNotificationService implements NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void notifyNewMessage(String recipientUsername, MessageDto message) {
        messagingTemplate.convertAndSendToUser(recipientUsername, "/queue/messages", message);
    }

    @Override
    public void notifyMessageUpdated(String recipientUsername, MessageDto message) {
        messagingTemplate.convertAndSendToUser(recipientUsername, "/queue/messages.updated", message);
    }

    @Override
    public void notifyTyping(String recipientUsername, TypingEvent event) {
        messagingTemplate.convertAndSendToUser(recipientUsername, "/queue/typing", event);
    }

    @Override
    public void notifyReadReceipt(String recipientUsername, ReadReceiptEvent event) {
        messagingTemplate.convertAndSendToUser(recipientUsername, "/queue/receipts", event);
    }
}
