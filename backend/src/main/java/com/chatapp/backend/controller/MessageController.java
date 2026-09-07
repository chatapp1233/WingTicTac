package com.chatapp.backend.controller;

import com.chatapp.backend.domain.DeleteScope;
import com.chatapp.backend.security.AppUserPrincipal;
import com.chatapp.backend.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID messageId,
                                        @RequestParam(value = "scope", defaultValue = "ME") DeleteScope scope,
                                        @AuthenticationPrincipal AppUserPrincipal principal) {
        messageService.delete(messageId, principal.getId(), scope);
        return ResponseEntity.noContent().build();
    }
}
