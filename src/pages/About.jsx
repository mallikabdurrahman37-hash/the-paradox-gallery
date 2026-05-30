import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  return (
    <main role="main">
      <div className="manifesto">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rust)', marginBottom: '1rem' }}>
          The Manifesto
        </p>
        <h1>On the<br /><em style={{ color: 'var(--rust)' }}>Art of Being</em><br />Unseen</h1>

        <hr className="hr" />

        <p>
          The algorithm is not neutral. It is a machine designed to reward familiarity —
          to amplify what already exists, to bury what refuses to conform. In this world,
          "engagement" has become the sole metric of worth, and anything that fails to
          generate a click is deemed worthless.
        </p>

        <p>
          We reject this entirely.
        </p>

        <blockquote>
          "Cringe is what we call art that hasn't found its audience yet."
        </blockquote>

        <p>
          The Paradox Gallery was born from a simple belief: that the works most alive are
          often the ones most suppressed. The raw sketch. The unfinished thought. The image
          that makes the viewer uncomfortable precisely because it is <em>true</em>.
        </p>

        <p>
          We are not here to go viral. We are here to go <span className="rust">deep</span>.
        </p>

        <hr className="hr" />

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
          The CJP Movement
        </h2>

        <p>
          The Cockroach Janta Party (CJP) is not a political party. It is a state of mind.
          It is the understanding that the cockroach — despised, ignored, stepped on — will
          outlive everything that looked down upon it. The cockroach does not seek approval.
          It simply continues.
        </p>

        <p>
          Every artist who uploads to this gallery is a cockroach. Every upload is an act of
          defiance against the algorithm's silence. You are here. You made a thing. It exists.
          No platform can take that away from you.
        </p>

        <blockquote>
          "Be the cockroach. Survive everything. Create anyway."
        </blockquote>

        <p>
          The Gallery exists in the cracks. It lives in the spaces the mainstream refuses to look.
          Come as you are. Upload what you made. Let The Curator see it.
        </p>

        <hr className="hr" />

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray-400)', letterSpacing: '0.06em' }}>
          Founded somewhere, somewhen. <span style={{ color: 'var(--rust)' }}>// Anti-Algorithm Since Forever</span>
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem', flexWrap: 'wrap' }}>
          <button className="btn btn--primary" onClick={() => navigate('/')}>
            Enter The Gallery
          </button>
          <button className="btn btn--outline" onClick={() => navigate('/auth')}>
            Join The Movement
          </button>
        </div>
      </div>
    </main>
  );
}
