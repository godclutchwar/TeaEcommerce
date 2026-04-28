package com.emberleaf.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/*
 * PURPOSE: Centralized exception handling for the entire application.
 *
 * WHAT @RestControllerAdvice DOES:
 * It's an AOP (Aspect-Oriented Programming) pattern. This class acts as a global interceptor
 * that catches exceptions thrown by ANY controller, converting them to structured JSON responses.
 * Without this, Spring returns a 500 with a stack trace — ugly and potentially dangerous.
 *
 * WHY EACH HANDLER EXISTS:
 * - RuntimeException → General errors (product not found, session mismatch). Returns 500 or 404.
 * - MethodArgumentNotValidException → Validation failures (@NotBlank, @Min, @Email). Returns 400
 *   with a map of field → error message so the frontend can highlight the exact bad field.
 * - Exception → Catch-all for anything unexpected. Returns 500 with a generic message.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        // Check if it's a not-found style exception → 404, else 500
        HttpStatus status = ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.INTERNAL_SERVER_ERROR;

        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage());
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());

        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        // Collect all field errors into a map: {"email": "Invalid email address", "name": "Name is required"}
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Validation failed");
        body.put("errors", errors);
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", "An unexpected error occurred");
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
