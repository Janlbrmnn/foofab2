// Collab — partner matrix, creator/brand matching

const BRANDS = [
  { name: 'pulmoll',    kind: 'brand',   cat: 'hard candy',   since: '1949', fit: 92, open: true,  note: 'modernisierung durch creator-led storytelling' },
  { name: 'ronnefeldt', kind: 'brand',   cat: 'tea',          since: '1823', fit: 87, open: true,  note: 'tea-inspired gummies / functional infusions' },
  { name: 'kalfany',    kind: 'brand',   cat: 'hard candy',   since: '1923', fit: 84, open: false, note: 'premium-formate · custom dosen' },
  { name: 'schwarzwald-milch', kind: 'brand', cat: 'dairy',  since: '1931', fit: 78, open: true, note: 'cheese-pairing drops möglich' },
];

const CREATORS = [
  { name: 'rené schmock',   kind: 'creator', cat: 'culinary', reach: '2.4M', fit: 95, open: true,  note: 'launch-case · 18k units / 24h' },
  { name: 'andreas herb',   kind: 'creator', cat: 'lifestyle',reach: '1.8M', fit: 89, open: true,  note: 'gummy co-drop november 2025' },
  { name: '@mamakollektiv', kind: 'creator', cat: 'mom',      reach: '412k', fit: 76, open: true,  note: 'parenting-community · hoch loyal' },
  { name: '@hannah.lifts',  kind: 'creator', cat: 'fitness',  reach: '980k', fit: 82, open: false, note: 'recovery-gummy wip' },
];

// Desktop row: horizontal, information-dense
const DesktopRow = ({ item, onPick, picked }) => (
  <button
    onClick={onPick}
    className="collab-row-desktop"
    style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto auto auto',
      alignItems: 'center',
      gap: 20,
      padding: '16px 16px',
      border: `1px solid ${picked ? 'var(--fg)' : 'var(--line)'}`,
      background: picked ? 'var(--bg-2)' : 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      marginBottom: -1,
      transition: 'all 140ms',
    }}
  >
    <ImgSlot slot={`collab.${item.kind}.${item.name.replace(/[^a-z0-9]/gi, '').toLowerCase()}`} label={`${item.kind} · ${item.name}`} group={`collab · ${item.kind}s`} style={{ width: 48, height: 48, fontSize: 8 }}>
      logo
    </ImgSlot>
    <div>
      <div style={{ fontSize: 'calc(15px * var(--scale))', letterSpacing: '-0.01em' }}>{item.name}</div>
      <div style={{ color: 'var(--fg-3)', fontSize: 'calc(11px * var(--scale))', marginTop: 2 }}>
        {item.kind} · {item.cat} {item.since ? `· est. ${item.since}` : item.reach ? `· reach ${item.reach}` : ''}
      </div>
    </div>
    <div style={{ fontSize: 'calc(11px * var(--scale))', color: 'var(--fg-2)', maxWidth: 260, textAlign: 'right' }}>
      {item.note}
    </div>
    <div style={{ width: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.15em', color: 'var(--fg-3)', marginBottom: 4 }}>
        <span>fit</span>
        <span className="tabular" style={{ color: 'var(--fg)' }}>{item.fit}</span>
      </div>
      <div style={{ height: 2, background: 'var(--line)' }}>
        <div style={{ height: '100%', width: `${item.fit}%`, background: 'var(--accent)' }} />
      </div>
    </div>
    <div style={{ fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.15em', color: item.open ? 'var(--fg)' : 'var(--fg-3)' }}>
      {item.open ? '● offen' : '○ warteliste'}
    </div>
  </button>
);

// Mobile card: vertical, feed-style
const MobileCard = ({ item, onPick, picked }) => (
  <button
    onClick={onPick}
    className="collab-card-mobile"
    style={{
      display: 'block',
      padding: 18,
      border: `1px solid ${picked ? 'var(--fg)' : 'var(--line)'}`,
      background: picked ? 'var(--bg-2)' : 'var(--bg)',
      color: 'inherit',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      marginBottom: 12,
      transition: 'all 140ms',
    }}
  >
    {/* top row: logo + name + status */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
      <ImgSlot slot={`collab.${item.kind}.${item.name.replace(/[^a-z0-9]/gi, '').toLowerCase()}`} label={`${item.kind} · ${item.name}`} group={`collab · ${item.kind}s`} style={{ width: 52, height: 52, fontSize: 8, flexShrink: 0 }}>
        logo
      </ImgSlot>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'calc(17px * var(--scale))', letterSpacing: '-0.01em', marginBottom: 3 }}>{item.name}</div>
        <div style={{ color: 'var(--fg-3)', fontSize: 'calc(11px * var(--scale))', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {item.kind} · {item.cat}
        </div>
      </div>
      <div style={{ fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.12em', color: item.open ? 'var(--accent)' : 'var(--fg-3)', flexShrink: 0 }}>
        {item.open ? '● offen' : '○ warte'}
      </div>
    </div>

    {/* note */}
    <div style={{ fontSize: 'calc(13px * var(--scale))', color: 'var(--fg-2)', lineHeight: 1.5, marginBottom: 16 }}>
      {item.note}
    </div>

    {/* stats row */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 14, borderTop: '1px dashed var(--line)' }}>
      <div>
        <div style={{ fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.15em', color: 'var(--fg-3)', marginBottom: 4 }}>
          {item.since ? 'est.' : 'reach'}
        </div>
        <div className="tabular" style={{ fontSize: 'calc(14px * var(--scale))' }}>
          {item.since || item.reach}
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.15em', color: 'var(--fg-3)', marginBottom: 4 }}>
          <span>fit</span>
          <span className="tabular" style={{ color: 'var(--fg)' }}>{item.fit}</span>
        </div>
        <div style={{ height: 3, background: 'var(--line)', marginTop: 8 }}>
          <div style={{ height: '100%', width: `${item.fit}%`, background: 'var(--accent)' }} />
        </div>
      </div>
    </div>
  </button>
);

const Row = ({ item, onPick, picked }) => (
  <>
    <div className="mobile-hide-inline">
      <DesktopRow item={item} onPick={onPick} picked={picked} />
    </div>
    <div className="desktop-hide-inline">
      <MobileCard item={item} onPick={onPick} picked={picked} />
    </div>
  </>
);

const Collab = () => {
  const [mode, setMode] = React.useState('brands'); // brands | creators
  const [picked, setPicked] = React.useState(null);
  const data = mode === 'brands' ? BRANDS : CREATORS;
  const pickedItem = data.find(d => d.name === picked);

  return (
    <div className="page-pad" style={{ padding: '80px 32px 48px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--line)', marginBottom: 28 }}>
        <div style={{ color: 'var(--fg-3)', fontSize: 'calc(11px * var(--scale))', letterSpacing: '0.2em', marginBottom: 12 }}>
          [ kollaboration / matrix ]
        </div>
        <h2 style={{ fontSize: 'calc(28px * var(--scale))', fontWeight: 400, letterSpacing: '-0.02em' }}>
          finde, wer deine <span className="word-em" style={{ fontSize: '1.1em', color: 'var(--accent)' }}>sprache</span> spricht.
        </h2>
      </div>

      {/* toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--line)', marginBottom: 20 }}>
        {['brands', 'creators'].map(m => (
          <button key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '16px 12px',
              background: mode === m ? 'var(--fg)' : 'transparent',
              color: mode === m ? 'var(--bg)' : 'var(--fg-2)',
              cursor: 'pointer',
              fontSize: 'calc(13px * var(--scale))',
              letterSpacing: '0.02em',
              borderRight: m === 'brands' ? '1px solid var(--line)' : 'none',
              minHeight: 48,
            }}
          >
            {m === 'brands' ? 'marken' : 'creator'} · {m === 'brands' ? BRANDS.length : CREATORS.length}
          </button>
        ))}
      </div>

      {/* rows */}
      <div>
        {data.map((d) => (
          <Row key={d.name} item={d} picked={picked === d.name} onPick={() => setPicked(d.name)} />
        ))}
      </div>

      {/* pairing detail */}
      <div className="collab-pairing" style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ padding: 24, border: '1px solid var(--line)' }}>
          <div style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em', marginBottom: 12 }}>
            [ co-drop concept ]
          </div>
          <div style={{ fontSize: 'calc(22px * var(--scale))', lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: 20 }}>
            {picked || 'pulmoll'} × @foodcreator.hh
          </div>
          <div style={{ color: 'var(--fg-2)', fontSize: 'calc(13px * var(--scale))', lineHeight: 1.7 }}>
            funktionale lozenges, re-interpretiert als snackable-format. co-branded verpackung, shared upside, launch über spätciety-drop.
          </div>
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: 'calc(11px * var(--scale))' }}>
            <div>
              <div style={{ color: 'var(--fg-3)', letterSpacing: '0.12em', marginBottom: 4 }}>timeline</div>
              <div>~6 wochen</div>
            </div>
            <div>
              <div style={{ color: 'var(--fg-3)', letterSpacing: '0.12em', marginBottom: 4 }}>moq</div>
              <div className="tabular">5.000</div>
            </div>
            <div>
              <div style={{ color: 'var(--fg-3)', letterSpacing: '0.12em', marginBottom: 4 }}>split</div>
              <div>50 / 50</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 24, background: 'var(--bg-2)', border: '1px solid var(--line)' }}>
          <div style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em', marginBottom: 12 }}>
            [ anfrage senden ]
          </div>
          <textarea
            defaultValue="hey pulmoll — ich entwickle gerade eine sour-pickle gummy-serie und sehe eine schnittmenge zwischen eurem hals/cough-heritage und meinem culinary-publikum. lass uns über einen co-drop sprechen?"
            style={{
              width: '100%',
              minHeight: 120,
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              padding: 12,
              color: 'var(--fg)',
              fontFamily: 'inherit',
              fontSize: 'calc(12px * var(--scale))',
              resize: 'vertical',
              lineHeight: 1.6,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 12, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.15em' }}>
              antwort in ~3 werktagen
            </span>
            <button style={{
              padding: '14px 22px',
              background: 'var(--accent)', color: 'var(--accent-ink)',
              border: 'none', cursor: 'pointer',
              fontSize: 'calc(12px * var(--scale))', fontWeight: 700, letterSpacing: '0.05em',
              minHeight: 44,
            }}>
              → senden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Collab = Collab;
