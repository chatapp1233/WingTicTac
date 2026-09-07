-- Local-dev-only convenience data (see application-local.yml: this location is NOT
-- loaded by the postgres/production profile). Mirrors how an administrator provisions
-- accounts in real life: rows inserted directly, no self-registration involved.
--
-- All seeded accounts share the password: password123 (except admin: admin123)
-- Passwords are bcrypt-hashed - see README "Demo accounts" for the full list.

INSERT INTO app_user (id, username, display_name, avatar_url, password_hash, role, active, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin',  'Administrator', NULL, '$2a$10$ePT5cbbpw.P0vBqo0968Ie3Ig17Yrg8xX6xekUTVezCqqDqvKBp5a', 'ADMIN', TRUE, CURRENT_TIMESTAMP),
    ('22222222-2222-2222-2222-222222222222', 'alex',    'Alex',          NULL, '$2a$10$yUJGmjf6.Rl66cqUCxCpluvBwJV/U9YFN6BhaEndjLkjjbYKxlLO.', 'USER',  TRUE, CURRENT_TIMESTAMP),
    ('33333333-3333-3333-3333-333333333333', 'sarah',   'Sarah',         NULL, '$2a$10$yUJGmjf6.Rl66cqUCxCpluvBwJV/U9YFN6BhaEndjLkjjbYKxlLO.', 'USER',  TRUE, CURRENT_TIMESTAMP),
    ('44444444-4444-4444-4444-444444444444', 'mike',    'Mike',          NULL, '$2a$10$yUJGmjf6.Rl66cqUCxCpluvBwJV/U9YFN6BhaEndjLkjjbYKxlLO.', 'USER',  TRUE, CURRENT_TIMESTAMP);