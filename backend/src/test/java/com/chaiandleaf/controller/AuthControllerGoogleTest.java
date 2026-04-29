package com.chaiandleaf.controller;

import com.chaiandleaf.entity.Role;
import com.chaiandleaf.entity.User;
import com.chaiandleaf.repository.UserRepository;
import com.chaiandleaf.service.GoogleTokenVerifier;
import com.chaiandleaf.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerGoogleTest {

    @Autowired MockMvc mockMvc;
    @MockBean UserService userService;
    @MockBean UserRepository userRepository;
    @MockBean GoogleTokenVerifier googleTokenVerifier;

    @Test
    void googleLogin_missingToken_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Missing access token"));
    }

    @Test
    void googleLogin_invalidToken_returns401() throws Exception {
        when(googleTokenVerifier.verify("bad-token")).thenReturn(null);

        mockMvc.perform(post("/api/auth/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"accessToken\":\"bad-token\"}"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Invalid Google credential"));
    }

    @Test
    void googleLogin_verifierThrows_returns502() throws Exception {
        when(googleTokenVerifier.verify("broken-token"))
            .thenThrow(new RuntimeException("network error"));

        mockMvc.perform(post("/api/auth/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"accessToken\":\"broken-token\"}"))
            .andExpect(status().is(502))
            .andExpect(jsonPath("$.message").value("Could not verify Google credential"));
    }

    @Test
    void googleLogin_validToken_returnsJwtAndUserInfo() throws Exception {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("email", "jane@example.com");
        userInfo.put("name", "Jane Doe");
        userInfo.put("email_verified", true);
        when(googleTokenVerifier.verify("valid-token")).thenReturn(userInfo);

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setName("Jane Doe");
        mockUser.setEmail("jane@example.com");
        mockUser.setRole(Role.USER);
        when(userService.findOrCreateGoogleUser("jane@example.com", "Jane Doe"))
            .thenReturn(mockUser);
        when(userService.generateToken(mockUser)).thenReturn("app-jwt");

        mockMvc.perform(post("/api/auth/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"accessToken\":\"valid-token\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value("app-jwt"))
            .andExpect(jsonPath("$.user.email").value("jane@example.com"))
            .andExpect(jsonPath("$.user.name").value("Jane Doe"));
    }
}
