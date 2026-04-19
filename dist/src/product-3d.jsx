// Three.js product preview — procedural geometry per pack type, with a
// paper label textured via a drawn Canvas. No external 3D files: every
// shape is simple primitives we fully control, so labels sit exactly where
// they should.

// ───────────────────────────────────────────────────────────────────
// Label canvas generator — draws artwork at the EXACT aspect ratio of
// the physical label, so it never gets stretched when wrapped around
// a cylinder or applied to a plane. Call with world-unit dimensions:
// for curved labels, widthUnits = arcLength (radius × thetaLength).
// ───────────────────────────────────────────────────────────────────
const drawLabelCanvas = (cfg, pack, widthUnits, heightUnits) => {
  // Fixed pixel density so small labels stay legible
  const PX_PER_UNIT = 420;
  const w = Math.max(256, Math.round(widthUnits * PX_PER_UNIT));
  const h = Math.max(256, Math.round(heightUnits * PX_PER_UNIT));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const accent = cfg?.color || '#c85250';
  const name = (cfg?.name || 'foofab drop').toLowerCase();
  const handle = '@' + (cfg?.handle || 'foodcreator');

  // Use the SMALLER dimension for type scaling so labels read well on
  // wide thin bands (tin) AND narrow tall strips (tube).
  const base = Math.min(w, h);

  // Paper base
  ctx.fillStyle = '#f6f3ec';
  ctx.fillRect(0, 0, w, h);

  // Accent top band (proportional to h)
  ctx.fillStyle = accent;
  const bandH = Math.round(h * 0.20);
  ctx.fillRect(0, 0, w, bandH);

  // Brand mark — sized to the shorter dimension
  ctx.fillStyle = '#f6f3ec';
  ctx.font = `700 ${Math.round(base * 0.075)}px monospace`;
  ctx.textBaseline = 'top';
  const pad = Math.round(w * 0.04);
  ctx.fillText('FOOFAB', pad, Math.round(bandH * 0.30));

  ctx.textAlign = 'right';
  ctx.font = `700 ${Math.round(base * 0.058)}px monospace`;
  ctx.fillText(`[ ${pack.toUpperCase()} ]`, w - pad, Math.round(bandH * 0.34));
  ctx.textAlign = 'left';

  // Product name — title uses base-relative size; wrap if too long
  ctx.fillStyle = '#16140f';
  const titleSize = Math.round(base * 0.22);
  ctx.font = `italic ${titleSize}px "Georgia", serif`;
  const maxW = w - pad * 2;
  const words = name.split(' ');
  const lines = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? cur + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  const lineH = titleSize * 1.05;
  const blockH = lines.length * lineH;
  const titleTop = bandH + (h - bandH - Math.round(h * 0.30)) / 2 - blockH / 2 + lineH * 0.8;
  lines.forEach((line, i) => {
    ctx.fillText(line, pad, titleTop + i * lineH);
  });

  // Divider
  ctx.strokeStyle = '#16140f';
  ctx.lineWidth = Math.max(2, Math.round(h * 0.004));
  const divY = h - Math.round(h * 0.28);
  ctx.beginPath();
  ctx.moveTo(pad, divY);
  ctx.lineTo(w - pad, divY);
  ctx.stroke();

  // Handle + weight row
  ctx.font = `700 ${Math.round(base * 0.065)}px monospace`;
  ctx.fillStyle = '#16140f';
  ctx.textBaseline = 'top';
  ctx.fillText(handle, pad, divY + Math.round(h * 0.04));
  ctx.textAlign = 'right';
  ctx.fillText(`${cfg?.weight || 120}G`, w - pad, divY + Math.round(h * 0.04));
  ctx.textAlign = 'left';

  // Flavor line
  ctx.font = `${Math.round(base * 0.05)}px monospace`;
  ctx.fillStyle = 'rgba(22,20,15,0.7)';
  ctx.fillText(`FLAVOR · ${(cfg?.flavor || '').replace('-', ' ').toUpperCase()}`,
    pad, divY + Math.round(h * 0.11));

  // Bottom accent stripe
  ctx.fillStyle = accent;
  ctx.fillRect(0, h - Math.round(h * 0.035), w, Math.round(h * 0.035));

  // Barcode at bottom right
  const barX = w - pad - Math.round(base * 0.30);
  const barY = h - Math.round(h * 0.115);
  const barH = Math.round(h * 0.06);
  ctx.fillStyle = '#16140f';
  const widths = [2, 4, 2, 6, 3, 2, 5, 3, 2, 4, 2, 3, 6, 2, 4];
  let bx = barX;
  for (const bw of widths) {
    const scale = Math.max(1, base * 0.004);
    ctx.fillRect(bx, barY, bw * scale, barH);
    bx += (bw + 3) * scale;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.anisotropy = 8;
  if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
  return tex;
};

// ───────────────────────────────────────────────────────────────────
// Procedural pack builders
// ───────────────────────────────────────────────────────────────────
const PACK_TINTS = (accent) => {
  const a = new THREE.Color(accent);
  return {
    body:  new THREE.Color(0xf0ebdc).lerp(a, 0.20), // cream w/ accent hint
    metal: new THREE.Color(0xe8e5dc).lerp(a, 0.05),
    cap:   new THREE.Color(0x2a2825),
    dark:  new THREE.Color(0x16140f),
  };
};

const stdMat = (color, { rough = 0.8, metal = 0.05 } = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

// ── Doypack / pouch ─────────────────────────────────────────────
// Pouch silhouette: rectangle with slightly tapered/rounded top, small
// gusseted bottom. Built via ExtrudeGeometry of a 2D shape.
const buildPouch = (cfg) => {
  const group = new THREE.Group();
  const tints = PACK_TINTS(cfg?.color || '#c85250');

  const w = 2.8, h = 4.0, d = 0.9;
  const r = 0.12;

  const shape = new THREE.Shape();
  // bottom-left (gusset)
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  // up right side
  shape.lineTo(w / 2, h / 2 - 0.35);
  // top shoulder curve
  shape.quadraticCurveTo(w / 2 - 0.15, h / 2 - 0.15, w / 2 - 0.35, h / 2);
  // top crimp
  shape.lineTo(-w / 2 + 0.35, h / 2);
  shape.quadraticCurveTo(-w / 2 + 0.15, h / 2 - 0.15, -w / 2, h / 2 - 0.35);
  // down left side
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 3,
    curveSegments: 16,
  });
  geo.translate(0, 0, -d / 2);
  const body = new THREE.Mesh(geo, stdMat(tints.body, { rough: 0.88, metal: 0.03 }));
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Top crimp (horizontal stripe at very top, darker)
  const crimpGeo = new THREE.BoxGeometry(w - 0.5, 0.18, d + 0.18);
  const crimp = new THREE.Mesh(crimpGeo, stdMat(tints.dark, { rough: 0.7, metal: 0.3 }));
  crimp.position.y = h / 2 - 0.09;
  crimp.castShadow = true;
  group.add(crimp);

  // Label flat on the front face (ExtrudeGeometry gives us a flat face)
  const label = buildFlatLabel({
    cfg, pack: 'pouch',
    width: w * 0.78,
    height: h * 0.72,
    faceDepth: d / 2 + 0.08, // in front of bevel
  });
  label.position.y = -h * 0.02;
  group.add(label);

  return group;
};

// ── Jar ─────────────────────────────────────────────────────────
const buildJar = (cfg) => {
  const group = new THREE.Group();
  const tints = PACK_TINTS(cfg?.color || '#c85250');

  const bodyR = 1.25, bodyH = 2.8;
  const capR = 1.15, capH = 0.55;

  // Body: glass-like but we keep it opaque tinted since brand color matters
  const bodyGeo = new THREE.CylinderGeometry(bodyR, bodyR, bodyH, 48, 1);
  const body = new THREE.Mesh(bodyGeo, stdMat(tints.body, { rough: 0.3, metal: 0.1 }));
  body.position.y = 0;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Cap (top)
  const capGeo = new THREE.CylinderGeometry(capR, capR, capH, 48, 1);
  const cap = new THREE.Mesh(capGeo, stdMat(tints.cap, { rough: 0.4, metal: 0.6 }));
  cap.position.y = bodyH / 2 + capH / 2;
  cap.castShadow = true;
  group.add(cap);

  // Cap threading ring
  const ringGeo = new THREE.TorusGeometry(capR - 0.02, 0.04, 8, 48);
  const ring = new THREE.Mesh(ringGeo, stdMat(tints.dark, { rough: 0.6, metal: 0.4 }));
  ring.position.y = bodyH / 2 + 0.02;
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  // Curved label wrapping the body
  const label = buildWraparoundLabel({
    cfg, pack: 'jar',
    radius: bodyR * 1.003,
    height: bodyH * 0.65,
    thetaDeg: 160,
    yOffset: -bodyH * 0.05,
  });
  group.add(label);

  return group;
};

// ── Tin ─────────────────────────────────────────────────────────
// Short wide cylinder with a slight cap lip on top.
const buildTin = (cfg) => {
  const group = new THREE.Group();
  const tints = PACK_TINTS(cfg?.color || '#c85250');

  const r = 1.6, h = 1.1;
  const lipR = r * 1.02, lipH = 0.12;

  const bodyGeo = new THREE.CylinderGeometry(r, r, h, 64, 1);
  const body = new THREE.Mesh(bodyGeo, stdMat(tints.metal, { rough: 0.25, metal: 0.75 }));
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Lid lip (slightly wider ring at top)
  const lipGeo = new THREE.CylinderGeometry(lipR, lipR, lipH, 64, 1);
  const lip = new THREE.Mesh(lipGeo, stdMat(tints.body, { rough: 0.3, metal: 0.7 }));
  lip.position.y = h / 2 - lipH / 2 + 0.01;
  group.add(lip);

  // Label wraps body
  const label = buildWraparoundLabel({
    cfg, pack: 'tin',
    radius: r * 1.005,
    height: h * 0.72,
    thetaDeg: 180,
    yOffset: -h * 0.06,
  });
  group.add(label);

  return group;
};

// ── Tube ────────────────────────────────────────────────────────
// Slim tall cylinder with a rounded shoulder + screw cap.
const buildTube = (cfg) => {
  const group = new THREE.Group();
  const tints = PACK_TINTS(cfg?.color || '#c85250');

  const r = 0.55, bodyH = 3.6;
  const shoulderH = 0.22;
  const capR = 0.52, capH = 0.55;

  const bodyGeo = new THREE.CylinderGeometry(r, r, bodyH, 48, 1);
  const body = new THREE.Mesh(bodyGeo, stdMat(tints.body, { rough: 0.5, metal: 0.15 }));
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Shoulder — narrows from r to capR
  const shGeo = new THREE.CylinderGeometry(capR, r, shoulderH, 48, 1);
  const sh = new THREE.Mesh(shGeo, stdMat(tints.body, { rough: 0.45, metal: 0.2 }));
  sh.position.y = bodyH / 2 + shoulderH / 2;
  group.add(sh);

  // Cap
  const capGeo = new THREE.CylinderGeometry(capR, capR, capH, 48, 1);
  const cap = new THREE.Mesh(capGeo, stdMat(tints.cap, { rough: 0.35, metal: 0.5 }));
  cap.position.y = bodyH / 2 + shoulderH + capH / 2;
  cap.castShadow = true;
  group.add(cap);

  // Label wraps body
  const label = buildWraparoundLabel({
    cfg, pack: 'tube',
    radius: r * 1.005,
    height: bodyH * 0.78,
    thetaDeg: 170,
    yOffset: -bodyH * 0.04,
  });
  group.add(label);

  return group;
};

// ── Bar box ─────────────────────────────────────────────────────
// A flat-ish box containing multiple bars — we just render the outer box.
const buildBar = (cfg) => {
  const group = new THREE.Group();
  const tints = PACK_TINTS(cfg?.color || '#c85250');

  const w = 3.2, h = 1.4, d = 1.6;
  const geo = new THREE.BoxGeometry(w, h, d);
  const body = new THREE.Mesh(geo, stdMat(tints.body, { rough: 0.88, metal: 0.02 }));
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Label on the front (XY plane)
  const label = buildFlatLabel({
    cfg, pack: 'bar',
    width: w * 0.84,
    height: h * 0.62,
    faceDepth: d / 2 + 0.005,
  });
  group.add(label);

  return group;
};

// ── Calendar ────────────────────────────────────────────────────
const buildCalendar = (cfg) => {
  const group = new THREE.Group();
  const w = 4.6, hh = 3.4, d = 0.9;
  const geo = new THREE.BoxGeometry(w, hh, d);
  const paper = new THREE.MeshStandardMaterial({
    color: 0xf0ebdc,
    roughness: 0.9,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geo, paper);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Front face — door grid on canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = Math.round(1024 * (hh / w));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f6f3ec';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const accent = cfg?.color || '#c85250';

  ctx.fillStyle = '#16140f';
  ctx.font = '700 28px monospace';
  ctx.fillText('FOOFAB · ADVENTSKALENDER', 40, 50);
  ctx.font = 'italic 72px "Georgia", serif';
  ctx.fillText((cfg?.name || '24 tage drop').slice(0, 24), 40, 130);

  ctx.font = '700 28px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('24 TÜRCHEN', canvas.width - 40, 50);
  ctx.textAlign = 'left';

  const gridX = 40, gridY = 180;
  const gridW = canvas.width - 80;
  const gridH = canvas.height - 240;
  const cols = 6, rows = 4;
  const gap = 10;
  const cellW = (gridW - gap * (cols - 1)) / cols;
  const cellH = (gridH - gap * (rows - 1)) / rows;
  const accentDoors = [2, 7, 11, 18, 22];
  for (let i = 0; i < 24; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = gridX + col * (cellW + gap);
    const y = gridY + row * (cellH + gap);
    const isAccent = accentDoors.includes(i);
    ctx.fillStyle = isAccent ? accent : '#ffffff';
    ctx.fillRect(x, y, cellW, cellH);
    ctx.strokeStyle = '#16140f';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, cellW, cellH);
    ctx.fillStyle = isAccent ? '#ffffff' : '#16140f';
    ctx.font = '700 54px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), x + cellW / 2, y + cellH / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  const labelGeo = new THREE.PlaneGeometry(w * 0.98, hh * 0.95);
  const labelMat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.85,
    metalness: 0.02,
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.z = d / 2 + 0.002;
  group.add(label);

  return group;
};

// ───────────────────────────────────────────────────────────────────
// Label helpers — flat, curved, wraparound. All pass physical dimensions
// to drawLabelCanvas so the artwork aspect matches the surface aspect —
// no stretching.
// ───────────────────────────────────────────────────────────────────
const buildFlatLabel = ({ cfg, pack, width, height, faceDepth }) => {
  const tex = drawLabelCanvas(cfg, pack, width, height);
  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.82,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = faceDepth;
  mesh.name = '__foofab_label__';
  return mesh;
};

// Wraparound label (jar, tin, tube) — cylinder slice around Y axis
const buildWraparoundLabel = ({ cfg, pack, radius, height, thetaDeg = 170, yOffset = 0 }) => {
  const thetaLength = (thetaDeg * Math.PI) / 180;
  const arcLength = radius * thetaLength;
  const tex = drawLabelCanvas(cfg, pack, arcLength, height);
  const thetaStart = -Math.PI / 2 - thetaLength / 2;
  const geo = new THREE.CylinderGeometry(
    radius, radius, height, 96, 1, true, thetaStart, thetaLength
  );
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.82,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = yOffset;
  mesh.name = '__foofab_label__';
  return mesh;
};

// ───────────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────────

const BUILDERS = {
  pouch:    buildPouch,
  jar:      buildJar,
  tin:      buildTin,
  tube:     buildTube,
  bar:      buildBar,
  calendar: buildCalendar,
};

const ThreeProductPreview = ({ cfg, tilt, onTiltChange }) => {
  const mountRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const rendererRef = React.useRef(null);
  const cameraRef = React.useRef(null);
  const objectRef = React.useRef(null);
  const dragRef = React.useRef(null);
  const tiltRef = React.useRef(tilt);
  tiltRef.current = tilt;

  // Setup scene once
  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    else if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(5, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.width = 1024;
    key.shadow.mapSize.height = 1024;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xfff0e0, 0.35);
    fill.position.set(-4, 2, 3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xaaccff, 0.28);
    rim.position.set(-2, 3, -5);
    scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.3;
    ground.receiveShadow = true;
    scene.add(ground);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    let raf;
    const tick = () => {
      if (objectRef.current) {
        const t = tiltRef.current;
        objectRef.current.rotation.y = (t.y * Math.PI) / 180;
        objectRef.current.rotation.x = (t.x * Math.PI) / 180;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Build / rebuild the product whenever cfg changes.
  // Rebuilding is cheap with primitives — no async loading.
  React.useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Dispose previous
    if (objectRef.current) {
      scene.remove(objectRef.current);
      objectRef.current.traverse((c) => {
        if (c.isMesh) {
          c.geometry?.dispose();
          const mats = Array.isArray(c.material) ? c.material : [c.material];
          mats.forEach(m => {
            m?.map?.dispose();
            m?.dispose();
          });
        }
      });
      objectRef.current = null;
    }

    const builder = BUILDERS[cfg.pack] || BUILDERS.pouch;
    const obj = builder(cfg);
    obj.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
    scene.add(obj);
    objectRef.current = obj;
  }, [cfg.pack, cfg.color, cfg.name, cfg.handle, cfg.flavor, cfg.weight]);

  // Pointer drag → rotate
  const onPointerDown = (e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, tilt: { ...tiltRef.current } };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = 'grabbing';
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    // Prevent the page from scrolling/selecting during drag
    if (e.cancelable) e.preventDefault();
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    // Higher sensitivity on touch devices (smaller screens = less finger travel)
    const isTouch = e.pointerType === 'touch';
    const sx = isTouch ? 0.9 : 0.5;
    const sy = isTouch ? 0.7 : 0.4;
    onTiltChange({
      y: dragRef.current.tilt.y + dx * sx,
      x: Math.max(-60, Math.min(60, dragRef.current.tilt.x - dy * sy)),
    });
  };
  const onPointerUp = (e) => {
    dragRef.current = null;
    if (e?.currentTarget) e.currentTarget.style.cursor = 'grab';
  };

  return (
    <div style={{
      width: '100%',
      aspectRatio: '1 / 1.15',
      position: 'relative',
      background: 'linear-gradient(160deg, var(--bg-2) 0%, var(--bg) 60%, var(--bg-2) 100%)',
      border: '1px solid var(--line)',
      overflow: 'hidden',
      cursor: 'grab',
      touchAction: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
    }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.22, pointerEvents: 'none' }}>
        <defs>
          <pattern id="dots-3d" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="0.6" fill="var(--fg-3)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-3d)" />
      </svg>

      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      <div style={{
        position: 'absolute',
        top: 12, left: 12,
        fontSize: 'calc(9px * var(--scale))',
        color: 'var(--fg-3)',
        letterSpacing: '0.15em',
        pointerEvents: 'none',
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
        pointerEvents: 'none',
      }}>
        <span style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent)',
        }} />
        rendering
      </div>
      <div style={{
        position: 'absolute',
        bottom: 12, left: 12, right: 12,
        fontSize: 'calc(9px * var(--scale))',
        color: 'var(--fg-3)',
        letterSpacing: '0.1em',
        display: 'flex', justifyContent: 'space-between',
        pointerEvents: 'none',
      }}>
        <span>rot y: {tilt.y.toFixed(0)}° · x: {tilt.x.toFixed(0)}°</span>
        <span>drag to rotate</span>
      </div>
    </div>
  );
};

window.ThreeProductPreview = ThreeProductPreview;
