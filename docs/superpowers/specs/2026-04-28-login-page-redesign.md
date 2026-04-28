# Login Page Redesign — Chai & Leaf
**Date:** 2026-04-28  
**Status:** Approved

## Overview
Redesign the existing `LoginPage.jsx` into a modern, production-quality auth page that matches the Chai & Leaf brand system. Add Google Sign-In (Approach 1: frontend ID token + backend verification) alongside the existing email/password flow.

## Decisions Made
- Styling: existing CSS variables system (no Tailwind — keeps consistency with the rest of the app)
- Theme: warm light brand theme (white/emerald green/amber) — matches all other pages
- Google OAuth: full end-to-end (frontend ID token → backend tokeninfo verification → JWT)
- Brand name on card: "Chai & Leaf" (confirmed from Navbar, Footer, AboutPage)

## Files Changed

### Frontend
| File | Change |
|---|---|
| `frontend/package.json` | Add `@react-oauth/google` |
| `frontend/src/main.jsx` | Wrap `<App>` in `<GoogleOAuthProvider clientId={...}>` |
| `frontend/src/context/AuthContext.jsx` | Add `loginWithGoogle(credential)` method |
| `frontend/src/pages/LoginPage.jsx` | Full redesign — all new UI + both auth flows |
| `frontend/src/styles/App.css` | Add new auth styles: password toggle, divider, Google button, spinner, field errors |

### Backend
| File | Change |
|---|---|
| `backend/src/main/java/com/emberleaf/controller/AuthController.java` | Add `POST /api/auth/google` endpoint |
| `backend/src/main/java/com/emberleaf/service/UserService.java` | Add `findOrCreateGoogleUser(email, name)` method |

No new Maven dependencies. Uses `java.net.http.HttpClient` (Java 11+) for Google tokeninfo call.

## UI Design (approved via mockup at `/login-mockup.html`)

### Layout
- Full-height page, `--bg-warm` background
- Centered `.auth-card` (max-width 440px, border-radius 16px)
- Logo block: 🍃 icon + "Chai & Leaf" (Playfair Display) + tagline "Premium Indian Teas"
- Heading: "Welcome back", subtitle: "Sign in to your account to continue"
- Google button → divider "or" → email field → password field → Sign In button → signup link

### Components
- **Google button**: full-width, white bg, border, Google G SVG, hover box-shadow
- **Divider**: `── or ──` with muted text + flex lines
- **Email field**: validates format on blur, red border + inline error if invalid
- **Password field**: eye icon button on right toggles `type="password"` / `type="text"`
- **Inline field errors**: red, 0.78rem, with warning icon, appear below each field
- **Error banner**: red bg banner for API errors (wrong credentials, network error)
- **Loading state (email)**: spinner + "Signing in…" on button, all inputs disabled, Google btn disabled
- **Loading state (Google)**: spinner + "Connecting…" on Google btn, all inputs disabled, Sign In btn disabled
- **Success state**: green banner "Signed in successfully! Redirecting…" (shown briefly before navigate)

### Validation (client-side)
- Email: validated on blur — must contain `@` and a `.` after it
- Password: validated on blur — minimum 6 characters
- Submit blocked if either field has an error

## Backend: `/api/auth/google`

### Request
```
POST /api/auth/google
Content-Type: application/json
{ "credential": "<google-id-token>" }
```

### Flow
1. Call `https://oauth2.googleapis.com/tokeninfo?id_token=<token>` via `HttpClient`
2. Parse JSON response for `email`, `name`, `email_verified`
3. If `email_verified != "true"` → 401 "Google email not verified"
4. `userService.findOrCreateGoogleUser(email, name)` — finds by email or creates with `role=USER`, `password=null`
5. Generate JWT → return `{ token, user: { id, name, email, role } }` (same shape as regular login)

### Error responses
| Scenario | Status | Message |
|---|---|---|
| Invalid/expired token | 401 | "Invalid Google credential" |
| Email not verified | 401 | "Google email not verified" |
| Google API unreachable | 502 | "Could not verify Google credential" |

### `findOrCreateGoogleUser(email, name)`
- `userRepository.findByEmail(email)` → if present, return existing user
- If not found: construct `User` directly (do NOT call `createUser` — it calls `passwordEncoder.encode(password)` which NPEs on null). Set `name`, `email`, `password = null`, `role = USER`, `createdAt = now()`, then `userRepository.save(user)`

## Google Cloud Console Setup (prerequisite)
User must create an OAuth 2.0 Client ID at console.cloud.google.com:
- Application type: Web application
- Authorised JavaScript origins: `http://localhost:5173`
- Set `VITE_GOOGLE_CLIENT_ID=<your-client-id>` in `frontend/.env`

## AuthContext Change
Add alongside existing `login`:
```js
loginWithGoogle = async (credential) => {
  const res = await api.post('/auth/google', { credential });
  localStorage.setItem('token', res.data.token);
  setToken(res.data.token);
  setUser(res.data.user);
  return res.data;
}
```
Expose `loginWithGoogle` in context value.

## CSS Additions to App.css (`.auth-*` section)
- `.auth-logo`, `.auth-logo-icon`, `.auth-logo-name`, `.auth-logo-tagline`
- `.google-btn` + hover
- `.auth-divider`
- `.input-wrap`, `.eye-btn`
- `.field-error`
- `.auth-error-banner`, `.auth-success-banner`
- `@keyframes spin`, `.spinner`, `.spinner-google`
- Updates to `.auth-card` (border-radius 16px), `.auth-btn` (flex + gap for spinner)
