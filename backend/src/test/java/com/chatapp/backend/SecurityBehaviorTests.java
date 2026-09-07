package com.chatapp.backend;

import com.chatapp.backend.dto.LoginRequest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Locks in the two auth-failure shapes a client relies on: 401 when there's no/invalid
 * credential at all, 401 for a wrong password. (403-for-wrong-user and 403-for-non-admin
 * are covered by service-level authorization and were verified manually against a real
 * Postgres instance during development - see backend/README.md.)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SecurityBehaviorTests {

    @LocalServerPort
    private int port;

    private final TestRestTemplate rest = new TestRestTemplate();

    private String baseUrl(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void unauthenticatedRequestIsRejectedWith401() {
        var response = rest.getForEntity(baseUrl("/api/conversations"), String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void loginWithWrongPasswordIsRejectedWith401() {
        var response = rest.postForEntity(
                baseUrl("/api/auth/login"),
                new LoginRequest("nonexistent-user", "wrong-password"),
                String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
