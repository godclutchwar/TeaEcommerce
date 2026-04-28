package com.emberleaf.service;

import com.emberleaf.entity.Role;
import com.emberleaf.entity.User;
import com.emberleaf.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder, null);
    }

    @Test
    void findOrCreateGoogleUser_existingUser_returnsExistingWithoutSaving() {
        User existing = new User();
        existing.setEmail("jane@example.com");
        existing.setName("Jane Doe");
        existing.setRole(Role.USER);
        when(userRepository.findByEmail("jane@example.com"))
            .thenReturn(Optional.of(existing));

        User result = userService.findOrCreateGoogleUser("jane@example.com", "Jane Doe");

        assertThat(result.getEmail()).isEqualTo("jane@example.com");
        verify(userRepository, never()).save(any());
    }

    @Test
    void findOrCreateGoogleUser_newUser_savesWithNullPasswordAndUserRole() {
        when(userRepository.findByEmail("new@example.com"))
            .thenReturn(Optional.empty());
        when(userRepository.save(any(User.class)))
            .thenAnswer(inv -> inv.getArgument(0));

        User result = userService.findOrCreateGoogleUser("new@example.com", "New User");

        assertThat(result.getEmail()).isEqualTo("new@example.com");
        assertThat(result.getName()).isEqualTo("New User");
        assertThat(result.getPassword()).isNull();
        assertThat(result.getRole()).isEqualTo(Role.USER);
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder, never()).encode(any());
    }
}
