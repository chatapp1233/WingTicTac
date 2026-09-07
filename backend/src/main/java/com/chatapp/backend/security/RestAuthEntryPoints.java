package com.chatapp.backend.security;

import com.chatapp.backend.dto.ApiErrorDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

/**
 * Ensures unauthenticated requests get 401 (not Spring Security's 403-by-default) and
 * authenticated-but-forbidden requests get 403, both as the same JSON shape the rest of
 * the API uses ({@link com.chatapp.backend.exception.GlobalExceptionHandler}'s ApiErrorDto)
 * so frontend error handling doesn't need a special case for auth failures.
 */
@Component
public class RestAuthEntryPoints implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public RestAuthEntryPoints(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(jakarta.servlet.http.HttpServletRequest request, HttpServletResponse response,
                          org.springframework.security.core.AuthenticationException authException) throws IOException {
        write(response, HttpStatus.UNAUTHORIZED, "Authentication is required to access this resource");
    }

    @Override
    public void handle(jakarta.servlet.http.HttpServletRequest request, HttpServletResponse response,
                        org.springframework.security.access.AccessDeniedException accessDeniedException) throws IOException {
        write(response, HttpStatus.FORBIDDEN, "You do not have access to this resource");
    }

    private void write(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiErrorDto body = new ApiErrorDto(Instant.now(), status.value(), status.getReasonPhrase(), message, List.of());
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
