package com.chatapp.backend.exception;

import org.springframework.http.HttpStatus;

/** Thrown whenever a user attempts to act on a resource they are not a participant of. */
public class ForbiddenActionException extends ApiException {
    public ForbiddenActionException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
