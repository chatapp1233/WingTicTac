package com.chatapp.backend.controller;

import com.chatapp.backend.domain.Conversation;
import com.chatapp.backend.dto.ConversationSummaryDto;
import com.chatapp.backend.dto.MessagePageDto;
import com.chatapp.backend.dto.StartConversationRequest;
import com.chatapp.backend.security.AppUserPrincipal;
import com.chatapp.backend.service.ConversationService;
import com.chatapp.backend.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;
    private final MessageService messageService;

    public ConversationController(ConversationService conversationService, MessageService messageService) {
        this.conversationService = conversationService;
        this.messageService = messageService;
    }

    @GetMapping
    public List<ConversationSummaryDto> list(@AuthenticationPrincipal AppUserPrincipal principal) {
        return conversationService.listForUser(principal.getId(), principal.isAdmin());
    }

    @PostMapping
    public ConversationSummaryDto start(@Valid @RequestBody StartConversationRequest request,
                                         @AuthenticationPrincipal AppUserPrincipal principal) {
        Conversation conversation = conversationService.getOrCreateWithUsername(principal.getId(), request.username());
        return conversationService.getSummary(conversation.getId(), principal.getId(), principal.isAdmin());
    }

    @GetMapping("/{id}/messages")
    public MessagePageDto messages(@PathVariable("id") UUID conversationId,
                                    @RequestParam(value = "before", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant before,
                                    @RequestParam(value = "limit", required = false) Integer limit,
                                    @AuthenticationPrincipal AppUserPrincipal principal) {
        return messageService.getPage(conversationId, principal.getId(), before, limit, principal.isAdmin());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable("id") UUID conversationId, @AuthenticationPrincipal AppUserPrincipal principal) {
        conversationService.markRead(conversationId, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> clear(@PathVariable("id") UUID conversationId, @AuthenticationPrincipal AppUserPrincipal principal) {
        conversationService.clearForUser(conversationId, principal.getId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
