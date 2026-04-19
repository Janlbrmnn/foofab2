// Icons — real power PNG + serif/mono wordmark

const PowerIcon = ({ size = 64, color = 'currentColor' }) => (
  <img src="assets/power.png" alt="" width={size} height={size}
    style={{ display: 'block', filter: color === 'currentColor' ? undefined : 'none' }} />
);

// Big pulsing orb using the real power icon
const PowerOrb = ({ size = 220, pulsing = true, onClick, label }) => (
  <button
    onClick={onClick}
    aria-label={label || 'enter'}
    style={{
      position: 'relative',
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      cursor: 'pointer',
    }}
  >
    {pulsing && (
      <>
        <span style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '1.5px solid rgba(22,20,15,0.35)',
          animation: 'pulse-ring 2.6s cubic-bezier(.2,.8,.2,1) infinite',
        }} />
        <span style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '1px solid rgba(22,20,15,0.22)',
          animation: 'pulse-ring 2.6s cubic-bezier(.2,.8,.2,1) 0.9s infinite',
        }} />
      </>
    )}
    <span style={{
      position: 'relative',
      width: '100%', height: '100%',
      borderRadius: '50%',
      background: 'radial-gradient(circle at 32% 28%, #ffffff 0%, #f2efe8 55%, #d8d4c8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 24px 50px rgba(22,20,15,0.28), inset 0 -10px 28px rgba(22,20,15,0.08), inset 0 2px 6px rgba(255,255,255,0.8)',
      animation: pulsing ? 'pulse-glow 2.6s ease-in-out infinite' : 'none',
      transition: 'transform 220ms cubic-bezier(.2,.8,.2,1)',
    }}>
      <img src="assets/power.png" alt="" width={size * 0.42} height={size * 0.42 * (639/571)} style={{ display: 'block' }} />
    </span>
  </button>
);

// Wordmark using logo PNG
const Wordmark = ({ height = 22 }) => (
  <img src="assets/foofab-logo.png" alt="foofab" style={{ height, width: 'auto', display: 'block' }} />
);

// Small inline mono-mark (fallback for places where logo png is too big)
const PowerMark = ({ size = 18 }) => (
  <img src="assets/power.png" alt="" width={size} height={size * (639/571)} style={{ display: 'block' }} />
);

const Arrow = ({ dir = 'right', size = 14 }) => {
  const rotations = { right: 0, down: 90, left: 180, up: 270 };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ transform: `rotate(${rotations[dir]}deg)`, flexShrink: 0 }}>
      <path d="M 2 8 L 14 8 M 9 3 L 14 8 L 9 13" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="square" />
    </svg>
  );
};

const Cross = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <path d="M 3 3 L 13 13 M 13 3 L 3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
  </svg>
);

const Plus = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <path d="M 8 2 V 14 M 2 8 H 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
  </svg>
);

Object.assign(window, { PowerIcon, PowerOrb, Wordmark, PowerMark, Arrow, Cross, Plus });
