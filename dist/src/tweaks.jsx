// Tweaks panel — accent, type scale + editor-only image uploads

const Tweaks = ({ open, onClose, settings, setSettings, images, setImages, imagesSaveState, saveImages }) => {
  const [slots, setSlots] = React.useState(() => Object.values(window.__IMAGE_SLOTS__ || {}));
  const [compressing, setCompressing] = React.useState(false);

  React.useEffect(() => {
    const h = () => setSlots(Object.values(window.__IMAGE_SLOTS__ || {}));
    h(); // sync current state immediately
    window.addEventListener('imageslotsupdate', h);
    return () => window.removeEventListener('imageslotsupdate', h);
  }, []);

  const groups = slots.reduce((acc, s) => {
    (acc[s.group] = acc[s.group] || []).push(s);
    return acc;
  }, {});

  // Downscale + compress via canvas so dataURLs fit the localStorage quota
  // (~5MB total). Max long edge 900px, JPEG 0.82 — visually fine for layout.
  const compressImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        // White background for transparent PNGs so JPEG doesn't go black
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        // Keep PNG for small logos (preserves crisp edges); JPEG for photos
        const mime = (file.type === 'image/png' && Math.max(w, h) <= 400) ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, 0.82));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleUpload = async (id, file) => {
    if (!file) return;
    setCompressing(true);
    try {
      const dataUrl = await compressImage(file);
      setImages({ ...images, [id]: dataUrl });
    } catch (e) {
      console.error('upload failed', e);
    } finally {
      setCompressing(false);
    }
  };

  const clearImage = (id) => {
    const next = { ...images };
    delete next[id];
    setImages(next);
  };

  const clearAll = () => setImages({});

  // Sequentially trigger downloads for each uploaded image, named `<slot>.jpg`.
  // User saves them all into `assets/images/` in their repo to bake them in.
  const exportForDeploy = async () => {
    const entries = Object.entries(images || {});
    for (const [id, dataUrl] of entries) {
      const ext = dataUrl.startsWith('data:image/png') ? 'png' : 'jpg';
      const blob = await (await fetch(dataUrl)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      // Stagger so browser doesn't choke on multiple downloads
      await new Promise(r => setTimeout(r, 250));
    }
  };

  return (
    <div className={'tweaks-panel ' + (open ? 'open' : '')}>
      <div className="tweaks-head">
        <span>tweaks</span>
        <button onClick={onClose} aria-label="close"><Cross /></button>
      </div>
      <div className="tweaks-body" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        <div className="tweaks-row">
          <label>accent</label>
          <div className="tweaks-opts">
            {[
              ['terracotta', 'oklch(0.72 0.14 50)'],
              ['olive',      'oklch(0.66 0.1 115)'],
              ['rose',       'oklch(0.72 0.14 15)'],
              ['ink',        '#16140f'],
              ['amber',      'oklch(0.78 0.13 75)'],
            ].map(([k, c]) => (
              <div
                key={k}
                className={'swatch ' + (settings.accent === k ? 'active' : '')}
                style={{ background: c }}
                onClick={() => setSettings({ ...settings, accent: k })}
                title={k}
              />
            ))}
          </div>
        </div>

        <div className="tweaks-row">
          <label>type scale</label>
          <div className="tweaks-opts">
            {['small','medium','large'].map(v => (
              <button key={v}
                className={settings.typeScale === v ? 'active' : ''}
                onClick={() => setSettings({ ...settings, typeScale: v })}
              >{v}</button>
            ))}
          </div>
        </div>

        {/* Image slots */}
        <div style={{
          marginTop: 8, paddingTop: 14,
          borderTop: '1px solid var(--line)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <label style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>
            bilder
          </label>
          {Object.keys(images || {}).length > 0 && (
            <button
              onClick={clearAll}
              style={{ fontSize: 10, color: 'var(--fg-3)', padding: '2px 6px', border: '1px solid var(--line)' }}
            >alle entfernen</button>
          )}
        </div>

        {slots.length === 0 && (
          <div style={{ color: 'var(--fg-3)', fontSize: 10, padding: '8px 0', letterSpacing: '0.08em' }}>
            navigiere zwischen den seiten — bild-slots erscheinen hier, sobald sie sichtbar werden.
          </div>
        )}

        {Object.entries(groups).map(([group, items]) => (
          <div key={group} style={{ marginTop: 6 }}>
            <div style={{
              fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--fg-3)', margin: '10px 0 6px',
            }}>
              {group}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {items.map(slot => {
                const has = images?.[slot.id];
                return (
                  <div key={slot.id} style={{
                    border: '1px solid var(--line)',
                    background: has ? 'var(--bg-2)' : 'transparent',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <label style={{
                      display: 'block', cursor: 'pointer',
                      aspectRatio: '1.2 / 1', position: 'relative',
                    }}>
                      {has ? (
                        <img src={has} alt="" style={{
                          position: 'absolute', inset: 0, width: '100%', height: '100%',
                          objectFit: 'cover',
                        }} />
                      ) : (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'repeating-linear-gradient(135deg, var(--bg-2) 0 4px, var(--bg) 4px 8px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--fg-3)', fontSize: 9, letterSpacing: '0.12em',
                          textTransform: 'uppercase', textAlign: 'center', padding: 4,
                        }}>+ upload</div>
                      )}
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => handleUpload(slot.id, e.target.files?.[0])} />
                    </label>
                    <div style={{
                      padding: '4px 6px',
                      fontSize: 9, color: 'var(--fg-2)',
                      letterSpacing: '0.05em',
                      borderTop: '1px solid var(--line)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      gap: 4,
                    }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.label}</span>
                      {has && (
                        <button
                          onClick={() => clearImage(slot.id)}
                          title="entfernen"
                          style={{ color: 'var(--fg-3)', fontSize: 11, lineHeight: 1 }}
                        >×</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Export for deploy — download all uploaded images as files
            to commit into assets/images/ in the repo */}
        {Object.keys(images || {}).length > 0 && (
          <div style={{
            marginTop: 14, padding: '10px 0',
            borderTop: '1px dashed var(--line)',
          }}>
            <div style={{
              fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--fg-3)', marginBottom: 6,
            }}>
              für deployment
            </div>
            <button
              onClick={exportForDeploy}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'transparent',
                color: 'var(--fg)',
                border: '1px solid var(--line)',
                fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              ↓ als dateien exportieren
            </button>
            <div style={{
              fontSize: 9, color: 'var(--fg-3)', marginTop: 6,
              lineHeight: 1.5, letterSpacing: '0.02em',
            }}>
              lädt alle hochgeladenen bilder einzeln herunter.
              in deinem repo unter <code style={{ background: 'var(--bg-2)', padding: '1px 4px' }}>assets/images/</code> ablegen und pushen — dann sehen alle besucher die bilder.
            </div>
          </div>
        )}

        {/* Save bar — sticky at bottom of panel */}
        {slots.length > 0 && (
          <div style={{
            position: 'sticky', bottom: 0,
            marginTop: 14, marginLeft: -14, marginRight: -14, marginBottom: -14,
            padding: '12px 14px',
            background: 'var(--bg)',
            borderTop: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <button
              onClick={saveImages}
              disabled={imagesSaveState === 'saved' || compressing}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: imagesSaveState === 'dirty' ? 'var(--fg)' : 'transparent',
                color: imagesSaveState === 'dirty' ? 'var(--bg)' : 'var(--fg-3)',
                border: '1px solid ' + (imagesSaveState === 'dirty' ? 'var(--fg)' : 'var(--line)'),
                fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: (imagesSaveState === 'saved' || compressing) ? 'default' : 'pointer',
                opacity: compressing ? 0.6 : 1,
              }}
            >
              {compressing ? 'komprimiere…'
                : imagesSaveState === 'dirty' ? 'speichern'
                : imagesSaveState === 'error' ? 'nochmal versuchen'
                : 'gespeichert ✓'}
            </button>
            <div style={{
              fontSize: 9, letterSpacing: '0.1em',
              color: imagesSaveState === 'error' ? 'oklch(0.65 0.18 25)' : 'var(--fg-3)',
              textAlign: 'right', maxWidth: 120, lineHeight: 1.3,
            }}>
              {imagesSaveState === 'error'
                ? 'speicher voll — bilder entfernen'
                : imagesSaveState === 'dirty'
                ? 'ungespeicherte änderungen'
                : 'auto-komprimiert · max 900px'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

window.Tweaks = Tweaks;
