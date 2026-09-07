package com.chatapp.backend.controller;

import com.chatapp.backend.dto.AuthResponseDto;
import com.chatapp.backend.dto.CurrentUserDto;
import com.chatapp.backend.dto.LoginRequest;
import com.chatapp.backend.mapper.UserMapper;
import com.chatapp.backend.security.AppUserPrincipal;
import com.chatapp.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserMapper userMapper;

    public AuthController(AuthService authService, UserMapper userMapper) {
        this.authService = authService;
        this.userMapper = userMapper;
    }

    @PostMapping("/login")
    public AuthResponseDto login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public CurrentUserDto me(@AuthenticationPrincipal AppUserPrincipal principal) {
        return userMapper.toCurrentUserDto(principal.getUser());
    }
}
