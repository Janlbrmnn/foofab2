// App — router + tweak wiring

const { useState, useEffect } = React;

const App = () => {
  const [page, setPage] = useState(() => localStorage.getItem('foofab.page') || 'landing');
  const [settings, setSettingsRaw] = useState(window.TWEAK_DEFAULTS || { theme: 'light', accent: 'terracotta', typeScale: 'medium' });
  const [images, setImagesRaw] = useState(() => {
    try {return JSON.parse(localStorage.getItem('foofab.images') || '{}');}
    catch {return {};}
  });
  const [tweaksOpen, setTweaksOpen] = useState(false);

  // Publish images globally so ImgSlot can read them live.
  // Persisting to localStorage is now EXPLICIT via saveImages() — some
  // dataURLs exceed the quota, so auto-save was failing silently.
  const [imagesSaveState, setImagesSaveState] = useState('saved'); // 'saved' | 'dirty' | 'error'

  useEffect(() => {
    window.__IMAGES__ = images;
    window.dispatchEvent(new Event('imagesupdate'));
  }, [images]);

  const setImages = (next) => {
    setImagesRaw(next);
    setImagesSaveState('dirty');
  };

  const saveImages = () => {
    try {
      localStorage.setItem('foofab.images', JSON.stringify(images));
      setImagesSaveState('saved');
      return true;
    } catch (e) {
      setImagesSaveState('error');
      return false;
    }
  };

  useEffect(() => {
    localStorage.setItem('foofab.page', page);
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-accent', settings.accent);
    document.documentElement.setAttribute('data-scale', settings.typeScale);
  }, [settings]);

  const setSettings = (s) => {
    setSettingsRaw(s);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: s }, '*');
  };

  // Edit-mode protocol — register listener FIRST, then announce
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);else
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const go = (p) => { setPage(p); setMenuOpen(false); };

  const nav =
  <nav className="nav" data-screen-label={page}>
      <button className="nav-brand" onClick={() => go('landing')} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Wordmark height={22} />
      </button>
      <button className={'nav-burger ' + (menuOpen ? 'open' : '')}
        onClick={() => setMenuOpen(v => !v)} aria-label="menu">
        <span /><span /><span />
      </button>
      <div className={'nav-links ' + (menuOpen ? 'open' : '')}>
        <button onClick={() => go('hub')}>about</button>
        <button className={page === 'config' || page === 'inspire' || page === 'collab' ? 'active' : ''}
      onClick={() => go('hub')}>create</button>
        <button onClick={() => go('landing')}>impressum</button>
      </div>
    </nav>;


  return (
    <>
      {page !== 'landing' && nav}
      {page === 'landing' && <Landing onEnter={() => setPage('hub')} />}
      {page === 'hub' && <Hub onGo={setPage} />}
      {page === 'config' && <Configurator />}
      {page === 'inspire' && <Inspire onConfig={() => setPage('config')} />}
      {page === 'collab' && <Collab />}

      <Tweaks open={tweaksOpen} onClose={() => setTweaksOpen(false)}
      settings={settings} setSettings={setSettings}
      images={images} setImages={setImages}
      imagesSaveState={imagesSaveState} saveImages={saveImages} />
    </>);

};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);