// Configurator — multi-step wizard with live 3D-ish product preview

const SHAPES = [
  { id: 'bear',    label: 'bär',      glyph: 'M32 8 C 22 8 18 16 18 22 C 10 22 6 28 6 36 C 6 48 18 56 32 56 C 46 56 58 48 58 36 C 58 28 54 22 46 22 C 46 16 42 8 32 8 Z' },
  { id: 'worm',    label: 'wurm',     glyph: 'M10 32 Q 10 20 22 20 Q 34 20 34 32 Q 34 44 46 44 Q 58 44 58 32' },
  { id: 'cube',    label: 'würfel',   glyph: 'M14 14 H 50 V 50 H 14 Z' },
  { id: 'heart',   label: 'herz',     glyph: 'M32 50 C 10 36 10 20 22 16 C 28 14 32 18 32 22 C 32 18 36 14 42 16 C 54 20 54 36 32 50 Z' },
  { id: 'pickle',  label: 'pickle',   glyph: 'M18 12 Q 34 6 44 16 Q 58 28 50 44 Q 40 58 26 54 Q 12 48 14 34 Q 14 22 18 12 Z' },
  { id: 'ring',    label: 'ring',     glyph: 'M32 12 A 20 20 0 1 0 32 52 A 20 20 0 1 0 32 12 M 32 22 A 10 10 0 1 1 32 42 A 10 10 0 1 1 32 22' },
];

const FLAVORS = [
  { id: 'sour-pickle', label: 'sour pickle',    notes: 'salz · essig · dill',       stock: 'in stock' },
  { id: 'cheese',      label: 'smoked cheese',  notes: 'räuchernote · umami',       stock: 'in stock' },
  { id: 'lemon-salt',  label: 'lemon salt',     notes: 'zitrone · meersalz',        stock: 'in stock' },
  { id: 'tequila',     label: 'tequila lime',   notes: 'agave · limette (0% abv)',  stock: 'low stock' },
  { id: 'ferment',     label: 'fermentiert',    notes: 'kimchi · chili',            stock: 'preview' },
  { id: 'herb',        label: 'kräuter',        notes: 'rosmarin · thymian',        stock: 'preview' },
];

const PACKAGES = [
  { id: 'pouch',    label: 'doypack',   bases: ['gummies', 'hard candy'] },
  { id: 'jar',      label: 'glas',      bases: ['gummies', 'hard candy'] },
  { id: 'tin',      label: 'dose',      bases: ['gummies', 'hard candy'] },
  { id: 'tube',     label: 'tube',      bases: ['hard candy'] },
  { id: 'calendar', label: 'kalender',  bases: ['adventskalender'] },
  { id: 'bar',      label: 'riegel-box', bases: ['bars'] },
];

// Pick a sensible default pack for each base category
const DEFAULT_PACK_FOR_BASE = {
  'gummies': 'pouch',
  'hard candy': 'tin',
  'adventskalender': 'calendar',
  'bars': 'bar',
};

const STEPS = [
  { k: '01', id: 'base',    label: 'basis' },
  { k: '02', id: 'shape',   label: 'form' },
  { k: '03', id: 'flavor',  label: 'geschmack' },
  { k: '04', id: 'pack',    label: 'verpackung' },
  { k: '05', id: 'brand',   label: 'branding' },
  { k: '06', id: 'review',  label: 'launch' },
];

const Chip = ({ active, onClick, children, style }) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 14px',
      border: `1px solid ${active ? 'var(--fg)' : 'var(--line)'}`,
      background: active ? 'var(--fg)' : 'transparent',
      color: active ? 'var(--bg)' : 'var(--fg)',
      fontSize: 'calc(12px * var(--scale))',
      transition: 'all 140ms',
      cursor: 'pointer',
      ...style,
    }}
  >
    {children}
  </button>
);

// A glossy gummy with gradient, specular highlight, translucent edge
const Gummy = ({ shape, color, size = 40, rot = 0, style = {} }) => {
  const id = React.useId();
  const base = color;
  const activeShape = SHAPES.find(s => s.id === shape) || SHAPES[0];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ transform: `rotate(${rot}deg)`, ...style }}>
      <defs>
        <radialGradient id={`g-${id}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="25%" stopColor={base} stopOpacity="0.95" />
          <stop offset="80%" stopColor={base} stopOpacity="1" />
          <stop offset="100%" stopColor={base} stopOpacity="1" />
        </radialGradient>
        <radialGradient id={`h-${id}`} cx="30%" cy="22%" r="20%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id={`shadow-${id}`} x="-20%" y="-10%" width="140%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
          <feOffset dx="0" dy="2" />
          <feComponentTransfer><feFuncA type="linear" slope="0.4" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d={activeShape.glyph} fill={`url(#g-${id})`} filter={`url(#shadow-${id})`} />
      <path d={activeShape.glyph} fill={`url(#h-${id})`} />
      {/* rim highlight — inner stroke */}
      <path d={activeShape.glyph} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" />
    </svg>
  );
};

// Renders the logo/photo area — user can upload images via Tweaks mode
const BrandSlot = ({ cfg, w = 120 }) => {
  if (cfg.logo) {
    return <img src={cfg.logo} alt="" style={{ maxWidth: w, maxHeight: 60, objectFit: 'contain' }} />;
  }
  return (
    <div style={{
      width: w, height: 46,
      background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 6px, rgba(255,255,255,0.02) 6px 12px)',
      border: '1px dashed rgba(255,255,255,0.35)',
      color: 'rgba(255,255,255,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, letterSpacing: '0.15em',
    }}>
      LOGO
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────
// 3D Box primitive — renders a real box with front, top, side faces
// using translateZ. Put any DOM in `front` (label art) — `top` and
// `side` get tinted solid fills derived from the body color.
// ───────────────────────────────────────────────────────────────────
const Box3D = ({
  width = '60%',
  aspectRatio = '1 / 1',
  depth = 60,      // px — box depth
  front,           // JSX for front face
  top,             // optional JSX for top face (else solid fill)
  side,            // optional JSX for right side face (else solid fill)
  topFill = 'linear-gradient(180deg, #ece8dc 0%, #d6d2c4 100%)',
  sideFill = 'linear-gradient(90deg, #c9c5b7 0%, #aba89c 100%)',
  bodyShadow = '0 40px 80px rgba(22,20,15,0.35)',
}) => {
  const d = depth;
  return (
    <div style={{
      width,
      aspectRatio,
      position: 'relative',
      transformStyle: 'preserve-3d',
    }}>
      {/* Ground shadow — projected below the box, keeps filter out of the 3D context */}
      <div style={{
        position: 'absolute',
        left: '-10%', right: '-10%',
        bottom: `-${d}px`,
        height: 30,
        background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(22,20,15,0.45), transparent 70%)',
        transform: `translateZ(${-d/2}px) rotateX(90deg)`,
        transformOrigin: 'center top',
        pointerEvents: 'none',
      }} />
      {/* Back face — darker, sits behind */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: `translateZ(${-d/2}px)`,
        background: 'linear-gradient(180deg, #8a8578 0%, #6d6a60 100%)',
      }} />

      {/* Right side face */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        right: 0,
        width: d,
        transform: `translateX(${d/2}px) rotateY(90deg)`,
        transformOrigin: 'left center',
        background: sideFill,
      }}>
        {side}
      </div>

      {/* Left side face */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: 0,
        width: d,
        transform: `translateX(${-d/2}px) rotateY(-90deg)`,
        transformOrigin: 'right center',
        background: sideFill,
        filter: 'brightness(0.85)',
      }} />

      {/* Top face */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: 0,
        height: d,
        transform: `translateY(${-d/2}px) rotateX(90deg)`,
        transformOrigin: 'center bottom',
        background: topFill,
      }}>
        {top}
      </div>

      {/* Bottom face */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        bottom: 0,
        height: d,
        transform: `translateY(${d/2}px) rotateX(-90deg)`,
        transformOrigin: 'center top',
        background: 'linear-gradient(180deg, #6d6a60 0%, #4a4840 100%)',
      }} />

      {/* Front face — the actual label / artwork */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: `translateZ(${d/2}px)`,
      }}>
        {front}
      </div>
    </div>
  );
};

// Doypack — pouch with side gusset for visible depth
const DoypackFront = ({ cfg, color }) => (
  <div style={{
    width: '56%', aspectRatio: '0.72 / 1',
    position: 'relative',
    transformStyle: 'preserve-3d',
  }}>
    {/* back gusset — darker, slightly larger offset for depth */}
    <div style={{
      position: 'absolute', inset: 0,
      transform: 'translateZ(-18px)',
      clipPath: 'polygon(0% 8%, 8% 2%, 50% 0%, 92% 2%, 100% 8%, 100% 100%, 0% 100%)',
      background: 'linear-gradient(180deg, #b8b2a2 0%, #8a8475 100%)',
      filter: 'brightness(0.7)',
    }} />
    {/* right gusset strip */}
    <div style={{
      position: 'absolute', top: '6%', bottom: 0, right: 0,
      width: 36,
      transform: 'translateX(18px) rotateY(90deg)',
      transformOrigin: 'left center',
      background: 'linear-gradient(90deg, #d6d0c0 0%, #a8a393 100%)',
    }} />
    {/* left gusset strip */}
    <div style={{
      position: 'absolute', top: '6%', bottom: 0, left: 0,
      width: 36,
      transform: 'translateX(-18px) rotateY(-90deg)',
      transformOrigin: 'right center',
      background: 'linear-gradient(90deg, #9a9585 0%, #b8b2a2 100%)',
    }} />
    {/* front face */}
    <div style={{
      position: 'absolute', inset: 0,
      transform: 'translateZ(18px)',
      clipPath: 'polygon(0% 8%, 8% 2%, 50% 0%, 92% 2%, 100% 8%, 100% 100%, 0% 100%)',
      background: `
        linear-gradient(170deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 35%),
        linear-gradient(90deg, rgba(0,0,0,0.25) 0%, transparent 10%, transparent 88%, rgba(0,0,0,0.35) 100%),
        linear-gradient(180deg, #f6f3ec 0%, #ede9df 100%)
      `,
      boxShadow: '0 30px 60px rgba(22,20,15,0.3)',
    }}>
      {/* seal strip at top */}
      <div style={{
        position: 'absolute', top: '4%', left: 0, right: 0, height: '6%',
        background: 'repeating-linear-gradient(90deg, rgba(22,20,15,0.12) 0 2px, transparent 2px 4px)',
        borderBottom: '1px dashed rgba(22,20,15,0.2)',
      }} />
      {/* zipper */}
      <div style={{
        position: 'absolute', top: '11%', left: '6%', right: '6%', height: 2,
        background: 'rgba(22,20,15,0.25)',
      }} />

      {/* content padding area */}
      <div style={{
        position: 'absolute', inset: '18% 10% 8% 10%',
        display: 'flex', flexDirection: 'column', color: '#16140f',
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 'calc(8px * var(--scale))', letterSpacing: '0.2em', opacity: 0.5, textTransform: 'uppercase' }}>
          foofab · {cfg.base}
        </div>
        <BrandSlot cfg={cfg} />
        <div style={{
          marginTop: 8,
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: 'calc(28px * var(--scale))',
          lineHeight: 0.95,
          letterSpacing: '-0.01em',
        }}>
          {cfg.name || 'sour pickle'}
        </div>
        <div style={{
          marginTop: 4,
          fontFamily: 'var(--mono)',
          fontSize: 'calc(10px * var(--scale))',
          letterSpacing: '0.12em',
          opacity: 0.5,
          textTransform: 'uppercase',
        }}>
          {cfg.flavor?.replace('-',' ')}
        </div>

        {/* window with gummies visible */}
        <div style={{ flex: 1, marginTop: 12, position: 'relative',
          background: 'rgba(22,20,15,0.04)',
          border: '1px solid rgba(22,20,15,0.1)',
        }}>
          <GummyCluster cfg={cfg} color={color} />
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--mono)',
          fontSize: 'calc(8px * var(--scale))',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          paddingTop: 8,
          marginTop: 8,
          borderTop: '1px solid rgba(22,20,15,0.15)',
          opacity: 0.7,
        }}>
          <span>net {cfg.weight}g</span>
          <span>by @{cfg.handle}</span>
        </div>
      </div>
    </div>
  </div>
);

// Glass jar — cylinder with lid; gets a back-mirror for depth
const JarFront = ({ cfg, color }) => (
  <div style={{ width: '50%', aspectRatio: '0.75 / 1', position: 'relative', transformStyle: 'preserve-3d' }}>
    {/* Back cylinder — darker, sits behind */}
    <div style={{
      position: 'absolute', inset: 0,
      transform: 'translateZ(-40px)',
      borderRadius: '4px 4px 10px 10px',
      background: 'linear-gradient(180deg, #6a6558 0%, #3e3b32 100%)',
      filter: 'brightness(0.6)',
    }} />
    {/* Right curve strip for cylindrical feel */}
    <div style={{
      position: 'absolute', top: '13%', bottom: 0, right: 0,
      width: 40,
      transform: 'translateX(20px) rotateY(90deg)',
      transformOrigin: 'left center',
      background: 'linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(240,235,220,0.4) 50%, rgba(120,115,100,0.6) 100%)',
      borderRadius: '0 0 10px 0',
    }} />

    {/* Front assembly */}
    <div style={{
      position: 'absolute', inset: 0,
      transform: 'translateZ(20px)',
    }}>
    {/* lid */}
    <div style={{
      position: 'absolute', top: 0, left: '4%', right: '4%', height: '14%',
      background: `
        linear-gradient(180deg, #2a2620 0%, #16140f 60%, #0a0907 100%)
      `,
      borderRadius: '6px 6px 2px 2px',
      boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.4), 0 2px 0 rgba(0,0,0,0.3)',
    }}>
      <div style={{
        position: 'absolute', inset: '20% 4% 20% 4%',
        background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 4px)',
      }} />
    </div>

    <div style={{
      position: 'absolute', top: '13%', left: 0, right: 0, bottom: 0,
      borderRadius: '4px 4px 10px 10px',
      background: `
        linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 15%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.1) 80%, rgba(255,255,255,0.35) 100%),
        linear-gradient(180deg, rgba(240,235,220,0.7) 0%, rgba(230,225,210,0.5) 100%)
      `,
      border: '1px solid rgba(22,20,15,0.15)',
      boxShadow: '0 30px 60px rgba(22,20,15,0.3), inset 0 0 40px rgba(255,255,255,0.3)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '18%', left: '8%', right: '8%', bottom: '18%',
        background: '#f6f3ec',
        color: '#16140f',
        border: '1px solid rgba(22,20,15,0.1)',
        padding: '12px 10px',
        display: 'flex', flexDirection: 'column', gap: 4,
        boxShadow: 'inset 0 0 20px rgba(22,20,15,0.05)',
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 'calc(7px * var(--scale))', letterSpacing: '0.2em', opacity: 0.5, textTransform: 'uppercase' }}>
          foofab
        </div>
        <div style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic',
          fontSize: 'calc(22px * var(--scale))',
          lineHeight: 0.95,
        }}>
          {cfg.name || 'sour pickle'}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 'calc(8px * var(--scale))', letterSpacing: '0.15em', opacity: 0.5, textTransform: 'uppercase' }}>
          {cfg.base} · {cfg.weight}g
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 'calc(7px * var(--scale))', letterSpacing: '0.12em', opacity: 0.5, textTransform: 'uppercase' }}>
          <span>@{cfg.handle}</span>
          <span>lot {String(cfg.units).slice(0,4)}</span>
        </div>
      </div>

      <div style={{
        position: 'absolute', top: '2%', left: '4%', right: '4%', height: '14%',
        overflow: 'hidden',
      }}>
        <GummyCluster cfg={cfg} color={color} compact />
      </div>
    </div>
    </div>
  </div>
);

// Tin — real 3D rectangular box with embossed lid, visible side + top
const TinFront = ({ cfg, color }) => {
  const frontArt = (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 25%),
        linear-gradient(180deg, #d9d5c8 0%, #c1beb2 100%)
      `,
      border: '1px solid rgba(22,20,15,0.2)',
      overflow: 'hidden',
      color: '#16140f',
      padding: 20,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        position: 'absolute', inset: 8,
        border: '1px solid rgba(22,20,15,0.18)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 'calc(8px * var(--scale))', letterSpacing: '0.2em', opacity: 0.5, textTransform: 'uppercase' }}>
            foofab · {cfg.base}
          </div>
          <div style={{
            marginTop: 6,
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 'calc(30px * var(--scale))',
            lineHeight: 0.95,
          }}>
            {cfg.name || 'sour pickle'}
          </div>
        </div>
        <BrandSlot cfg={cfg} w={80} />
      </div>
      <div style={{ position: 'relative', flex: 1, marginTop: 10 }}>
        <GummyCluster cfg={cfg} color={color} />
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 'calc(8px * var(--scale))', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6 }}>
        <span>net {cfg.weight}g</span>
        <span>@{cfg.handle}</span>
      </div>
    </div>
  );

  // Top face — embossed "foofab" wordmark strip
  const topArt = (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(22,20,15,0.4)',
      fontFamily: 'var(--mono)',
      fontSize: 10,
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      borderBottom: '1px solid rgba(22,20,15,0.15)',
    }}>
      foofab · {cfg.name || cfg.base}
    </div>
  );

  // Side face — vertical text
  const sideArt = (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(22,20,15,0.35)',
      fontFamily: 'var(--mono)',
      fontSize: 9,
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      writingMode: 'vertical-rl',
    }}>
      net {cfg.weight}g
    </div>
  );

  return (
    <Box3D
      width="58%"
      aspectRatio="1 / 0.82"
      depth={85}
      front={frontArt}
      top={topArt}
      side={sideArt}
      topFill="linear-gradient(180deg, #e2dece 0%, #c9c5b7 100%)"
      sideFill="linear-gradient(90deg, #b8b4a6 0%, #9a9789 100%)"
    />
  );
};

// Tube — tall cylinder, rounded top, flat screwcap; with back-mirror for depth
const TubeFront = ({ cfg, color }) => (
  <div style={{ width: '28%', aspectRatio: '0.4 / 1', position: 'relative', transformStyle: 'preserve-3d' }}>
    {/* back body */}
    <div style={{
      position: 'absolute', top: '8%', left: 0, right: 0, bottom: 0,
      transform: 'translateZ(-24px)',
      borderRadius: '20px 20px 6px 6px',
      background: 'linear-gradient(180deg, #9a9585 0%, #6b6658 100%)',
    }} />
    {/* right curve strip */}
    <div style={{
      position: 'absolute', top: '8%', bottom: 0, right: 0,
      width: 24,
      transform: 'translateX(12px) rotateY(90deg)',
      transformOrigin: 'left center',
      background: 'linear-gradient(90deg, rgba(255,255,255,0.25) 0%, #d8d3c3 60%, #808073 100%)',
    }} />

    {/* front assembly */}
    <div style={{
      position: 'absolute', inset: 0,
      transform: 'translateZ(12px)',
    }}>
    <div style={{
      position: 'absolute', top: 0, left: '10%', right: '10%', height: '9%',
      background: 'linear-gradient(180deg, #2a2620 0%, #16140f 100%)',
      borderRadius: '3px 3px 1px 1px',
    }} />
    <div style={{
      position: 'absolute', top: '8%', left: 0, right: 0, bottom: 0,
      borderRadius: '20px 20px 6px 6px',
      background: `
        linear-gradient(90deg, rgba(0,0,0,0.25) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.25) 100%),
        linear-gradient(180deg, #f6f3ec 0%, #ede9df 100%)
      `,
      boxShadow: '0 30px 60px rgba(22,20,15,0.3)',
      color: '#16140f',
      padding: '18px 10px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflow: 'hidden',
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 'calc(7px * var(--scale))', letterSpacing: '0.2em', opacity: 0.5, textTransform: 'uppercase' }}>
        foofab
      </div>
      <div style={{
        marginTop: 20,
        fontFamily: 'var(--serif)', fontStyle: 'italic',
        fontSize: 'calc(20px * var(--scale))',
        lineHeight: 0.95,
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
        textAlign: 'center',
      }}>
        {cfg.name || 'sour pickle'}
      </div>
      <div style={{ marginTop: 'auto', fontFamily: 'var(--mono)', fontSize: 'calc(7px * var(--scale))', letterSpacing: '0.12em', opacity: 0.5, textTransform: 'uppercase' }}>
        {cfg.weight}g
      </div>
    </div>
    </div>
  </div>
);

// ───────────────────────────────────────────────────────────────────
// Adventskalender — deep box with 24-door grid on front
// ───────────────────────────────────────────────────────────────────
const CalendarFront = ({ cfg, color }) => {
  const accent = cfg.color;
  const frontArt = (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.08) 100%),
        linear-gradient(160deg, #f6f3ec 0%, #e5e0d2 100%)
      `,
      padding: '18px 16px 14px',
      display: 'flex', flexDirection: 'column',
      color: '#16140f',
    }}>
      {/* header strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 'calc(8px * var(--scale))', letterSpacing: '0.22em', opacity: 0.55, textTransform: 'uppercase' }}>
            foofab · adventskalender
          </div>
          <div style={{
            marginTop: 4,
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 'calc(22px * var(--scale))',
            lineHeight: 1,
          }}>
            {cfg.name || '24 tage drop'}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 'calc(9px * var(--scale))', letterSpacing: '0.2em', opacity: 0.55, textAlign: 'right' }}>
          24<br/>türchen
        </div>
      </div>

      {/* 24-door grid — 6 cols × 4 rows */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: 3,
        padding: 6,
        background: 'rgba(22,20,15,0.08)',
        border: '1px solid rgba(22,20,15,0.12)',
      }}>
        {Array.from({ length: 24 }, (_, i) => {
          // scatter accent-fill to a few random doors for visual rhythm
          const isAccent = [2, 7, 11, 18, 22].includes(i);
          const day = i + 1;
          return (
            <div key={i} style={{
              position: 'relative',
              background: isAccent
                ? accent
                : 'linear-gradient(180deg, #ffffff 0%, #ece7d8 100%)',
              border: '1px solid rgba(22,20,15,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isAccent ? '#ffffff' : '#16140f',
              fontFamily: 'var(--mono)',
              fontSize: 'calc(11px * var(--scale))',
              fontWeight: 700,
              letterSpacing: '0.02em',
              boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 rgba(22,20,15,0.15)',
            }}>
              {day}
              {/* subtle perforation line */}
              <div style={{
                position: 'absolute', inset: '0 0 0 0',
                borderLeft: '1px dashed rgba(22,20,15,0.15)',
                pointerEvents: 'none',
                width: '22%',
              }} />
            </div>
          );
        })}
      </div>

      {/* footer */}
      <div style={{
        marginTop: 10,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--mono)',
        fontSize: 'calc(8px * var(--scale))',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        opacity: 0.65,
        paddingTop: 6,
        borderTop: '1px solid rgba(22,20,15,0.15)',
      }}>
        <span>{cfg.weight}g netto</span>
        <span>by @{cfg.handle}</span>
      </div>
    </div>
  );

  const topArt = (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #efebdd 0%, #d0ccbd 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderBottom: '1px solid rgba(22,20,15,0.15)',
      color: 'rgba(22,20,15,0.4)',
      fontFamily: 'var(--mono)',
      fontSize: 10,
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
    }}>
      open · tag für tag
    </div>
  );

  const sideArt = (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.15) 0%, transparent 40%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(22,20,15,0.4)',
      fontFamily: 'var(--serif)',
      fontStyle: 'italic',
      fontSize: 14,
      writingMode: 'vertical-rl',
    }}>
      {cfg.name || 'adventskalender'} · 2025
    </div>
  );

  return (
    <Box3D
      width="72%"
      aspectRatio="1.2 / 1"
      depth={70}
      front={frontArt}
      top={topArt}
      side={sideArt}
      topFill="linear-gradient(180deg, #efebdd 0%, #d0ccbd 100%)"
      sideFill="linear-gradient(90deg, #c9c5b7 0%, #a29e90 100%)"
    />
  );
};

// ───────────────────────────────────────────────────────────────────
// Bars — flat rectangular display box with individually wrapped bars in a tray
// ───────────────────────────────────────────────────────────────────
const BarFront = ({ cfg, color }) => {
  const accent = cfg.color;
  // Render bars in a 3×4 grid inside the display box
  const frontArt = (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%),
        linear-gradient(180deg, #1f1d18 0%, #15130e 100%)
      `,
      color: '#ece9dd',
      padding: '16px 14px 12px',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 'calc(8px * var(--scale))', letterSpacing: '0.22em', opacity: 0.6, textTransform: 'uppercase' }}>
            foofab · bars · 12er
          </div>
          <div style={{
            marginTop: 4,
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 'calc(22px * var(--scale))',
            lineHeight: 0.95,
          }}>
            {cfg.name || 'protein riegel'}
          </div>
          <div style={{ marginTop: 3, fontFamily: 'var(--mono)', fontSize: 'calc(9px * var(--scale))', letterSpacing: '0.15em', opacity: 0.55, textTransform: 'uppercase' }}>
            {cfg.flavor?.replace('-',' ')}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: 4 }}>
          <div style={{
            padding: '3px 8px',
            background: accent,
            color: '#16140f',
            fontFamily: 'var(--mono)', fontSize: 'calc(8px * var(--scale))',
            letterSpacing: '0.15em', fontWeight: 700,
          }}>
            12 × {cfg.weight}g
          </div>
          <BrandSlot cfg={cfg} w={70} />
        </div>
      </div>

      {/* bar tray — individually wrapped bars */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: 4,
        padding: 6,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{
            position: 'relative',
            background: `
              linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 35%),
              linear-gradient(90deg, rgba(0,0,0,0.25) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.25) 100%),
              ${i % 3 === 1 ? accent : '#ece9dd'}
            `,
            border: '1px solid rgba(22,20,15,0.3)',
            color: i % 3 === 1 ? '#16140f' : '#1f1d18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 'calc(10px * var(--scale))',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
          }}>
            {/* wrapper seal lines */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: '18%',
              borderLeft: '1px dashed rgba(22,20,15,0.2)',
            }} />
            <div style={{
              position: 'absolute', top: 0, bottom: 0, right: '18%',
              borderRight: '1px dashed rgba(22,20,15,0.2)',
            }} />
            <span style={{ fontSize: 'calc(8px * var(--scale))', fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase', fontStyle: 'normal' }}>
              {(cfg.name || 'bar').slice(0, 3)}
            </span>
          </div>
        ))}
      </div>

      {/* footer */}
      <div style={{
        marginTop: 8,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--mono)',
        fontSize: 'calc(8px * var(--scale))',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        opacity: 0.6,
        paddingTop: 6,
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <span>net {cfg.weight * 12}g · 12 stk</span>
        <span>@{cfg.handle}</span>
      </div>
    </div>
  );

  const topArt = (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #2a2620 0%, #16140f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(236,233,221,0.4)',
      fontFamily: 'var(--mono)',
      fontSize: 10,
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
    }}>
      bars · {cfg.flavor?.replace('-',' ')}
    </div>
  );

  const sideArt = (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 40%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(236,233,221,0.5)',
      fontFamily: 'var(--mono)',
      fontSize: 9,
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      writingMode: 'vertical-rl',
    }}>
      foofab · 12 × {cfg.weight}g
    </div>
  );

  return (
    <Box3D
      width="68%"
      aspectRatio="1.05 / 1"
      depth={44}
      front={frontArt}
      top={topArt}
      side={sideArt}
      topFill="linear-gradient(180deg, #2a2620 0%, #16140f 100%)"
      sideFill="linear-gradient(90deg, #1f1d18 0%, #0c0a07 100%)"
    />
  );
};

// Reusable gummy cluster
const GummyCluster = ({ cfg, color, compact = false }) => {
  const gummies = React.useMemo(() => {
    const seed = cfg.density;
    const arr = [];
    const count = compact ? Math.min(cfg.density, 5) : cfg.density;
    for (let i = 0; i < count; i++) {
      const r = Math.sin(i * 17.31 + seed * 3.7);
      const r2 = Math.sin(i * 7.19 + seed * 2.1);
      arr.push({
        i,
        x: 12 + ((Math.abs(r) * 100) % 76),
        y: 15 + ((Math.abs(r2) * 100) % 70),
        rot: ((r * 180 + 360) % 360),
        size: compact ? 16 + ((Math.abs(r) * 10) % 6) : 26 + ((Math.abs(r) * 16) % 14),
        z: Math.abs(r2),
      });
    }
    return arr.sort((a, b) => a.z - b.z);
  }, [cfg.density, cfg.shape, compact]);

  return (
    <>
      {gummies.map(g => (
        <div key={g.i} style={{
          position: 'absolute',
          left: `${g.x}%`, top: `${g.y}%`,
          transform: 'translate(-50%, -50%)',
          filter: `drop-shadow(0 2px 2px rgba(0,0,0,${0.2 + g.z * 0.15}))`,
        }}>
          <Gummy shape={cfg.shape} color={color} size={g.size} rot={g.rot} />
        </div>
      ))}
    </>
  );
};

const ProductPreview = ({ cfg, tilt }) => {
  const color = cfg.color;

  return (
    <div style={{
      width: '100%',
      aspectRatio: '1 / 1.15',
      position: 'relative',
      background: 'linear-gradient(160deg, var(--bg-2) 0%, var(--bg) 60%, var(--bg-2) 100%)',
      border: '1px solid var(--line)',
      overflow: 'hidden',
      perspective: '1600px',
      cursor: 'grab',
    }}>
      {/* floor shadow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 10% at 50% 92%, rgba(22,20,15,0.22), transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* dot grid bg */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.22 }}>
        <defs>
          <pattern id="dots-pv" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="0.6" fill="var(--fg-3)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-pv)" />
      </svg>

      {/* stage with 3d tilt */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transformStyle: 'preserve-3d',
      }}>
        <div style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${tilt.y}deg) rotateX(${tilt.x}deg)`,
          transition: 'transform 160ms cubic-bezier(.2,.8,.2,1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '100%',
        }}>
          {cfg.pack === 'pouch'    && <DoypackFront cfg={cfg} color={color} />}
          {cfg.pack === 'jar'      && <JarFront cfg={cfg} color={color} />}
          {cfg.pack === 'tin'      && <TinFront cfg={cfg} color={color} />}
          {cfg.pack === 'tube'     && <TubeFront cfg={cfg} color={color} />}
          {cfg.pack === 'calendar' && <CalendarFront cfg={cfg} color={color} />}
          {cfg.pack === 'bar'      && <BarFront cfg={cfg} color={color} />}
        </div>
      </div>

      {/* readout */}
      <div style={{
        position: 'absolute',
        top: 12, left: 12,
        fontSize: 'calc(9px * var(--scale))',
        color: 'var(--fg-3)',
        letterSpacing: '0.15em',
      }}>
        preview · live · {cfg.pack}
      </div>
      <div style={{
        position: 'absolute',
        top: 12, right: 12,
        fontSize: 'calc(9px * var(--scale))',
        color: 'var(--fg-3)',
        letterSpacing: '0.15em',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
        rendering
      </div>
      <div style={{
        position: 'absolute',
        bottom: 12, left: 12, right: 12,
        fontSize: 'calc(9px * var(--scale))',
        color: 'var(--fg-3)',
        letterSpacing: '0.1em',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>rot y: {tilt.y.toFixed(0)}° · x: {tilt.x.toFixed(0)}°</span>
        <span>drag to rotate</span>
      </div>
    </div>
  );
};

const Configurator = () => {
  const LS_KEY = 'foofab-cfg-v1';
  const INITIAL_CFG = {
    base: 'gummies',
    shape: 'pickle',
    flavor: 'sour-pickle',
    pack: 'pouch',
    color: '#7a9a3a',
    name: 'sauer & käse',
    handle: 'foodcreator.hh',
    weight: 120,
    density: 9,
    units: 5000,
  };
  const [step, setStep] = React.useState(0);
  const [cfg, setCfg] = React.useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) return { ...INITIAL_CFG, ...JSON.parse(saved) };
    } catch (e) {}
    return INITIAL_CFG;
  });

  // Persist cfg (incl. uploaded logo + photo data URLs) to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(cfg));
    } catch (e) {
      // Quota exceeded (large images) — silently skip
    }
  }, [cfg]);

  const resetCfg = () => {
    localStorage.removeItem(LS_KEY);
    setCfg(INITIAL_CFG);
  };
  const [tilt, setTilt] = React.useState({ x: -16, y: 28 });
  const dragging = React.useRef(null);

  const onPointerDown = (e) => {
    dragging.current = { x: e.clientX, y: e.clientY, tilt: { ...tilt } };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.x;
    const dy = e.clientY - dragging.current.y;
    setTilt({
      y: dragging.current.tilt.y + dx * 0.4,
      x: Math.max(-30, Math.min(30, dragging.current.tilt.x - dy * 0.3)),
    });
  };
  const onPointerUp = () => { dragging.current = null; };

  const pricePer = 1.00;
  const retail = 3.49;
  const totalCost = cfg.units * pricePer;
  const grossRev = cfg.units * retail;
  const grossProfit = grossRev - totalCost;

  const colors = [
    { c: '#7a9a3a', l: 'dill green' },
    { c: '#f2c94c', l: 'lemon' },
    { c: '#c85250', l: 'paprika' },
    { c: '#8b5a3c', l: 'amber' },
    { c: '#e8e6e0', l: 'milk' },
    { c: '#3a3937', l: 'squid ink' },
  ];

  return (
    <div className="page-pad" style={{ padding: '80px 32px 48px', maxWidth: 1440, margin: '0 auto' }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', paddingBottom: 20, borderBottom: '1px solid var(--line)', marginBottom: 32 }}>
        <div>
          <div style={{ color: 'var(--fg-3)', fontSize: 'calc(11px * var(--scale))', letterSpacing: '0.2em', marginBottom: 12 }}>
            [ konfigurator / 01 ]
          </div>
          <h2 style={{ fontSize: 'calc(28px * var(--scale))', fontWeight: 400, letterSpacing: '-0.02em' }}>
            von der community zum produkt — in <span className="word-em" style={{ fontSize: '1.1em', color: 'var(--accent)' }}>tagen statt monaten</span>.
          </h2>
        </div>
        <div style={{ textAlign: 'right', fontSize: 'calc(11px * var(--scale))', color: 'var(--fg-2)', letterSpacing: '0.08em' }}>
          <div>entwurf · #DRP-0124</div>
          <div style={{ color: 'var(--fg-3)' }}>auto-gespeichert · gerade eben</div>
        </div>
      </div>

      {/* stepper */}
      <div className="mobile-stepper" style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            style={{
              flex: '1 0 auto',
              minWidth: 110,
              padding: '14px 16px',
              textAlign: 'left',
              borderRight: i < STEPS.length - 1 ? '1px solid var(--line)' : 'none',
              borderBottom: step === i ? '2px solid var(--accent)' : '2px solid transparent',
              color: step === i ? 'var(--fg)' : 'var(--fg-3)',
              background: step === i ? 'var(--bg-2)' : 'transparent',
              transition: 'all 140ms',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.15em', marginBottom: 4 }}>
              {s.k}
            </div>
            <div style={{ fontSize: 'calc(13px * var(--scale))', color: step === i ? 'var(--fg)' : 'var(--fg-2)' }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40 }}>
        {/* LEFT: step content */}
        <div style={{ minHeight: 520 }}>
          {step === 0 && (
            <div>
              <label style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em' }}>wähle deine basis-kategorie</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
                {['gummies', 'adventskalender', 'hard candy', 'bars'].map(b => (
                  <button key={b}
                    onClick={() => {
                      // When switching base, auto-swap to a compatible package
                      const newPack = DEFAULT_PACK_FOR_BASE[b] || cfg.pack;
                      setCfg({ ...cfg, base: b, pack: newPack });
                    }}
                    style={{
                      textAlign: 'left',
                      padding: 20,
                      border: `1px solid ${cfg.base === b ? 'var(--fg)' : 'var(--line)'}`,
                      background: cfg.base === b ? 'var(--bg-2)' : 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      transition: 'all 140ms',
                    }}
                  >
                    <div style={{ fontSize: 'calc(20px * var(--scale))', fontWeight: 400, marginBottom: 6, letterSpacing: '-0.01em' }}>{b}</div>
                    <div style={{ color: 'var(--fg-3)', fontSize: 'calc(11px * var(--scale))' }}>
                      {b === 'gummies' && 'black forest · moq 1'}
                      {b === 'adventskalender' && '24 türchen · saisonal'}
                      {b === 'hard candy' && 'krefeld · à la pulmoll'}
                      {b === 'bars' && 'bavaria · bio-qualität'}
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 32 }}>
                <label style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em' }}>konzept-name</label>
                <input
                  value={cfg.name}
                  onChange={e => setCfg({ ...cfg, name: e.target.value })}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 8,
                    padding: '12px 14px',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--line)',
                    color: 'var(--fg)',
                    fontFamily: 'inherit',
                    fontSize: 'calc(16px * var(--scale))',
                    textTransform: 'lowercase',
                  }}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <label style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em' }}>form</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
                {SHAPES.map(s => (
                  <button key={s.id}
                    onClick={() => setCfg({ ...cfg, shape: s.id })}
                    style={{
                      padding: 16,
                      border: `1px solid ${cfg.shape === s.id ? 'var(--fg)' : 'var(--line)'}`,
                      background: cfg.shape === s.id ? 'var(--bg-2)' : 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    }}
                  >
            <svg width={48} height={48} viewBox="0 0 64 64">
                      <defs>
                        <radialGradient id={`step-g-${s.id}`} cx="35%" cy="30%" r="70%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                          <stop offset="30%" stopColor={cfg.color} stopOpacity="0.95" />
                          <stop offset="100%" stopColor={cfg.color} stopOpacity="1" />
                        </radialGradient>
                      </defs>
                      <path d={s.glyph} fill={`url(#step-g-${s.id})`} />
                      <path d={s.glyph} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
                    </svg>
                    <span style={{ fontSize: 'calc(11px * var(--scale))' }}>{s.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 32 }}>
                <label style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em' }}>farbe</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {colors.map(col => (
                    <button key={col.c}
                      onClick={() => setCfg({ ...cfg, color: col.c })}
                      title={col.l}
                      style={{
                        width: 36, height: 36,
                        background: col.c,
                        border: cfg.color === col.c ? '2px solid var(--fg)' : '1px solid var(--line)',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 32 }}>
                <label style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em' }}>dichte · {cfg.density} stk sichtbar</label>
                <input type="range" min={3} max={18} value={cfg.density}
                  onChange={e => setCfg({ ...cfg, density: +e.target.value })}
                  style={{ width: '100%', marginTop: 10, accentColor: 'var(--accent)' }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em' }}>geschmacksprofil</label>
              <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                {FLAVORS.map(f => (
                  <button key={f.id}
                    onClick={() => setCfg({ ...cfg, flavor: f.id })}
                    style={{
                      textAlign: 'left',
                      padding: '14px 16px',
                      border: `1px solid ${cfg.flavor === f.id ? 'var(--fg)' : 'var(--line)'}`,
                      background: cfg.flavor === f.id ? 'var(--bg-2)' : 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <span style={{
                      width: 14, height: 14,
                      border: `1px solid ${cfg.flavor === f.id ? 'var(--fg)' : 'var(--fg-3)'}`,
                      background: cfg.flavor === f.id ? 'var(--accent)' : 'transparent',
                    }} />
                    <span>
                      <div style={{ fontSize: 'calc(15px * var(--scale))' }}>{f.label}</div>
                      <div style={{ color: 'var(--fg-3)', fontSize: 'calc(11px * var(--scale))', marginTop: 4 }}>{f.notes}</div>
                    </span>
                    <span style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.1em' }}>
                      {f.stock}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em' }}>verpackung</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
                {PACKAGES.filter(p => p.bases.includes(cfg.base)).map(p => (
                  <button key={p.id}
                    onClick={() => setCfg({ ...cfg, pack: p.id })}
                    style={{
                      padding: '20px 12px',
                      border: `1px solid ${cfg.pack === p.id ? 'var(--fg)' : 'var(--line)'}`,
                      background: cfg.pack === p.id ? 'var(--bg-2)' : 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div className="placeholder" style={{ height: 64, marginBottom: 10 }}>{p.id}</div>
                    <div style={{ fontSize: 'calc(12px * var(--scale))' }}>{p.label}</div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 32 }}>
                <label style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em' }}>füllmenge · {cfg.weight}g</label>
                <input type="range" min={40} max={300} step={10} value={cfg.weight}
                  onChange={e => setCfg({ ...cfg, weight: +e.target.value })}
                  style={{ width: '100%', marginTop: 10, accentColor: 'var(--accent)' }}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <label style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em' }}>branding</label>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 'calc(11px * var(--scale))', color: 'var(--fg-2)', marginBottom: 6 }}>produkt-name</div>
                  <input value={cfg.name}
                    onChange={e => setCfg({ ...cfg, name: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px',
                      background: 'var(--bg-2)', border: '1px solid var(--line)',
                      color: 'var(--fg)', fontFamily: 'inherit', fontSize: 'calc(15px * var(--scale))',
                      textTransform: 'lowercase',
                    }} />
                </div>
                <div>
                  <div style={{ fontSize: 'calc(11px * var(--scale))', color: 'var(--fg-2)', marginBottom: 6 }}>creator handle</div>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--line)' }}>
                    <span style={{ padding: '12px 0 12px 14px', color: 'var(--fg-3)' }}>@</span>
                    <input value={cfg.handle}
                      onChange={e => setCfg({ ...cfg, handle: e.target.value })}
                      style={{
                        flex: 1, padding: '12px 14px',
                        background: 'transparent', border: 'none',
                        color: 'var(--fg)', fontFamily: 'inherit', fontSize: 'calc(15px * var(--scale))',
                        outline: 'none',
                        textTransform: 'lowercase',
                      }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'calc(11px * var(--scale))', color: 'var(--fg-2)', marginBottom: 8 }}>upload logo (optional)</div>
                  <label style={{
                    display: 'block', height: 100, cursor: 'pointer',
                    border: '1px solid var(--line)',
                    background: cfg.logo ? 'var(--bg-2)' : 'transparent',
                    position: 'relative', overflow: 'hidden',
                  }} className={cfg.logo ? '' : 'placeholder'}>
                    {cfg.logo ? (
                      <>
                        <img src={cfg.logo} style={{ position: 'absolute', inset: 8, width: 'calc(100% - 16px)', height: 'calc(100% - 16px)', objectFit: 'contain' }} />
                        <button onClick={(e) => { e.preventDefault(); setCfg({ ...cfg, logo: null }); }}
                          style={{ position: 'absolute', top: 6, right: 6, background: 'var(--bg)', border: '1px solid var(--line)', padding: '4px 8px', fontSize: 10 }}>
                          entfernen
                        </button>
                      </>
                    ) : <span>klicken zum hochladen · svg / png</span>}
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => setCfg({ ...cfg, logo: ev.target.result });
                        reader.readAsDataURL(f);
                      }} />
                  </label>
                </div>
                <div>
                  <div style={{ fontSize: 'calc(11px * var(--scale))', color: 'var(--fg-2)', marginBottom: 8 }}>produkt-foto (optional)</div>
                  <label style={{
                    display: 'block', height: 100, cursor: 'pointer',
                    border: '1px solid var(--line)',
                    background: cfg.photo ? 'var(--bg-2)' : 'transparent',
                    position: 'relative', overflow: 'hidden',
                  }} className={cfg.photo ? '' : 'placeholder'}>
                    {cfg.photo ? (
                      <>
                        <img src={cfg.photo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={(e) => { e.preventDefault(); setCfg({ ...cfg, photo: null }); }}
                          style={{ position: 'absolute', top: 6, right: 6, background: 'var(--bg)', border: '1px solid var(--line)', padding: '4px 8px', fontSize: 10 }}>
                          entfernen
                        </button>
                      </>
                    ) : <span>key visual · optional</span>}
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => setCfg({ ...cfg, photo: ev.target.result });
                        reader.readAsDataURL(f);
                      }} />
                  </label>
                </div>
                <div style={{ padding: 16, border: '1px dashed var(--line)', background: 'var(--bg-2)' }}>
                  <div style={{ fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.15em', color: 'var(--fg-3)', marginBottom: 6 }}>
                    ai-assist
                  </div>
                  <div style={{ fontSize: 'calc(13px * var(--scale))', lineHeight: 1.6 }}>
                    lass foofab-studio ein packaging-mockup aus deiner handle generieren →
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <label style={{ color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.2em' }}>launch-kalkulation</label>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 'calc(11px * var(--scale))', color: 'var(--fg-2)', marginBottom: 6 }}>charge · {cfg.units.toLocaleString()} einheiten</div>
                <input type="range" min={1000} max={50000} step={1000} value={cfg.units}
                  onChange={e => setCfg({ ...cfg, units: +e.target.value })}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} />
              </div>

              <div style={{ marginTop: 28, border: '1px solid var(--line)' }}>
                {[
                  ['kostenpreis / stk',    '€1,00'],
                  ['vk empfohlen / stk',   '€3,49'],
                  ['gesamt-einkauf',       `€${totalCost.toLocaleString('de-DE')}`],
                  ['brutto-umsatz',        `€${grossRev.toLocaleString('de-DE')}`],
                  ['brutto-gewinn',        `€${grossProfit.toLocaleString('de-DE')}`],
                  ['marge',                '71%'],
                ].map(([k, v], i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: i < 5 ? '1px solid var(--line)' : 'none',
                    background: i === 4 ? 'var(--bg-2)' : 'transparent',
                  }}>
                    <span style={{ color: 'var(--fg-2)', fontSize: 'calc(12px * var(--scale))' }}>{k}</span>
                    <span className="tabular" style={{ fontWeight: i === 4 ? 700 : 400, fontSize: 'calc(13px * var(--scale))' }}>{v}</span>
                  </div>
                ))}
              </div>

              <button style={{
                width: '100%', padding: '18px',
                marginTop: 24,
                background: 'var(--accent)', color: 'var(--accent-ink)',
                fontSize: 'calc(14px * var(--scale))',
                fontWeight: 700, letterSpacing: '0.05em',
                border: 'none', cursor: 'pointer',
              }}>
                → drop einreichen
              </button>
              <div style={{ textAlign: 'center', marginTop: 12, color: 'var(--fg-3)', fontSize: 'calc(10px * var(--scale))', letterSpacing: '0.15em' }}>
                review durch foofab innerhalb 24h
              </div>
            </div>
          )}

          {/* nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              style={{
                padding: '12px 20px', border: '1px solid var(--line)',
                color: step === 0 ? 'var(--fg-3)' : 'var(--fg)',
                cursor: step === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <Arrow dir="left" /> zurück
            </button>
            <button
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              disabled={step === STEPS.length - 1}
              style={{
                padding: '12px 24px',
                background: step === STEPS.length - 1 ? 'var(--bg-2)' : 'var(--fg)',
                color: step === STEPS.length - 1 ? 'var(--fg-3)' : 'var(--bg)',
                border: 'none', cursor: step === STEPS.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              weiter → {STEPS[Math.min(STEPS.length - 1, step + 1)].label}
            </button>
          </div>
        </div>

        {/* RIGHT: preview */}
        <div>
          <div style={{
            position: 'sticky', top: 80,
          }}>
            <ThreeProductPreview cfg={cfg} tilt={tilt} onTiltChange={setTilt} />
            <div style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              fontSize: 'calc(10px * var(--scale))',
              color: 'var(--fg-3)',
              letterSpacing: '0.1em',
            }}>
              <div>
                <div style={{ color: 'var(--fg-2)' }}>shape</div>
                <div style={{ color: 'var(--fg)', marginTop: 4 }}>{cfg.shape}</div>
              </div>
              <div>
                <div style={{ color: 'var(--fg-2)' }}>flavor</div>
                <div style={{ color: 'var(--fg)', marginTop: 4 }}>{cfg.flavor}</div>
              </div>
              <div>
                <div style={{ color: 'var(--fg-2)' }}>pack</div>
                <div style={{ color: 'var(--fg)', marginTop: 4 }}>{cfg.pack}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Configurator = Configurator;
