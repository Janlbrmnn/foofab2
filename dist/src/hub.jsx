// Hub — three paths: configure, inspire, collaborate

const HubCard = ({ idx, kw, title, sub, meta, onClick, active, slot, slotLabel }) => (
  <button
    onClick={onClick}
    style={{
      textAlign: 'left',
      padding: '24px',
      border: '1px solid var(--line)',
      background: active ? 'var(--bg-2)' : 'transparent',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      transition: 'all 200ms cubic-bezier(.2,.8,.2,1)',
      position: 'relative',
      cursor: 'pointer',
      color: 'inherit',
      minHeight: '460px',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--fg-3)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--bg-2)' : 'transparent'; e.currentTarget.style.borderColor = 'var(--line)'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.15em', color: 'var(--fg-3)' }}>
      <span>[ 0{idx} / {kw} ]</span>
      <Arrow dir="up" size={12} />
    </div>

    {/* visual */}
    <ImgSlot slot={slot} label={slotLabel} group="hub" style={{ height: '220px', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--bg)', border: '1px solid var(--fg-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width={24} height={24} viewBox="0 0 64 64" fill="none">
            <path d="M32 10 V 30" stroke="var(--fg)" strokeWidth="5" strokeLinecap="square" />
            <path d="M 20 18 A 16 16 0 1 0 44 18" stroke="var(--fg)" strokeWidth="5" strokeLinecap="square" fill="none" />
          </svg>
        </div>
      </div>
      <span style={{ position: 'absolute', bottom: 8, left: 10 }}>placeholder / {meta}</span>
    </ImgSlot>

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <h3 style={{
          fontSize: 'calc(28px * var(--scale))',
          fontWeight: 400,
          letterSpacing: '-0.02em',
          marginBottom: 12,
          lineHeight: 1.15,
        }}>{title}</h3>
        <p style={{ color: 'var(--fg-2)', fontSize: 'calc(12px * var(--scale))', lineHeight: 1.6 }}>
          {sub}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px dashed var(--line)' }}>
        <span style={{ fontSize: 'calc(10px * var(--scale))', color: 'var(--fg-3)', letterSpacing: '0.1em' }}>öffnen</span>
        <Arrow dir="right" size={14} />
      </div>
    </div>
  </button>
);

const Hub = ({ onGo }) => {
  return (
    <div className="page-pad" style={{ padding: '96px 32px 48px', maxWidth: 1440, margin: '0 auto' }}>
      {/* Header */}
      <div className="m-stack" style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 32,
        alignItems: 'end',
        marginBottom: 48,
        paddingBottom: 24,
        borderBottom: '1px solid var(--line)',
      }}>
        <div>
          <div style={{ color: 'var(--fg-3)', fontSize: 'calc(11px * var(--scale))', letterSpacing: '0.2em', marginBottom: 20 }}>
            [ 002 / create ]
          </div>
          <h2 style={{
            fontSize: 'calc(36px * var(--scale))',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            maxWidth: 820,
          }}>
            wir geben dir verschiedene<br/>
            wege, menschen zu <span className="word-em" style={{ fontSize: '1.1em', color: 'var(--accent)' }}>begeistern</span>.
          </h2>
        </div>
        <div style={{ textAlign: 'right', color: 'var(--fg-2)', fontSize: 'calc(11px * var(--scale))', lineHeight: 1.7 }}>
          <div>sour pickle gummies</div>
          <div>+ external cheese pairing</div>
          <div style={{ color: 'var(--fg-3)' }}>— demo account: @foodcreator.hh</div>
        </div>
      </div>

      {/* Three cards */}
      <div className="m-stack" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24,
      }}>
        <HubCard
          idx={1}
          kw="configure"
          title={<>konfiguriere.</>}
          sub="starte von einem basis-produkt. wähle form, geschmack, verpackung. lauf in 24 stunden durch den konfigurator, in tagen statt monaten am markt."
          meta="process diagram"
          slot="hub.configure" slotLabel="hub · configure"
          onClick={() => onGo('config')}
        />
        <HubCard
          idx={2}
          kw="inspire"
          title={<>inspiriere dich.</>}
          sub="live-feed aus trending drops, community-briefs und kategorien, die gerade durchstarten. lass dich von uns inspirieren und entwickle dein eigenes ding."
          meta="trend feed"
          slot="hub.inspire" slotLabel="hub · inspire"
          onClick={() => onGo('inspire')}
        />
        <HubCard
          idx={3}
          kw="collab"
          title={<>kollaboriere.</>}
          sub="finde marken und creator, die deine sprache sprechen. co-branded launches mit etablierten häusern — pulmoll, ronnefeldt und weiteren."
          meta="partner matrix"
          slot="hub.collab" slotLabel="hub · collab"
          onClick={() => onGo('collab')}
        />
      </div>

      {/* stats strip */}
      <div className="m-stack-2" style={{
        marginTop: 48,
        padding: '32px 0',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 32,
      }}>
        {[
          { k: '18,000', v: 'units · 24h launch' },
          { k: '5M+',    v: 'views · organic reach' },
          { k: '~75%',   v: 'hook rate' },
          { k: '71%',    v: 'creator gross margin' },
        ].map((s, i) => (
          <div key={i}>
            <div className="tabular" style={{
              fontSize: 'calc(32px * var(--scale))',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>{s.k}</div>
            <div style={{ marginTop: 10, color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.12em' }}>
              {s.v}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 48,
        display: 'flex', justifyContent: 'space-between',
        color: 'var(--fg-3)',
        fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.15em',
      }}>
        <span>pipeline / 150 concepts</span>
        <span>→ scroll</span>
        <span>creators / 50 live</span>
      </div>
    </div>
  );
};

window.Hub = Hub;
