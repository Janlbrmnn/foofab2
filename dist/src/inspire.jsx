// Inspire feed — trending drops, briefs, categories

const TRENDING = [
  { k: '01', tag: 'fitness', title: 'protein recovery gummies', author: '@hannah.lifts', stat: '+482% search', trend: 'up', views: '2.1M' },
  { k: '02', tag: 'culinary', title: 'sour pickle × smoked cheese', author: '@foodcreator.hh', stat: 'drop in 3d', trend: 'live', views: '5.4M' },
  { k: '03', tag: 'party', title: 'lemon-salt tequila gummies', author: '@nightshift.collab', stat: '+214% saves', trend: 'up', views: '890k' },
  { k: '04', tag: 'mom', title: 'low-sugar kids vitamins', author: '@mamakollektiv', stat: '4.8★ community', trend: 'steady', views: '1.3M' },
  { k: '05', tag: 'wellness', title: 'chamomile sleep chews', author: '@laura.calm', stat: 'sold out · reorder', trend: 'up', views: '720k' },
  { k: '06', tag: 'culture', title: 'döner-inspired hard candy', author: '@kreuzberg.kids', stat: 'waitlist: 12k', trend: 'live', views: '3.2M' },
];

const BRIEFS = [
  { kw: 'brief', title: 'design a functional gummy for late-night studio sessions', bounty: '€8.000 + rev share' },
  { kw: 'brief', title: 'co-branded advent calendar — 24 creator drops', bounty: 'curated slots · 6 left' },
  { kw: 'brief', title: 'protein chew for post-lift — 20g / serving', bounty: '€12.000 moq floor' },
];

const Inspire = ({ onConfig }) => {
  const [filter, setFilter] = React.useState('alle');
  const tags = ['alle', 'fitness', 'culinary', 'party', 'mom', 'wellness', 'culture'];
  const filtered = TRENDING.filter(t => filter === 'alle' || t.tag === filter);

  return (
    <div className="page-pad" style={{ padding: '80px 32px 48px', maxWidth: 1440, margin: '0 auto' }}>
      {/* header */}
      <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--line)', marginBottom: 24 }}>
        <div className="inspire-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: 'var(--fg-3)', fontSize: 'calc(11px * var(--scale))', letterSpacing: '0.2em', marginBottom: 12 }}>
              [ inspiration / live feed ]
            </div>
            <h2 style={{ fontSize: 'calc(28px * var(--scale))', fontWeight: 400, letterSpacing: '-0.02em' }}>
              was gerade <span className="word-em" style={{ fontSize: '1.1em', color: 'var(--accent)' }}>durchstartet</span>.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'calc(11px * var(--scale))', color: 'var(--fg-3)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'blink 1.2s step-end infinite' }} />
            updated · gerade eben
          </div>
        </div>
      </div>

      {/* filter tags — horizontal scroll on mobile */}
      <div className="inspire-tags" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {tags.map(t => (
          <button key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: '10px 16px',
              border: `1px solid ${filter === t ? 'var(--fg)' : 'var(--line)'}`,
              background: filter === t ? 'var(--fg)' : 'transparent',
              color: filter === t ? 'var(--bg)' : 'var(--fg-2)',
              fontSize: 'calc(11px * var(--scale))',
              cursor: 'pointer',
              transition: 'all 140ms',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            #{t}
          </button>
        ))}
      </div>

      {/* trending grid — 3 col desktop, 1 col mobile (big feed cards) */}
      <div className="inspire-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {filtered.map((t, i) => (
          <article key={t.k} className="fade-up inspire-card" style={{
            border: '1px solid var(--line)',
            padding: 16,
            background: 'var(--bg)',
            display: 'flex', flexDirection: 'column', gap: 14,
            transition: 'all 200ms',
            animationDelay: `${i * 60}ms`,
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg-3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
          >
            <div className="inspire-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'calc(10px * var(--scale))', color: 'var(--fg-3)', letterSpacing: '0.15em' }}>
              <span>[ {t.k} ]</span>
              <span>#{t.tag}</span>
            </div>
            <ImgSlot slot={`inspire.${t.k}`} label={`inspire · ${t.tag}`} group="inspire" style={{ aspectRatio: '4/3' }}>
              product shot · {t.tag}
            </ImgSlot>
            <div>
              <div className="inspire-title" style={{ fontSize: 'calc(16px * var(--scale))', lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: 6 }}>
                {t.title}
              </div>
              <div style={{ fontSize: 'calc(11px * var(--scale))', color: 'var(--fg-3)' }}>
                {t.author} · {t.views} views
              </div>
            </div>
            <div className="inspire-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px dashed var(--line)', fontSize: 'calc(11px * var(--scale))' }}>
              <span style={{ color: t.trend === 'up' ? 'var(--accent)' : 'var(--fg-2)' }}>
                {t.trend === 'up' ? '↗' : t.trend === 'live' ? '●' : '→'} {t.stat}
              </span>
              <button
                onClick={onConfig}
                className="inspire-remix"
                style={{ color: 'var(--fg-2)', cursor: 'pointer', padding: '8px 12px', border: '1px solid var(--line)', background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-2)'}
              >remix →</button>
            </div>
          </article>
        ))}
      </div>

      {/* briefs */}
      <div style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
        <div className="brief-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: 'calc(20px * var(--scale))', fontWeight: 400, letterSpacing: '-0.01em' }}>
            offene briefs von marken.
          </h3>
          <span style={{ color: 'var(--fg-3)', fontSize: 'calc(11px * var(--scale))', letterSpacing: '0.12em' }}>
            3 offen · 18 bewerbungen
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {BRIEFS.map((b, i) => (
            <button key={i}
              onClick={onConfig}
              className="brief-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr auto auto',
                alignItems: 'center',
                gap: 24,
                padding: '20px 16px',
                borderTop: '1px solid var(--line)',
                borderBottom: i === BRIEFS.length - 1 ? '1px solid var(--line)' : 'none',
                color: 'inherit', cursor: 'pointer',
                transition: 'background 140ms',
                textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span className="brief-kw" style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em' }}>[ {b.kw} ]</span>
              <span className="brief-title" style={{ fontSize: 'calc(15px * var(--scale))' }}>{b.title}</span>
              <span className="brief-bounty" style={{ color: 'var(--fg-2)', fontSize: 'calc(11px * var(--scale))' }}>{b.bounty}</span>
              <Arrow dir="right" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

window.Inspire = Inspire;
