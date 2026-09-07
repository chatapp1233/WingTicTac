package com.chatapp.backend.service;

import com.chatapp.backend.domain.Role;
import com.chatapp.backend.domain.User;
import com.chatapp.backend.dto.CreateUserRequest;
import com.chatapp.backend.dto.UserSummaryDto;
import com.chatapp.backend.exception.ConflictException;
import com.chatapp.backend.exception.ResourceNotFoundException;
import com.chatapp.backend.mapper.UserMapper;
import com.chatapp.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private static final int SEARCH_RESULT_LIMIT = 20;

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public User getByUsername(String username) {
        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with username @" + username));
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> search(String rawQuery, UUID requesterId) {
        String query = rawQuery == null ? "" : rawQuery.trim().replaceFirst("^@", "");
        if (query.isEmpty()) {
            return List.of();
        }
        return userRepository.searchByUsernamePrefix(query, requesterId).stream()
                .limit(SEARCH_RESULT_LIMIT)
                .map(userMapper::toDto)
                .toList();
    }

    @Transactional
    public void touchLastSeen(UUID userId) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setLastSeenAt(Instant.now());
            userRepository.save(u);
        });
    }

    @Transactional
    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new ConflictException("Username @" + request.username() + " is already taken");
        }
        User user = User.builder()
                .username(request.username())
                .displayName(request.displayName())
                .avatarUrl(request.avatarUrl())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .active(true)
                .build();
        return userRepository.save(user);
    }
}
