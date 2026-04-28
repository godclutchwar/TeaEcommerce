import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const { signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password);
      setCheckEmail(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
    }
    setLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await loginWithGoogle(tokenResponse.access_token);
        // Google users are auto-verified — navigate directly to shop
        window.location.href = '/shop';
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-up failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-up was cancelled or failed');
      setGoogleLoading(false);
    },
  });

  const handleGoogleClick = () => {
    setError('');
    setGoogleLoading(true);
    googleLogin();
  };

  if (checkEmail) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-icon">🍃</span>
            <span className="auth-logo-name">Chai &amp; Leaf</span>
            <span className="auth-logo-tagline">Premium Indian Teas</span>
          </div>
          <div className="auth-check-email">
            <div className="auth-check-email-icon">📬</div>
            <h2>Check your inbox</h2>
            <p>
              We sent a verification link to <strong>{email}</strong>.
              Click the link to activate your account.
            </p>
            <p className="auth-check-email-note">
              Didn&apos;t receive it? Check your spam folder, or{' '}
              <Link to="/login">go to sign in</Link> and use the resend option.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🍃</span>
          <span className="auth-logo-name">Chai &amp; Leaf</span>
          <span className="auth-logo-tagline">Premium Indian Teas</span>
        </div>
        <h1 className="auth-heading">Create Account</h1>
        <p className="auth-sub">Join us and start exploring.</p>

        {error && (
          <div className="auth-error-banner">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleClick}
          disabled={loading || googleLoading}
        >
          {googleLoading ? <span className="spinner-google"></span> : (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
          )}
          {googleLoading ? 'Connecting…' : 'Sign up with Google'}
        </button>

        <div className="auth-divider">or</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading || googleLoading}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email address</label>
            <div className="input-wrap">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || googleLoading}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="has-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                className="eye-btn"
                title={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || googleLoading}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24m1.2-2.83L2 2m20 20l-4.24-4.24"/>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading || googleLoading}
              />
            </div>
          </div>
          <button type="submit" className="auth-btn" disabled={loading || googleLoading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating account…
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
