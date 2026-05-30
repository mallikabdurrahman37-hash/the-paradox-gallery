import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { logoutUser } from '../../services/firebase';
import logoImg from '../../assets/images/logo.png';
import iconMenu from '../../assets/images/icon-menu.png';
import iconClose from '../../assets/images/icon-close.png';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation">
      <div className="navbar__inner">
        {/* Logo */}
        <NavLink to="/" className="navbar__logo" aria-label="The Paradox Gallery">
          <img src={logoImg} alt="The Paradox Gallery" />
        </NavLink>

        {/* Desktop Links */}
        <div className="navbar__links" role="menubar">
          {['/', '/creators', '/lab', '/about'].map(([path, label]) =>
            [
              ['/', 'Gallery'],
              ['/creators', 'Creators'],
              ['/lab', 'The Lab'],
              ['/about', 'Manifesto'],
            ].find(([p]) => p === path)
          ).filter(Boolean)}
          {[
            ['/', 'Gallery'],
            ['/creators', 'Creators'],
            ['/lab', 'The Lab'],
            ['/about', 'Manifesto'],
          ].map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
              role="menuitem"
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="navbar__actions">
          {user ? (
            <>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--rust)',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/dashboard')}
              >
                @{profile?.username || 'you'}
              </span>
              <button className="btn btn--outline" style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }} onClick={handleLogout}>
                Exit
              </button>
            </>
          ) : (
            <button className="btn btn--primary" onClick={() => navigate('/auth')}>
              Enter
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="navbar__menu-btn btn btn--ghost"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <img src={menuOpen ? iconClose : iconMenu} alt="" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'calc(var(--alert-h) + var(--nav-h))',
            left: 0,
            right: 0,
            background: 'var(--bg)',
            borderBottom: '1px solid var(--gray-200)',
            padding: '1.5rem clamp(1rem, 4vw, 3rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            zIndex: 850,
          }}
        >
          {[['/', 'Gallery'], ['/creators', 'Creators'], ['/lab', 'The Lab'], ['/about', 'Manifesto']].map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className="navbar__link"
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: '1.1rem' }}
            >
              {label}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/dashboard" className="navbar__link" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.1rem' }}>
              Dashboard
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
}
