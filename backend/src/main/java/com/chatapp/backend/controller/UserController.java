package com.chatapp.backend.controller;

import com.chatapp.backend.dto.UserSummaryDto;
import com.chatapp.backend.security.AppUserPrincipal;
import com.chatapp.backend.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/search")
    public List<UserSummaryDto> search(@RequestParam("q") String query, @AuthenticationPrincipal AppUserPrincipal principal) {
        return userService.search(query, principal.getId());
    }
}
