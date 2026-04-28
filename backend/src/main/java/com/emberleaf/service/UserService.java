package com.emberleaf.service;

import com.emberleaf.entity.User;
import com.emberleaf.entity.Role;
import com.emberleaf.repository.UserRepository;
import com.emberleaf.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    public User createUser(String name, String email, String password) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.USER);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User createAdminUser(String name, String email, String password) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.ADMIN);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public boolean matchesPassword(String rawPassword, String encodedPassword) {
        if (encodedPassword == null) return false;
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public String generateToken(User user) {
        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
    }

    public Optional<User> getUserFromToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            return Optional.empty();
        }
        Claims claims = jwtUtil.parseToken(token);
        Long userId = claims.get("userId", Long.class);
        return userRepository.findById(userId);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), token);
    }

    public boolean verifyEmail(String token) {
        return userRepository.findByVerificationToken(token).map(user -> {
            user.setEmailVerified(true);
            user.setVerificationToken(null);
            userRepository.save(user);
            return true;
        }).orElse(false);
    }

    public User findOrCreateGoogleUser(String email, String name) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setPassword(null);
            newUser.setRole(Role.USER);
            newUser.setCreatedAt(LocalDateTime.now());
            return newUser;
        });
        user.setEmailVerified(true);
        return userRepository.save(user);
    }
}
