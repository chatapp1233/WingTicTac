package com.chatapp.backend.service;

import com.chatapp.backend.domain.User;
import com.chatapp.backend.dto.AuthResponseDto;
import com.chatapp.backend.dto.LoginRequest;
import com.chatapp.backend.mapper.UserMapper;
import com.chatapp.backend.security.AppUserPrincipal;
import com.chatapp.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final UserService userService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService, UserMapper userMapper, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
        this.userService = userService;
    }

    @Transactional
    public AuthResponseDto login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        AppUserPrincipal principal = (AppUserPrincipal) authentication.getPrincipal();
        User user = principal.getUser();

        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        userService.touchLastSeen(user.getId());

        return new AuthResponseDto(token, jwtService.expiryFor(token), userMapper.toCurrentUserDto(user));
    }
}
