import React, { useEffect, useState } from 'react';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Creators() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.username);
        setCreators(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page-wrapper">
      <section className="section">
        <div className="section__header" data-anim="heading">
          <p className="section__eyebrow">The Artists</p>
          <h2 className="section__title">Meet The Creators</h2>
          <p style={{ marginTop: '1rem', maxWidth: 520 }}>
            These are the cockroaches. The survivors. The ones who upload anyway.
            They are the CJP Movement incarnate.
          </p>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : creators.length === 0 ? (
          <div className="empty-state">
            <h3>No Creators Yet</h3>
            <p>Be the first to join the gallery and make your mark.</p>
          </div>
        ) : (
          <div className="creator-grid">
            {creators.map((creator) => (
              <div className="creator-card" key={creator.id}>
                <div
                  className="creator-card__avatar"
                  style={{ background: `hsl(${creator.username?.charCodeAt(0) * 15 || 0}, 40%, 70%)` }}
                  aria-hidden="true"
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#fff' }}>
                    {creator.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="creator-card__name">{creator.username}</p>
                <p className="creator-card__handle">@{creator.username}</p>
                <p className="creator-card__bio" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.83rem', color: 'var(--gray-600)' }}>
                  {creator.bio || 'An artist of the underground. No further explanation needed.'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                  <span className="tag tag--rust">CJP</span>
                  <span className="tag">Member</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
