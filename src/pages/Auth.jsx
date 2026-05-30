import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { registerUser, loginUser, createUserProfile } from '../services/firebase';
import logoImg from '../assets/images/logo.png';

export default function Auth() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (mode === 'register' && password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      if (mode === 'register') {
        const cred = await registerUser(email, password);
        await createUserProfile(cred.user.uid, { email });
      } else {
        await loginUser(email, password);
      }
      navigate(from, { replace: true });
    } catch (e) {
      const msg = e.code
        ? e.code.replace('auth/', '').replace(/-/g, ' ')
        : e.message;
      setError(msg.charAt(0).toUpperCase() + msg.slice(1) + '.');
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="auth-page" role="main">
      <div className="auth-box">
        {/* Logo */}
        <div className="auth-box__logo">
          <img src={logoImg} alt="The Paradox Gallery" />
        </div>

        <h1 className="auth-box__title">
          {mode === 'login' ? 'Welcome Back' : 'Join The Gallery'}
        </h1>
        <p className="auth-box__sub">
          {mode === 'login'
            ? 'Enter the gallery. Only the authenticated may submit.'
            : 'Create an account to upload work and join the movement.'}
        </p>

        <div className="auth-form" role="form" aria-label={mode === 'login' ? 'Login' : 'Register'}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={onKey}
              placeholder="you@domain.com"
              autoComplete="email"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKey}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={loading}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={onKey}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          <button
            className="btn btn--primary"
            style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? 'Working…'
              : mode === 'login'
              ? 'Enter The Gallery'
              : 'Create Account'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-400)', letterSpacing: '0.1em' }}>
              OR
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
          </div>

          <button
            className="btn btn--outline"
            style={{ width: '100%' }}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            disabled={loading}
          >
            {mode === 'login' ? 'Create New Account' : 'Already have an account'}
          </button>
        </div>

        <p style={{
          marginTop: '2rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--gray-400)',
          letterSpacing: '0.08em',
          lineHeight: 1.7,
        }}>
          By entering, you acknowledge that cringe is a form of courage.
          <span style={{ color: 'var(--rust)' }}> // CJP</span>
        </p>
      </div>
    </div>
  );
}
