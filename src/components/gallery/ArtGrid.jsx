import React, { useEffect, useRef } from 'react';
import ArtCard from './ArtCard';
import { initMasonryScrollAnim, killAllTriggers } from '../../styles/animations';

export default function ArtGrid({ artworks, onOpenArt }) {
  const gridRef = useRef(null);

  useEffect(() => {
    if (!artworks?.length) return;
    // Wait a tick for DOM paint
    const tid = setTimeout(() => {
      initMasonryScrollAnim('.art-grid', '.art-grid__item');
    }, 80);
    return () => {
      clearTimeout(tid);
      killAllTriggers();
    };
  }, [artworks]);

  if (!artworks?.length) {
    return (
      <div className="empty-state">
        <h3>The Gallery Awaits</h3>
        <p>No artworks yet. Be the first to submit something cringe-worthy.</p>
      </div>
    );
  }

  return (
    <div className="art-grid" ref={gridRef} role="list">
      {artworks.map((art) => (
        <div className="art-grid__item" key={art.id} role="listitem">
          <ArtCard artwork={art} onOpen={onOpenArt} />
        </div>
      ))}
    </div>
  );
}
