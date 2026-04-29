package com.chaiandleaf.controller;

import com.chaiandleaf.entity.User;
import com.chaiandleaf.entity.Role;
import com.chaiandleaf.repository.UserRepository;
import com.chaiandleaf.service.GoogleTokenVerifier;
import com.chaiandleaf.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthController(UserService userService, UserRepository userRepository,
                          GoogleTokenVerifier googleTokenVerifier) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        User user = userService.createUser(name, email, password);
        userService.sendVerificationEmail(user);
        return ResponseEntity.ok(Map.of("message", "Account created. Please check your email to verify your account."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing email or password"));
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !userService.matchesPassword(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
        if (!user.isEmailVerified()) {
            return ResponseEntity.status(403).body(Map.of(
                "message", "Please verify your email before logging in.",
                "code", "EMAIL_NOT_VERIFIED"
            ));
        }
        String token = userService.generateToken(user);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                )
        ));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        boolean ok = userService.verifyEmail(token);
        if (ok) {
            return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired verification link"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing email"));
        }
        userRepository.findByEmail(email).ifPresent(user -> {
            if (!user.isEmailVerified()) {
                userService.sendVerificationEmail(user);
            }
        });
        // Always return 200 to avoid revealing whether an account exists
        return ResponseEntity.ok(Map.of("message", "If that email is registered and unverified, a new link has been sent."));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String accessToken = body.get("accessToken");
        if (accessToken == null || accessToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing access token"));
        }

        Map<String, Object> userInfo;
        try {
            userInfo = googleTokenVerifier.verify(accessToken);
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("message", "Could not verify Google credential"));
        }

        if (userInfo == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid Google credential"));
        }

        String email = (String) userInfo.get("email");
        Object emailVerified = userInfo.get("email_verified");
        String name = (String) userInfo.get("name");

        boolean verified = Boolean.TRUE.equals(emailVerified)
            || "true".equalsIgnoreCase(String.valueOf(emailVerified));
        if (email == null || !verified) {
            return ResponseEntity.status(401).body(Map.of("message", "Google email not verified"));
        }

        if (name == null || name.isBlank()) {
            name = email.split("@")[0];
        }

        User user = userService.findOrCreateGoogleUser(email, name);
        String token = userService.generateToken(user);

        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
            )
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        String token = authHeader.substring(7);
        return userService.getUserFromToken(token)
                .map(u -> ResponseEntity.ok(Map.of(
                        "id", u.getId(),
                        "name", u.getName(),
                        "email", u.getEmail(),
                        "role", u.getRole().name()
                )))
                .orElse(ResponseEntity.status(401).body(Map.of("message", "Invalid token")));
    }
}
