// Landing — calmer, less text, more whitespace, tighter line-height

const Landing = ({ onEnter }) => {
  const [time, setTime] = React.useState(() => new Date());
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 768);
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const r = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', r);
    return () => { clearInterval(t); window.removeEventListener('resize', r); };
  }, []);
  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');

  // Mobile: stacked vertical layout centered; desktop: original spatial composition
  if (isMobile) {
    return (
      <div className="page" style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg)', minHeight: '100vh', padding: '72px 24px 32px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: 16, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 4 }}>
          <Wordmark height={22} />
          <div style={{ color: 'var(--fg-3)', fontSize: 10, letterSpacing: '0.15em' }}>hmb · {hh}:{mm}</div>
        </div>
        <h1 className="fade-up" style={{ fontSize: 'clamp(40px, 11vw, 64px)', lineHeight: 0.98, fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--fg)', marginTop: 32 }}>
          turn potential<br/>
          into <span className="word-em" style={{ fontSize: '1.06em', color: 'var(--accent)' }}>product</span>.
        </h1>
        <p className="fade-up" style={{ marginTop: 24, color: 'var(--fg-2)', fontSize: 14, lineHeight: 1.6, animationDelay: '160ms' }}>
          willkommen bei <span style={{ fontWeight: 600, color: 'var(--fg)' }}>foofab.</span>
        </p>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 32 }}>
          <PowerOrb size={180} pulsing onClick={onEnter} label="enter foofab" />
          <div style={{ marginTop: 18, color: 'var(--fg-3)', fontSize: 10, letterSpacing: '0.2em', animation: 'blink 2s step-end infinite' }}>
            [ press to begin ]
          </div>
        </div>
        <div style={{ marginTop: 32, fontSize: 16, color: 'var(--fg)', lineHeight: 1.15, textAlign: 'center' }}>
          be careful <span className="word-em" style={{ fontSize: '1.08em', color: 'var(--accent)' }}>—</span> this could turn <span className="word-em" style={{ fontSize: '1.08em', color: 'var(--accent)' }}>epic</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg)', minHeight: '100vh', height: 'max(780px, 100vh)' }}>
      {/* nav */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '28px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 4,
      }}>
        <Wordmark height={26} />
        <div style={{ display: 'flex', gap: 36, fontSize: 'calc(12px * var(--scale))', color: 'var(--fg-2)' }}>
          <button style={{ cursor: 'pointer' }}>about us</button>
          <button style={{ cursor: 'pointer', color: 'var(--fg)' }} onClick={onEnter}>turn potential</button>
          <button style={{ cursor: 'pointer' }}>impressum</button>
        </div>
      </div>

      {/* center-left headline — minimal */}
      <div style={{
        position: 'absolute',
        top: 'max(180px, 26vh)', left: '40px',
        maxWidth: '760px',
        zIndex: 3,
      }}>
        <h1 className="fade-up" style={{
          fontSize: 'clamp(48px, 7vw, 104px)',
          lineHeight: 0.95,
          fontWeight: 400,
          letterSpacing: '-0.02em',
          color: 'var(--fg)',
        }}>
          turn potential<br/>
          into <span className="word-em" style={{
            fontSize: '1.06em',
            color: 'var(--accent)',
            display: 'inline-block',
          }}>product</span>.
        </h1>
        <p className="fade-up" style={{
          marginTop: '44px',
          color: 'var(--fg-2)',
          maxWidth: '440px',
          fontSize: 'calc(15px * var(--scale))',
          lineHeight: 1.6,
          animationDelay: '160ms',
        }}>
          willkommen bei <span style={{ fontWeight: 600, color: 'var(--fg)' }}>foofab.</span>
        </p>
      </div>

      {/* lower-right pulsing power orb */}
      <div style={{
        position: 'absolute',
        bottom: 'max(130px, 15vh)', right: '8vw',
        textAlign: 'center',
        zIndex: 3,
      }}>
        <PowerOrb size={220} pulsing onClick={onEnter} label="enter foofab" />
        <div style={{
          marginTop: 22,
          color: 'var(--fg-3)',
          fontSize: 'calc(10px * var(--scale))',
          letterSpacing: '0.2em',
          animation: 'blink 2s step-end infinite',
        }}>
          [ press to begin ]
        </div>
      </div>

      {/* bottom-left tagline */}
      <div style={{
        position: 'absolute',
        bottom: '40px', left: '40px',
        zIndex: 3,
      }}>
        <div style={{
          fontSize: 'clamp(18px, 1.8vw, 24px)',
          color: 'var(--fg)',
          lineHeight: 1.05,
          maxWidth: 460,
        }}>
          be careful <span className="word-em" style={{ fontSize: '1.08em', color: 'var(--accent)' }}>—</span> this could turn <span className="word-em" style={{ fontSize: '1.08em', color: 'var(--accent)' }}>epic</span>
        </div>
      </div>

      {/* bottom-right meta */}
      <div style={{
        position: 'absolute',
        bottom: '40px', right: '40px',
        textAlign: 'right',
        color: 'var(--fg-3)',
        fontSize: 'calc(10px * var(--scale))',
        letterSpacing: '0.15em',
        zIndex: 3,
      }}>
        hmb · {hh}:{mm}
      </div>
    </div>
  );
};

window.Landing = Landing;
