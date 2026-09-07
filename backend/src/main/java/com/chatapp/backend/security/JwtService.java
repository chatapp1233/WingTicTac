package com.chatapp.backend.security;

import com.chatapp.backend.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

/**
 * Issues and verifies signed access tokens (HMAC-SHA256). Kept as a small factory
 * so token creation/parsing rules live in exactly one place.
 */
@Component
public class JwtService {

    private final SecretKey key;
    private final long expirationMinutes;

    public JwtService(JwtProperties jwtProperties) {
        this.key = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = jwtProperties.expirationMinutes();
    }

    public String generateToken(UUID userId, String username, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(username)
                .claim("uid", userId.toString())
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES)))
                .signWith(key)
                .compact();
    }

    public Instant expiryFor(String token) {
        return parseClaims(token).getExpiration().toInstant();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public Optional<Claims> tryParse(String token) {
        try {
            return Optional.of(parseClaims(token));
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public boolean isValid(String token, String expectedUsername) {
        return tryParse(token)
                .filter(claims -> claims.getSubject().equals(expectedUsername))
                .filter(claims -> claims.getExpiration().after(new Date()))
                .isPresent();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
