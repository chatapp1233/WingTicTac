package com.chatapp.backend.controller;

import com.chatapp.backend.domain.User;
import com.chatapp.backend.dto.CreateUserRequest;
import com.chatapp.backend.dto.UserSummaryDto;
import com.chatapp.backend.mapper.UserMapper;
import com.chatapp.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * There is no public sign-up flow by design (see product spec section 2). Accounts are
 * provisioned out of band by an administrator, either directly in the database or through
 * this endpoint, which is restricted to ROLE_ADMIN by {@code SecurityConfig}.
 */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public AdminUserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserSummaryDto create(@Valid @RequestBody CreateUserRequest request) {
        User user = userService.createUser(request);
        return userMapper.toDto(user);
    }
}
