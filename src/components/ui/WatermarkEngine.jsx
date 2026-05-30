import React, { useRef } from 'react';
import iconDownload from '../../assets/images/icon-download.png';

/**
 * WatermarkEngine
 * Renders a download icon that, when clicked, applies a high-quality watermark
 * to the artwork via off-screen Canvas and triggers a JPEG download.
 *
 * Props:
 *   imageUrl  — CDN URL of the original artwork
 *   title     — Artwork title (not used in watermark but passed for filename)
 *   username  — Creator username (e.g. "johndoe" — rendered as "@johndoe")
 */
export default function WatermarkEngine({ imageUrl, title, username }) {
  const canvasRef = useRef(null);

  const handleDownload = () => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Off-screen canvas at full resolution
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      // 1. Draw the original image
      ctx.drawImage(img, 0, 0);

      // 2. Bottom gradient overlay (150px from bottom, scaled to canvas height)
      const gradientH = Math.min(150, canvas.height * 0.18);
      const gradientY = canvas.height - gradientH;
      const grad = ctx.createLinearGradient(0, gradientY, 0, canvas.height);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.82)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, gradientY, canvas.width, gradientH);

      // 3. Line 1 — "THE PARADOX GALLERY" (Playfair Display, ~4% of width)
      const line1Size = Math.round(canvas.width * 0.04);
      ctx.font       = `700 ${line1Size}px 'Playfair Display', Georgia, serif`;
      ctx.fillStyle  = 'rgba(249, 248, 245, 0.92)';
      ctx.textAlign  = 'left';
      ctx.textBaseline = 'alphabetic';

      const paddingX = canvas.width * 0.03;
      const line1Y   = canvas.height - gradientH * 0.25;
      ctx.fillText('THE PARADOX GALLERY', paddingX, line1Y);

      // 4. Line 2 — "Artwork by @username" (Inter, ~2.5% of width)
      const line2Size = Math.round(canvas.width * 0.025);
      ctx.font        = `400 ${line2Size}px 'Inter', system-ui, sans-serif`;
      ctx.fillStyle   = 'rgba(200, 75, 49, 0.9)';
      const line2Y    = line1Y + line1Size * 1.3;
      ctx.fillText(`Artwork by @${username || 'unknown'}`, paddingX, line2Y);

      // 5. Force download as JPEG 0.95
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const a = document.createElement('a');
      a.href     = dataUrl;
      a.download = `paradox-${(title || 'artwork').toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    img.onerror = () => {
      // Fallback: direct download if CORS blocked
      const a = document.createElement('a');
      a.href     = imageUrl;
      a.download = `${title || 'artwork'}.jpg`;
      a.target   = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    img.src = imageUrl;
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />
      <button
        className="art-card__icon-btn"
        onClick={(e) => { e.stopPropagation(); handleDownload(); }}
        title="Download with watermark"
        aria-label="Download artwork"
      >
        <img src={iconDownload} alt="Download" />
      </button>
    </>
  );
}
