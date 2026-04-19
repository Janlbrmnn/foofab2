// Editor-only image slots — not clickable in the rendered UI.
// Reads `window.__IMAGES__[slot]` (published by App) and renders either the
// user-uploaded image or a striped placeholder. Each slot is registered on
// mount so Tweaks can list all available slots dynamically.

window.__IMAGE_SLOTS__ = window.__IMAGE_SLOTS__ || {}; // id -> { label, group, registeredAt }

const registerImageSlot = (id, label, group) => {
  if (!window.__IMAGE_SLOTS__[id]) {
    window.__IMAGE_SLOTS__[id] = { id, label, group };
    window.dispatchEvent(new CustomEvent('imageslotsupdate'));
  }
};

const ImgSlot = (props) => {
  const slot = props.slot;
  const label = props.label;
  const group = props.group || 'misc';
  const style = props.style || {};
  const className = props.className || '';
  const children = props.children;
  const fit = props.fit || 'cover';

  // Register synchronously during render so the panel can see it on first paint.
  registerImageSlot(slot, label || slot, group);

  const forceState = React.useState(0);
  const force = forceState[1];
  React.useEffect(() => {
    const h = () => force((n) => n + 1);
    window.addEventListener('imagesupdate', h);
    return () => window.removeEventListener('imagesupdate', h);
  }, []);

  // 1. user upload (localStorage)  2. baked default (assets/images/<slot>.jpg)
  const userSrc = (window.__IMAGES__ || {})[slot];
  const [defaultSrc, setDefaultSrc] = React.useState(null);
  const [defaultMissing, setDefaultMissing] = React.useState(false);

  React.useEffect(() => {
    if (userSrc) return; // user upload wins
    // Try loading the baked default
    const candidates = [
      `assets/images/${slot}.jpg`,
      `assets/images/${slot}.png`,
    ];
    let cancelled = false;
    let i = 0;
    const tryNext = () => {
      if (cancelled || i >= candidates.length) { setDefaultMissing(true); return; }
      const img = new Image();
      img.onload = () => { if (!cancelled) setDefaultSrc(candidates[i]); };
      img.onerror = () => { i++; tryNext(); };
      img.src = candidates[i];
    };
    tryNext();
    return () => { cancelled = true; };
  }, [slot, userSrc]);

  const src = userSrc || defaultSrc;

  if (src) {
    return (
      <div className={className} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
        <img src={src} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: fit,
        }} />
      </div>
    );
  }

  // Placeholder fallback
  return (
    <div className={('placeholder ' + className).trim()} style={style}>
      {children}
    </div>
  );
};

window.ImgSlot = ImgSlot;
window.registerImageSlot = registerImageSlot;
