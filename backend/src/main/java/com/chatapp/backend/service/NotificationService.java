package com.chatapp.backend.service;

import com.chatapp.backend.dto.MessageDto;
import com.chatapp.backend.dto.ws.ReadReceiptEvent;
import com.chatapp.backend.dto.ws.TypingEvent;

/**
 * Strategy for pushing real-time events to a specific user. The default (and only,
 * for now) implementation delivers over the STOMP/WebSocket connection; a future
 * strategy (e.g. Web Push / FCM for section 12's browser notifications) can be added
 * and swapped in without touching callers.
 */
public interface NotificationService {

    void notifyNewMessage(String recipientUsername, MessageDto message);

    void notifyMessageUpdated(String recipientUsername, MessageDto message);

    void notifyTyping(String recipientUsername, TypingEvent event);

    void notifyReadReceipt(String recipientUsername, ReadReceiptEvent event);
}
