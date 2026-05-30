import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthChange, getUserProfile } from './services/firebase';
import Navbar from './components/ui/Navbar';
import AIChatbot from './components/ui/AIChatbot';
import Home from './pages/Home';
import Creators from './pages/Creators';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Lab from './pages/Lab';
import Auth from './pages/Auth';

// ── Auth Context ──────────────────────────────────────────────────
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// ── Username Guard Modal ──────────────────────────────────────────
function UsernameGuard({ user, profile, onComplete }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const val = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!val || val.length < 3) {
      setError('Username must be at least 3 characters (a–z, 0–9, _)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { setUsername: saveUsername } = await import('./services/firebase');
      await saveUsername(user.uid, val);
      onComplete(val);
    } catch (e) {
      setError(e.message || 'Failed to save username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="username-guard">
      <div className="username-guard__box">
        <h2>Choose Your Identity</h2>
        <p>Before entering the gallery, you must be named. This cannot be undone.</p>
        <div className="form-group" style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_handle"
            maxLength={24}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          {error && <p className="form-error">{error}</p>}
        </div>
        <button
          className="btn btn--primary"
          style={{ width: '100%' }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Enter The Gallery'}
        </button>
      </div>
    </div>
  );
}

// ── Protected Route ───────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();
  if (loadingAuth) return null;
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  return children;
}

// ── CJP Banner ────────────────────────────────────────────────────
function CJPBanner() {
  const msg = '⚡ THE CJP MOVEMENT — COCKROACH JANTA PARTY — CRINGE IS UNRECOGNIZED GENIUS — ANTI-ALGORITHM SINCE FOREVER — WHERE CRINGE BECOMES ART — ';
  return (
    <div className="cjp-banner" aria-label="CJP Movement Banner">
      <div className="cjp-banner__ticker">
        <span>{msg}<span className="accent">★ CJP ★</span> {msg}<span className="accent">★ CJP ★</span> {msg}</span>
        <span>{msg}<span className="accent">★ CJP ★</span> {msg}<span className="accent">★ CJP ★</span> {msg}</span>
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────
function AppShell() {
  return (
    <>
      <CJPBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/creators" element={<Creators />} />
        <Route path="/about" element={<About />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AIChatbot />
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const p = await getUserProfile(firebaseUser.uid);
          if (p) {
            setProfile(p);
            if (!p.username || p.username.trim() === '') {
              setNeedsUsername(true);
            }
          } else {
            setNeedsUsername(true);
          }
        } catch {
          /* non-fatal */
        }
      } else {
        setProfile(null);
        setNeedsUsername(false);
      }
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  const handleUsernameSet = (username) => {
    setProfile((p) => ({ ...p, username }));
    setNeedsUsername(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loadingAuth, setProfile }}>
      <BrowserRouter>
        {needsUsername && user && (
          <UsernameGuard user={user} profile={profile} onComplete={handleUsernameSet} />
        )}
        <AppShell />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
