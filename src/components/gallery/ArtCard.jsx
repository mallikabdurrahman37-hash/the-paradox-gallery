import React, { useState, useCallback } from 'react';
import { useAuth } from '../../App';
import { toggleLike, incrementView } from '../../services/firebase';
import { getThumbnailUrl } from '../../services/cloudinary';
import WatermarkEngine from '../ui/WatermarkEngine';
import iconLike from '../../assets/images/icon-like.png';
import iconLikeFilled from '../../assets/images/icon-like-filled.png';
import iconShare from '../../assets/images/icon-share.png';

export default function ArtCard({ artwork, onOpen }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(
    user ? (artwork.likedBy || []).includes(user.uid) : false
  );
  const [likesCount, setLikesCount] = useState(artwork.likesCount || 0);
  const [likeAnim, setLikeAnim] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Handle card view count on click
  const handleOpen = useCallback(() => {
    incrementView(artwork.id).catch(() => {});
    onOpen?.(artwork);
  }, [artwork, onOpen]);

  // Like toggle — unauthenticated users can only increment
  const handleLike = async (e) => {
    e.stopPropagation();

    if (!user) {
      // Anonymous: increment only (no toggle, no UID tracking)
      setLikesCount((c) => c + 1);
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 300);
      try { await incrementLikeAnon(artwork.id); } catch {}
      return;
    }

    // Authenticated: full toggle
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount((c) => (prevLiked ? Math.max(0, c - 1) : c + 1));

    try {
      await toggleLike(artwork.id, user.uid);
    } catch {
      // Rollback on error
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = {
      title: artwork.title,
      text: `"${artwork.title}" by @${artwork.username} on The Paradox Gallery`,
      url: window.location.origin + `/?art=${artwork.id}`,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setSharing(true);
      setTimeout(() => setSharing(false), 1500);
    }
  };

  const thumbUrl = getThumbnailUrl(artwork.imageUrl);

  return (
    <div className="art-card" onClick={handleOpen} role="article" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
      aria-label={`${artwork.title} by @${artwork.username}`}
    >
      <div className="art-card__image-wrap">
        <img
          src={thumbUrl}
          alt={artwork.title}
          loading="lazy"
          width={400}
        />
        {/* Hover overlay with actions */}
        <div className="art-card__overlay" aria-hidden="true">
          <div className="art-card__actions">
            {/* Like */}
            <button
              className={`art-card__icon-btn${liked ? ' liked' : ''}${likeAnim ? ' liked' : ''}`}
              onClick={handleLike}
              aria-label={liked ? 'Unlike' : 'Like'}
              title={liked ? 'Unlike' : 'Like'}
            >
              <img src={liked ? iconLikeFilled : iconLike} alt="" />
            </button>

            {/* Download with Watermark */}
            <WatermarkEngine
              imageUrl={artwork.imageUrl}
              title={artwork.title}
              username={artwork.username}
            />

            {/* Share */}
            <button
              className="art-card__icon-btn"
              onClick={handleShare}
              aria-label="Share"
              title={sharing ? 'Link copied!' : 'Share'}
            >
              <img src={iconShare} alt={sharing ? '✓' : 'Share'} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="art-card__body">
        <p className="art-card__title">{artwork.title}</p>
        <div className="art-card__meta">
          <span className="art-card__username">@{artwork.username}</span>
          <span className="art-card__likes">
            <img src={likesCount > 0 && liked ? iconLikeFilled : iconLike} alt="" />
            {likesCount}
          </span>
        </div>
      </div>
    </div>
  );
}

// Anonymous like helper (no UID, just increment)
async function incrementLikeAnon(artworkId) {
  const { db } = await import('../../services/firebase');
  const { doc, updateDoc, increment } = await import('firebase/firestore');
  await updateDoc(doc(db, 'artworks', artworkId), { likesCount: increment(1) });
}
