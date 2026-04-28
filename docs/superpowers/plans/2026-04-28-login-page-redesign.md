# Login Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign LoginPage.jsx with show/hide password, inline validation, loading spinners, error banners, Google Sign-In (full stack via access-token → userinfo API), all matching the Chai & Leaf brand.

**Architecture:** Backend gets a standalone `GoogleTokenVerifier` component (calls Google's `/oauth2/v3/userinfo` with the access token) plus a new `POST /api/auth/google` endpoint in `AuthController`. Frontend uses `@react-oauth/google`'s `useGoogleLogin` hook with a custom-styled button; the returned access token is sent to the backend which issues the app's own JWT.

**Tech Stack:** React 18, `@react-oauth/google`, Spring Boot 3.4.1, Java 17 `HttpClient`, JUnit 5 + Mockito + MockMvc, H2

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `backend/src/main/java/com/emberleaf/entity/User.java` | Modify | Make `password` column nullable (Google users have no password) |
| `backend/src/main/java/com/emberleaf/service/GoogleTokenVerifier.java` | **Create** | Calls `googleapis.com/oauth2/v3/userinfo`, returns user claims map |
| `backend/src/main/java/com/emberleaf/service/UserService.java` | Modify | Add `findOrCreateGoogleUser(email, name)` |
| `backend/src/main/java/com/emberleaf/controller/AuthController.java` | Modify | Add `POST /api/auth/google` endpoint, inject `GoogleTokenVerifier` |
| `backend/src/test/java/com/emberleaf/service/GoogleTokenVerifierTest.java` | **Create** | Verifies invalid token → null |
| `backend/src/test/java/com/emberleaf/service/UserServiceTest.java` | **Create** | Tests `findOrCreateGoogleUser` existing vs new user |
| `backend/src/test/java/com/emberleaf/controller/AuthControllerGoogleTest.java` | **Create** | MockMvc tests for `POST /api/auth/google` |
| `frontend/src/styles/App.css` | Modify | Add logo, google btn, divider, eye btn, field errors, banners, spinners |
| `frontend/package.json` | Modify | Add `@react-oauth/google` |
| `frontend/.env` | **Create** | `VITE_GOOGLE_CLIENT_ID=your-client-id` |
| `frontend/src/main.jsx` | Modify | Wrap `<App>` in `<GoogleOAuthProvider>` |
| `frontend/src/context/AuthContext.jsx` | Modify | Add `loginWithGoogle(accessToken)` method |
| `frontend/src/pages/LoginPage.jsx` | Modify | Full UI redesign — all new layout and logic |

---

### Task 1: Make User.password nullable

**Files:**
- Modify: `backend/src/main/java/com/emberleaf/entity/User.java:20`

- [ ] **Step 1: Update the `@Column` annotation on `password`**

In `User.java` line 20, change:
```java
@Column(nullable = false)
private String password;
```
To:
```java
@Column(nullable = true)
private String password;
```

- [ ] **Step 2: Verify the app still starts**

```bash
cd d:/ClaudeProject/backend
D:/apache-maven-3.9.6/bin/mvn compile -q
```
Expected: `BUILD SUCCESS` with no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/emberleaf/entity/User.java
git commit -m "fix: allow null password column for Google OAuth users"
```

---

### Task 2: Create GoogleTokenVerifier

**Files:**
- Create: `backend/src/main/java/com/emberleaf/service/GoogleTokenVerifier.java`
- Create: `backend/src/test/java/com/emberleaf/service/GoogleTokenVerifierTest.java`

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/java/com/emberleaf/service/GoogleTokenVerifierTest.java`:
```java
package com.emberleaf.service;

import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;

class GoogleTokenVerifierTest {

    private final GoogleTokenVerifier verifier = new GoogleTokenVerifier();

    @Test
    void verify_invalidToken_returnsNull() throws Exception {
        Map<String, Object> result = verifier.verify("not-a-real-token-xyz");
        assertThat(result).isNull();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd d:/ClaudeProject/backend
D:/apache-maven-3.9.6/bin/mvn test -Dtest=GoogleTokenVerifierTest -q
```
Expected: **BUILD FAILURE** — `GoogleTokenVerifier` class does not exist yet.

- [ ] **Step 3: Create GoogleTokenVerifier.java**

Create `backend/src/main/java/com/emberleaf/service/GoogleTokenVerifier.java`:
```java
package com.emberleaf.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Component
public class GoogleTokenVerifier {

    private static final String USERINFO_URL =
        "https://www.googleapis.com/oauth2/v3/userinfo?access_token=";

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> verify(String accessToken) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(USERINFO_URL + accessToken))
            .GET()
            .build();
        HttpResponse<String> response =
            client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            return null;
        }
        return objectMapper.readValue(
            response.body(), new TypeReference<Map<String, Object>>() {});
    }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
D:/apache-maven-3.9.6/bin/mvn test -Dtest=GoogleTokenVerifierTest -q
```
Expected: `Tests run: 1, Failures: 0, Errors: 0`  
(The invalid token triggers a 400 from Google → `verify` returns null → assertion passes.)

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/emberleaf/service/GoogleTokenVerifier.java
git add backend/src/test/java/com/emberleaf/service/GoogleTokenVerifierTest.java
git commit -m "feat: add GoogleTokenVerifier service"
```

---

### Task 3: Add findOrCreateGoogleUser to UserService

**Files:**
- Modify: `backend/src/main/java/com/emberleaf/service/UserService.java`
- Create: `backend/src/test/java/com/emberleaf/service/UserServiceTest.java`

- [ ] **Step 1: Write the failing tests**

Create `backend/src/test/java/com/emberleaf/service/UserServiceTest.java`:
```java
package com.emberleaf.service;

import com.emberleaf.entity.Role;
import com.emberleaf.entity.User;
import com.emberleaf.repository.UserRepository;
import com.emberleaf.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
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
    @Mock JwtUtil jwtUtil;
    @InjectMocks UserService userService;

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
D:/apache-maven-3.9.6/bin/mvn test -Dtest=UserServiceTest -q
```
Expected: **BUILD FAILURE** — `findOrCreateGoogleUser` does not exist yet.

- [ ] **Step 3: Add findOrCreateGoogleUser to UserService**

Add this method at the end of `UserService.java`, before the closing `}`:
```java
public User findOrCreateGoogleUser(String email, String name) {
    return userRepository.findByEmail(email).orElseGet(() -> {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(null);
        user.setRole(Role.USER);
        user.setCreatedAt(java.time.LocalDateTime.now());
        return userRepository.save(user);
    });
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
D:/apache-maven-3.9.6/bin/mvn test -Dtest=UserServiceTest -q
```
Expected: `Tests run: 2, Failures: 0, Errors: 0`

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/emberleaf/service/UserService.java
git add backend/src/test/java/com/emberleaf/service/UserServiceTest.java
git commit -m "feat: add findOrCreateGoogleUser to UserService"
```

---

### Task 4: Add POST /api/auth/google to AuthController

**Files:**
- Modify: `backend/src/main/java/com/emberleaf/controller/AuthController.java`
- Create: `backend/src/test/java/com/emberleaf/controller/AuthControllerGoogleTest.java`

- [ ] **Step 1: Write the failing tests**

Create `backend/src/test/java/com/emberleaf/controller/AuthControllerGoogleTest.java`:
```java
package com.emberleaf.controller;

import com.emberleaf.entity.Role;
import com.emberleaf.entity.User;
import com.emberleaf.repository.UserRepository;
import com.emberleaf.service.GoogleTokenVerifier;
import com.emberleaf.service.UserService;
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
```

- [ ] **Step 2: Run to verify it fails**

```bash
D:/apache-maven-3.9.6/bin/mvn test -Dtest=AuthControllerGoogleTest -q
```
Expected: **BUILD FAILURE** — `POST /api/auth/google` and `GoogleTokenVerifier` constructor arg don't exist yet.

- [ ] **Step 3: Replace AuthController.java with the updated version**

Replace the full contents of `backend/src/main/java/com/emberleaf/controller/AuthController.java`:
```java
package com.emberleaf.controller;

import com.emberleaf.entity.User;
import com.emberleaf.entity.Role;
import com.emberleaf.repository.UserRepository;
import com.emberleaf.service.GoogleTokenVerifier;
import com.emberleaf.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
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
        userService.createUser(name, email, password);
        return ResponseEntity.ok(Map.of("message", "User created successfully"));
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
```

- [ ] **Step 4: Run all backend tests — expect PASS**

```bash
D:/apache-maven-3.9.6/bin/mvn test -q
```
Expected: `Tests run: 7, Failures: 0, Errors: 0`  
(1 GoogleTokenVerifier + 2 UserService + 4 AuthControllerGoogle)

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/emberleaf/controller/AuthController.java
git add backend/src/test/java/com/emberleaf/controller/AuthControllerGoogleTest.java
git commit -m "feat: add POST /api/auth/google endpoint"
```

---

### Task 5: Add auth CSS to App.css

**Files:**
- Modify: `frontend/src/styles/App.css` — append to the `/* ===== AUTH PAGES =====` section

- [ ] **Step 1: Update `.auth-card` border-radius in App.css**

In App.css, in the `/* ===== AUTH PAGES =====` section, change:
```css
.auth-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
```
To:
```css
.auth-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
```

- [ ] **Step 2: Update `.auth-btn` to support flex layout for spinner**

Change:
```css
.auth-btn {
  width: 100%;
  padding: 0.8rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}
```
To:
```css
.auth-btn {
  width: 100%;
  padding: 0.8rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.auth-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}
```

(Remove the old `.auth-btn:hover:not(:disabled)` rule if it exists, replace with the one above.)

- [ ] **Step 3: Append new auth CSS classes after the existing `/* ===== AUTH PAGES =====` block**

Add at the end of the `/* ===== AUTH PAGES =====` section (before `/* ===== NAVBAR AUTH =====`):
```css
/* ── AUTH LOGO ── */
.auth-logo {
  text-align: center;
  margin-bottom: 1.6rem;
}

.auth-logo-icon {
  font-size: 2.2rem;
  display: block;
  margin-bottom: 0.3rem;
}

.auth-logo-name {
  font-family: var(--font-display);
  font-size: 1.45rem;
  color: var(--primary-dark);
  font-weight: 700;
  letter-spacing: 0.3px;
  display: block;
}

.auth-logo-tagline {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
  display: block;
}

/* ── AUTH HEADINGS ── */
.auth-heading {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--text);
  text-align: center;
  margin-bottom: 0.3rem;
}

.auth-sub {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 1.6rem;
}

/* ── GOOGLE BUTTON ── */
.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.72rem 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.google-btn:hover:not(:disabled) {
  border-color: #aaa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── DIVIDER ── */
.auth-divider {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 1.2rem 0;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* ── PASSWORD TOGGLE ── */
.input-wrap {
  position: relative;
}

.input-wrap input.has-icon {
  padding-right: 2.8rem;
}

.input-wrap input.has-error {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.eye-btn {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
}

.eye-btn:hover {
  color: var(--text);
}

/* ── FIELD ERROR ── */
.field-error {
  color: var(--error);
  font-size: 0.78rem;
  margin-top: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* ── ERROR / SUCCESS BANNERS ── */
.auth-error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: var(--error);
  padding: 0.65rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.87rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-success-banner {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.87rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ── SPINNERS ── */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.spinner-google {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(74, 124, 89, 0.25);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles/App.css
git commit -m "feat: add auth UI styles (google btn, divider, spinners, banners)"
```

---

### Task 6: Install @react-oauth/google and configure GoogleOAuthProvider

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/.env`
- Modify: `frontend/src/main.jsx`

- [ ] **Step 1: Install the package**

```bash
cd d:/ClaudeProject/frontend
npm install @react-oauth/google
```
Expected: package added to `node_modules`, `package-lock.json` updated.

- [ ] **Step 2: Create frontend/.env**

Create `frontend/.env`:
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

> **Note for the user:** Replace `your-google-client-id-here` with the OAuth 2.0 Client ID from Google Cloud Console → APIs & Services → Credentials. Set Authorised JavaScript origins to `http://localhost:5173`.

- [ ] **Step 3: Update main.jsx to wrap App in GoogleOAuthProvider**

Replace the full contents of `frontend/src/main.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './styles/App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <CartProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CartProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
```

- [ ] **Step 4: Verify dev server still starts without errors**

Check the already-running Vite server's terminal output (or restart it) for any import errors. Expected: no errors, app loads at `http://localhost:5173`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/main.jsx frontend/.env
git commit -m "feat: configure GoogleOAuthProvider in app root"
```

---

### Task 7: Add loginWithGoogle to AuthContext

**Files:**
- Modify: `frontend/src/context/AuthContext.jsx`

- [ ] **Step 1: Add `loginWithGoogle` method and expose it in the context value**

In `AuthContext.jsx`, add after the existing `logout` callback:
```js
const loginWithGoogle = useCallback(async (accessToken) => {
  const res = await api.post('/auth/google', { accessToken });
  localStorage.setItem('token', res.data.token);
  setToken(res.data.token);
  setUser(res.data.user);
  return res.data;
}, []);
```

And update the Provider's `value` prop from:
```jsx
<AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAdmin }}>
```
To:
```jsx
<AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, signup, logout, isAdmin }}>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/context/AuthContext.jsx
git commit -m "feat: add loginWithGoogle to AuthContext"
```

---

### Task 8: Redesign LoginPage.jsx

**Files:**
- Modify: `frontend/src/pages/LoginPage.jsx`

- [ ] **Step 1: Replace the full contents of LoginPage.jsx**

```jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const SmallAlertIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const EyeOpenIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeClosedIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validateEmail = () => {
    if (!email) { setEmailError('Email is required'); return false; }
    if (!isValidEmail(email)) { setEmailError('Please enter a valid email address'); return false; }
    setEmailError('');
    return true;
  };

  const validatePassword = () => {
    if (!password) { setPasswordError('Password is required'); return false; }
    if (password.length < 6) { setPasswordError('Password must be at least 6 characters'); return false; }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailOk = validateEmail();
    const passwordOk = validatePassword();
    if (!emailOk || !passwordOk) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/shop');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        await loginWithGoogle(tokenResponse.access_token);
        navigate('/shop');
      } catch (err) {
        setError(err.message || 'Google sign-in failed. Please try again.');
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.');
    },
  });

  const busy = loading || googleLoading;

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <span className="auth-logo-icon">🍃</span>
          <span className="auth-logo-name">Chai &amp; Leaf</span>
          <span className="auth-logo-tagline">Premium Indian Teas</span>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-sub">Sign in to your account to continue</p>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertIcon />
            {error}
          </div>
        )}

        <button
          type="button"
          className="google-btn"
          onClick={() => googleLogin()}
          disabled={busy}
          aria-label="Continue with Google"
        >
          {googleLoading ? (
            <><span className="spinner-google" />Connecting…</>
          ) : (
            <><GoogleIcon />Continue with Google</>
          )}
        </button>

        <div className="auth-divider" role="separator">or</div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validateEmail}
                placeholder="you@example.com"
                className={emailError ? 'has-error' : ''}
                disabled={busy}
                autoComplete="email"
              />
            </div>
            {emailError && (
              <div className="field-error" role="alert">
                <SmallAlertIcon />{emailError}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validatePassword}
                placeholder="••••••••"
                className={`has-icon${passwordError ? ' has-error' : ''}`}
                disabled={busy}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </button>
            </div>
            {passwordError && (
              <div className="field-error" role="alert">
                <SmallAlertIcon />{passwordError}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={busy}
          >
            {loading ? <><span className="spinner" />Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-link">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Visit http://localhost:5173/login and verify**

Check:
- Card is centered with Chai & Leaf logo and tagline
- Google button renders with G icon
- Email and password fields have correct placeholders
- Clicking the eye icon on password field toggles visibility
- Submitting with blank fields shows inline errors below each field
- Submitting with invalid email shows "Please enter a valid email address"
- Submitting with short password shows "Password must be at least 6 characters"
- Submitting valid credentials shows spinner + "Signing in…" on button
- Clicking Google button shows "Connecting…" with spinner

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/LoginPage.jsx
git commit -m "feat: redesign LoginPage with Google sign-in, validation, and loading states"
```
