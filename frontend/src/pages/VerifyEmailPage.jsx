import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    api.get(`/auth/verify?token=${encodeURIComponent(token)}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🍃</span>
          <span className="auth-logo-name">Chai &amp; Leaf</span>
          <span className="auth-logo-tagline">Premium Indian Teas</span>
        </div>

        {status === 'loading' && (
          <div className="auth-verify-status">
            <span className="spinner" style={{ display: 'inline-block', marginBottom: '12px' }}></span>
            <p>Verifying your email…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="auth-verify-status auth-verify-success">
            <div className="auth-verify-icon">✅</div>
            <h2>Email verified!</h2>
            <p>Your account is now active. You can sign in.</p>
            <Link to="/login" className="auth-btn" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="auth-verify-status auth-verify-error">
            <div className="auth-verify-icon">❌</div>
            <h2>Link invalid or expired</h2>
            <p>This verification link has already been used or has expired.</p>
            <p>
              <Link to="/login">Go to sign in</Link> and use the resend option to get a new link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
