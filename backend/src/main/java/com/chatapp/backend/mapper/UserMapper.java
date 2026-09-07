package com.chatapp.backend.mapper;

import com.chatapp.backend.domain.User;
import com.chatapp.backend.dto.CurrentUserDto;
import com.chatapp.backend.dto.UserSummaryDto;
import com.chatapp.backend.service.PresenceService;
import org.springframework.stereotype.Component;

@Component
public class UserMapper implements Mapper<User, UserSummaryDto> {

    private final PresenceService presenceService;

    public UserMapper(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    @Override
    public UserSummaryDto toDto(User entity) {
        boolean online = presenceService.isOnline(entity.getId());
        return new UserSummaryDto(
                entity.getId(),
                entity.getUsername(),
                entity.getDisplayName(),
                entity.getAvatarUrl(),
                online,
                entity.getLastSeenAt()
        );
    }

    /** Used only for /api/auth/login and /api/auth/me - see {@link CurrentUserDto}. */
    public CurrentUserDto toCurrentUserDto(User entity) {
        boolean online = presenceService.isOnline(entity.getId());
        return new CurrentUserDto(
                entity.getId(),
                entity.getUsername(),
                entity.getDisplayName(),
                entity.getAvatarUrl(),
                online,
                entity.getLastSeenAt(),
                entity.getRole()
        );
    }
}
