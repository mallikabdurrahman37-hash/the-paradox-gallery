import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArtworks } from '../services/firebase';
import ArtGrid from '../components/gallery/ArtGrid';
import { initHeroEntrance, initSectionHeadings } from '../styles/animations';

const Scene = lazy(() => import('../components/3d/Scene'));

// Artwork Detail Modal
function ArtModal({ artwork, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="upload-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={artwork.title}
    >
      <div
        style={{
          background: 'var(--bg)',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderTop: '3px solid var(--rust)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ padding: '2.5rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rust)', marginBottom: '0.75rem' }}>
            Original Work
          </p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            {artwork.title}
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--rust)', marginBottom: '1.5rem' }}>
            @{artwork.username}
          </p>
          {artwork.description && (
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {artwork.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="tag">{artwork.likesCount || 0} likes</span>
            <span className="tag">{artwork.views || 0} views</span>
          </div>
          <button
            className="btn btn--outline"
            style={{ marginTop: '2rem', width: '100%' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArt, setSelectedArt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    initHeroEntrance();
    initSectionHeadings();
  }, []);

  useEffect(() => {
    getArtworks()
      .then(setArtworks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__copy">
          <p className="hero__label" data-anim="heading">The Paradox Gallery</p>
          <h1 className="hero__title">
            Where <em>Cringe</em><br />Becomes Art
          </h1>
          <p className="hero__subtitle">
            An underground sanctuary for work the algorithm refuses to understand.
            Upload. Be seen. Be remembered.
          </p>
          <div className="hero__ctas">
            <button className="btn btn--primary" onClick={() => navigate('/dashboard')}>
              Submit Your Work
            </button>
            <button className="btn btn--outline" onClick={() => navigate('/about')}>
              Read The Manifesto
            </button>
          </div>
        </div>

        <div className="hero__scene" aria-hidden="true">
          <Suspense fallback={<div style={{ width: '100%', height: '100%' }} />}>
            <Scene />
          </Suspense>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1rem, 4vw, 3rem) 8rem' }}>
        <div className="section__header" data-anim="heading" style={{ marginBottom: '2.5rem' }}>
          <p className="section__eyebrow">Selected Works</p>
          <h2 className="section__title">The Collection</h2>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gray-400)' }}>
              Curating the collection…
            </p>
          </div>
        ) : (
          <ArtGrid artworks={artworks} onOpenArt={setSelectedArt} />
        )}
      </section>

      {selectedArt && (
        <ArtModal artwork={selectedArt} onClose={() => setSelectedArt(null)} />
      )}
    </>
  );
}
