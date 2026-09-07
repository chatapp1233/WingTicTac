-- Core schema. Portable ANSI SQL so it runs unmodified on both H2 (local profile)
-- and PostgreSQL (postgres profile) - no vendor-specific extensions or functions.

CREATE TABLE app_user (
    id              UUID PRIMARY KEY,
    username        VARCHAR(32) NOT NULL UNIQUE,
    display_name    VARCHAR(64) NOT NULL,
    avatar_url      VARCHAR(512),
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(16) NOT NULL DEFAULT 'USER',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at    TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation (
    id                  UUID PRIMARY KEY,
    user_a_id           UUID NOT NULL REFERENCES app_user (id),
    user_b_id           UUID NOT NULL REFERENCES app_user (id),
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at     TIMESTAMP,
    CONSTRAINT ux_conversation_pair UNIQUE (user_a_id, user_b_id)
);

CREATE INDEX idx_conversation_user_a ON conversation (user_a_id);
CREATE INDEX idx_conversation_user_b ON conversation (user_b_id);

CREATE TABLE message (
    id                      UUID PRIMARY KEY,
    conversation_id         UUID NOT NULL REFERENCES conversation (id),
    sender_id               UUID NOT NULL REFERENCES app_user (id),
    content                 TEXT NOT NULL,
    status                  VARCHAR(16) NOT NULL DEFAULT 'SENT',
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_at            TIMESTAMP,
    read_at                 TIMESTAMP,
    deleted_for_sender      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_for_receiver    BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_for_everyone    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_message_conversation_created ON message (conversation_id, created_at);
