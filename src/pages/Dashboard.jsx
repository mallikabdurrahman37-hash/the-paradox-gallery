import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { getArtworksByUser, addArtwork, db } from '../services/firebase';
import { uploadToCloudinary } from '../services/cloudinary';
import ArtGrid from '../components/gallery/ArtGrid';

// ── Upload Modal ──────────────────────────────────────────────────
function UploadModal({ username, uid, onClose, onSuccess }) {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const fileRef = useRef(null);

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    if (f.size > 20 * 1024 * 1024) { setError('Max file size is 20MB.'); return; }
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Select an image.'); return; }
    if (!title.trim()) { setError('Give your artwork a title.'); return; }
    setLoading(true);
    setError('');
    try {
      const uploaded = await uploadToCloudinary(file, setUploadProgress);
      await addArtwork({
        uid,
        username,
        title: title.trim(),
        description: description.trim(),
        imageUrl: uploaded.url,
        publicId: uploaded.publicId,
        width: uploaded.width,
        height: uploaded.height,
      });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Upload Artwork">
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal__header">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Submit Work</h3>
          <button className="btn btn--ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Image Drop Zone */}
        <div
          style={{
            border: '1px dashed var(--gray-200)',
            padding: preview ? '0' : '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
          {preview ? (
            <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover' }} />
          ) : (
            <>
              <p style={{ fontSize: '2rem', color: 'var(--gray-200)', marginBottom: '0.5rem' }}>+</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                Drop image or click
              </p>
            </>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name your creation"
            maxLength={80}
            disabled={loading}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Artist Statement (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What does this mean? Or doesn't it?"
            rows={3}
            maxLength={400}
            disabled={loading}
            style={{ resize: 'vertical' }}
          />
        </div>

        {loading && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ height: 2, background: 'var(--gray-100)', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--rust)', width: `${uploadProgress}%`, transition: 'width 0.1s' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '0.4rem' }}>
              Uploading… {uploadProgress}%
            </p>
          </div>
        )}

        {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

        <button className="btn btn--primary" style={{ width: '100%', padding: '0.9rem' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Uploading…' : 'Submit to Gallery'}
        </button>
      </div>
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile } = useAuth();
  const [artworks, setArtworks]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const loadArtworks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getArtworksByUser(user.uid);
      setArtworks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadArtworks(); }, [user]);

  const totalLikes = artworks.reduce((s, a) => s + (a.likesCount || 0), 0);
  const totalViews = artworks.reduce((s, a) => s + (a.views || 0), 0);

  return (
    <div className="dashboard" role="main">
      {showUpload && (
        <UploadModal
          username={profile?.username || 'unknown'}
          uid={user?.uid}
          onClose={() => setShowUpload(false)}
          onSuccess={loadArtworks}
        />
      )}

      {/* Header */}
      <div className="dashboard__header">
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--rust)', marginBottom: '0.4rem' }}>
            Creator Portal
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>
            @{profile?.username || '…'}
          </h1>
        </div>
        <button className="btn btn--primary" onClick={() => setShowUpload(true)}>
          + Submit Work
        </button>
      </div>

      {/* Stats */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__num">{artworks.length}</div>
          <div className="stat-card__label">Works</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__num">{totalLikes}</div>
          <div className="stat-card__label">Total Likes</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__num">{totalViews}</div>
          <div className="stat-card__label">Total Views</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__num" style={{ color: 'var(--rust)' }}>CJP</div>
          <div className="stat-card__label">Movement</div>
        </div>
      </div>

      {/* Artworks */}
      <div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '2rem' }}>
          Your Submissions
        </p>
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
          </div>
        ) : (
          <ArtGrid artworks={artworks} />
        )}
      </div>
    </div>
  );
}
