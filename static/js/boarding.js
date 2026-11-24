// WorldLive — cinematic 3D boarding & arrival.
// A procedural airliner on the apron (no external models), airstairs, and two stylised travellers —
// the couple — walking hand in hand, climbing up (board) or coming down (arrive). The city's real
// skyline glows on the horizon. ~10 s, skippable, disposed completely afterwards.
import { $, h } from "./core.js";
import { L, t } from "./i18n.js";

const THREE = window.THREE;
const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, k) => a + (b - a) * k;

// ------------------------------------------------------------------ airliner
// the airline livery painted onto the fuselage: one canvas wrapped around the hull
// (u = around the body — 0 the side facing the camera, rising toward the crown; v = nose → tail)
function livery(hi) {
  const W = hi ? 2048 : 1024, H = W * 2, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"), NOSE = 8.6, LEN = 16.9;
  const py = (lx) => ((NOSE - lx) / LEN) * H, pu = (deg) => (((1 + deg / 360) % 1) + 1) % 1 * W;   // deg above the side mid-line
  // base: warm pearl white with a soft vertical sheen
  const g0 = x.createLinearGradient(0, 0, W, 0);
  g0.addColorStop(0, "#eef0f3"); g0.addColorStop(0.25, "#fbfbf9"); g0.addColorStop(0.5, "#f6f6f3"); g0.addColorStop(1, "#eef0f3");
  x.fillStyle = g0; x.fillRect(0, 0, W, H);
  // navy belly from the window line down, with a champagne-gold cheatline, sweeping up at the tail
  const navy = "#13203a", goldC = "#d9b36c";
  const belly = (a0, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(pu(a0), py(7.3)); x.lineTo(pu(a0), py(-6.6)); x.lineTo(pu(-180 - a0), py(-6.6)); x.lineTo(pu(-180 - a0), py(7.3)); x.closePath(); x.fill(); };
  belly(-14, goldC); belly(-17, navy);
  // nose: gently fade the belly in
  const fade = x.createLinearGradient(0, py(8.6), 0, py(6.6)); fade.addColorStop(0, "#f6f6f3"); fade.addColorStop(1, "rgba(246,246,243,0)");
  x.fillStyle = fade; x.fillRect(pu(-170), py(8.6), pu(-10) - pu(-170), py(6.6) - py(8.6));
  // panel seams
  x.strokeStyle = "rgba(60,70,90,.12)"; x.lineWidth = Math.max(1, W / 1400);
  for (let lx = 6.4; lx > -6; lx -= 1.05) { x.beginPath(); x.moveTo(0, py(lx)); x.lineTo(W, py(lx)); x.stroke(); }
  // passenger windows: rounded, recessed, with a light frame (camera side only — the far side is never seen)
  const wy = pu(14), ww = (0.27 / 1.3) * (180 / Math.PI) / 360 * W, wh = (0.19 / LEN) * H;
  for (let lx = 5.2; lx > -4.9; lx -= 0.33) {
    if (Math.abs(lx - 5.0) < 0.5 || Math.abs(lx + 0.9) < 0.25) continue;     // door + over-wing exit gap
    const cx = wy, cy = py(lx);
    x.fillStyle = "#c9ced6"; rr(x, cx - ww / 2 - 3, cy - wh / 2 - 3, ww + 6, wh + 6, wh * 0.55); x.fill();
    const gw = x.createLinearGradient(cx - ww / 2, 0, cx + ww / 2, 0); gw.addColorStop(0, "#1b2a44"); gw.addColorStop(0.5, "#0b1322"); gw.addColorStop(1, "#24375a");
    x.fillStyle = gw; rr(x, cx - ww / 2, cy - wh / 2, ww, wh, wh * 0.5); x.fill();
  }
  // door outline + emergency exit outline
  x.strokeStyle = "rgba(80,90,110,.55)"; x.lineWidth = Math.max(2, W / 900);
  const ex = py(-0.9); rr(x, pu(6), ex - wh * 0.9, pu(20) - pu(6), wh * 1.8, wh * 0.3); x.stroke();
  // titles: "WorldLive" along the crown, registration near the tail
  const text = (str, lx, deg, size, col, font = "600") => {
    x.save(); x.translate(pu(deg), py(lx)); x.transform(0, -1, -1, 0, 0, 0);   // the hull's u runs upward: mirror into reading order x.fillStyle = col; x.textBaseline = "middle";
    x.font = `${font} ${size}px 'Cormorant Garamond', Georgia, serif`; x.fillText(str, 0, 0); x.restore();
  };
  const fs = (0.6 / LEN) * H;
  // roundel: navy disc, champagne ring, “WL” monogram — the airline mark, ahead of the title
  {
    const cx = pu(40), cy = py(-2.15), R = (0.34 / LEN) * H;
    x.save(); x.translate(cx, cy); x.transform(0, -1, -1, 0, 0, 0);
    x.fillStyle = navy; x.beginPath(); x.arc(0, 0, R, 0, 6.283); x.fill();
    x.strokeStyle = goldC; x.lineWidth = R * 0.12; x.beginPath(); x.arc(0, 0, R * 0.86, 0, 6.283); x.stroke();
    x.fillStyle = goldC; x.textAlign = "center"; x.textBaseline = "middle"; x.font = `italic 600 ${R * 0.95}px 'Cormorant Garamond', Georgia, serif`; x.fillText("WL", 0, R * 0.04);
    x.restore();
  }
  text("World", -1.6, 40, fs, navy, "600"); x.save(); x.font = `italic 600 ${fs}px 'Cormorant Garamond', Georgia, serif`; const wW = x.measureText("World").width; x.restore();
  text("Live", -1.6 + (wW / H) * LEN * 1.02, 40, fs, "#b8914a", "italic 600");
  // pinstripe under the title + tagline
  x.fillStyle = goldC; x.fillRect(pu(25), py(2.9), Math.max(2, W / 700), py(-2.5) - py(2.9));
  text("UK-WL787", -5.6, 22, fs * 0.26, "rgba(19,32,58,.75)", "600");
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}
function rr(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }

function airliner() {
  const g = new THREE.Group();
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf7f6f2, metalness: 0.15, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 });
  const belly = new THREE.MeshStandardMaterial({ color: 0xd9dde3, metalness: 0.4, roughness: 0.4 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe2bb72, metalness: 0.85, roughness: 0.25 });
  const navy = new THREE.MeshPhysicalMaterial({ color: 0x14213d, metalness: 0.35, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0b1220, metalness: 0.9, roughness: 0.15 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });

  // fuselage: a lathe profile along the long axis (nose → tail), then laid along X
  const R = 1.3, prof = [];
  const P = [[0, 8.6], [0.45, 8.45], [0.85, 8.1], [1.12, 7.6], [1.27, 6.9], [R, 6], [R, -3.5], [1.2, -5], [0.95, -6.4], [0.6, -7.5], [0.3, -8.1], [0.05, -8.3]];
  for (const [r, y] of P) prof.push(new THREE.Vector2(r, y));
  // dense profile so the painted livery keeps its proportions; UVs measured in metres along the hull
  const dense = []; for (let j = 0; j < prof.length - 1; j++) { const a = prof[j], b = prof[j + 1], n = Math.max(1, Math.ceil(Math.abs(b.y - a.y) / 0.25)); for (let k = 0; k < n; k++) dense.push(new THREE.Vector2().lerpVectors(a, b, k / n)); }
  dense.push(prof[prof.length - 1]);
  const fg = new THREE.LatheGeometry(dense, 96, Math.PI, Math.PI * 2), uv = fg.attributes.uv, pp = fg.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - (8.6 - pp.getY(i)) / 16.9);
  const skin = new THREE.MeshPhysicalMaterial({ map: livery(!(innerWidth < 760 || matchMedia("(pointer: coarse)").matches)), metalness: 0.12, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 });
  const fus = new THREE.Mesh(fg, skin);
  fus.rotation.z = -Math.PI / 2; fus.castShadow = true; fus.receiveShadow = true; g.add(fus);
  // cockpit windows
  const cw = new THREE.Mesh(new THREE.SphereGeometry(1.02, 24, 12, -0.5, 1.0, 1.05, 0.32), dark);
  cw.rotation.z = -Math.PI / 2; cw.position.set(6.95, 0.12, 0); cw.scale.set(1, 1, 1.18); g.add(cw);
  // forward door (left side faces the camera at +z)
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.45, 0.04), new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.4, roughness: 0.4 }));
  doorFrame.position.set(5.0, 0.05, R - 0.005); g.add(doorFrame);
  const doorway = new THREE.Mesh(new THREE.BoxGeometry(0.66, 1.38, 0.05), new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffd9a0, emissiveIntensity: 0.9 }));
  doorway.position.set(5.0, 0.05, R - 0.02); doorway.visible = false; g.add(doorway);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.68, 1.4, 0.06), white);
  door.position.set(5.0, 0.05, R + 0.02); g.add(door);
  g.userData.door = door; g.userData.doorway = doorway;

  // wings (swept, low) + engines
  const ws = new THREE.Shape(); ws.moveTo(0, 0); ws.lineTo(-2.8, 7.6); ws.lineTo(-3.9, 7.7); ws.lineTo(-3.4, 0); ws.lineTo(0, 0);
  const wingGeo = new THREE.ExtrudeGeometry(ws, { depth: 0.16, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 });
  for (const side of [1, -1]) {
    const w = new THREE.Mesh(wingGeo, white); w.castShadow = true;
    w.rotation.x = side * Math.PI / 2; w.rotation.z = side * 0.06; w.position.set(1.6, -0.75, 0); if (side < 0) w.scale.y = 1;
    g.add(w);
    const wl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.08), gold); wl.position.set(-1.6, -0.35, side * 7.75); g.add(wl);
    const eng = new THREE.Group();
    const nac = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.47, 2.0, 32), white); nac.rotation.z = Math.PI / 2; nac.castShadow = true; eng.add(nac);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.05, 10, 32), gold); lip.rotation.y = Math.PI / 2; lip.position.x = 1.0; eng.add(lip);
    const fan = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), dark); fan.rotation.y = Math.PI / 2; fan.position.x = 0.97; eng.add(fan);
    const spin = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 16), navy); spin.rotation.z = -Math.PI / 2; spin.position.x = 1.08; eng.add(spin);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshBasicMaterial({ color: 0xffa860, transparent: true, opacity: 0 }));
    glow.rotation.y = -Math.PI / 2; glow.position.x = -1.01; eng.add(glow); g.userData.glows = [...(g.userData.glows || []), glow];
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.12), white); pylon.position.set(-0.1, 0.45, 0); eng.add(pylon);
    eng.position.set(0.5, -1.35, side * 2.9); g.add(eng);
  }
  // tail: fin + stabilisers + logo
  const fs = new THREE.Shape(); fs.moveTo(0, 0); fs.lineTo(-2.4, 3.3); fs.lineTo(-3.5, 3.35); fs.lineTo(-3.3, 0); fs.lineTo(0, 0);
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.14, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 }), navy);
  fin.position.set(-4.7, 0.85, -0.07); fin.castShadow = true; g.add(fin);
  const logoTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
    x.fillStyle = "#e2bb72"; x.beginPath(); x.arc(128, 128, 96, 0, 7); x.lineWidth = 10; x.strokeStyle = "#e2bb72"; x.stroke();
    x.font = "italic 600 92px Georgia, serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("W", 112, 124);
    x.font = "italic 600 64px Georgia, serif"; x.fillText("L", 162, 150);
    return new THREE.CanvasTexture(c);
  })();
  for (const side of [1, -1]) {
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true }));
    logo.position.set(-6.6, 2.55, side * 0.13); if (side < 0) logo.rotation.y = Math.PI; g.add(logo);
  }
  const ss = new THREE.Shape(); ss.moveTo(0, 0); ss.lineTo(-1.3, 2.7); ss.lineTo(-2.0, 2.7); ss.lineTo(-1.9, 0); ss.lineTo(0, 0);
  const stabGeo = new THREE.ExtrudeGeometry(ss, { depth: 0.08, bevelEnabled: false });
  for (const side of [1, -1]) { const st = new THREE.Mesh(stabGeo, white); st.rotation.x = side * Math.PI / 2; st.position.set(-5.9, 0.35, 0); g.add(st); }
  // landing gear
  const gear = (x, z, twin) => {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8), belly); strut.position.set(x, -1.6, z); g.add(strut);
    for (const dz of twin ? [-0.22, 0.22] : [0]) {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 20), rubber); wh.rotation.x = Math.PI / 2; wh.position.set(x, -2.0, z + dz); wh.castShadow = true; g.add(wh);
    }
  };
  gear(6.2, 0, true); gear(0.2, 1.1, true); gear(0.2, -1.1, true);
  g.position.y = 2.32; // wheels touch the ground
  const outer = new THREE.Group(); outer.add(g); outer.userData = g.userData; outer.scale.setScalar(1.45); // real proportions vs people
  return outer;
}

// ------------------------------------------------------------------ airstairs
function stairs(steps = 11, rise = 0.215, run = 0.3) {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xdfe3e8, metalness: 0.6, roughness: 0.35 });
  const tread = new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.8 });
  const truck = new THREE.MeshStandardMaterial({ color: 0xe9c98b, metalness: 0.3, roughness: 0.5 });
  for (let i = 0; i < steps; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, run), tread);
    s.position.set(0, (i + 1) * rise, -i * run); s.castShadow = s.receiveShadow = true; g.add(s);
  }
  const len = Math.hypot(steps * rise, steps * run), ang = Math.atan2(steps * rise, steps * run);
  for (const side of [-0.55, 0.55]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, len), metal);
    rail.position.set(side, steps * rise / 2 + 0.95, -(steps - 1) * run / 2); rail.rotation.x = ang; g.add(rail);
    const stringer = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, len), metal);
    stringer.position.set(side, steps * rise / 2, -(steps - 1) * run / 2); stringer.rotation.x = ang; g.add(stringer);
    for (let i = 0; i < steps; i += 3) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.95, 6), metal); post.position.set(side, (i + 1) * rise + 0.48, -i * run); g.add(post); }
  }
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, steps * run + 0.9), truck); base.position.set(0, 0.32, -(steps - 1) * run / 2 + 0.2); base.castShadow = true; g.add(base);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.07, 0.6), tread); top.position.set(0, (steps + 0.5) * rise, -steps * run - 0.15); g.add(top);
  g.userData = { steps, rise, run };
  return g;
}

// ------------------------------------------------------------------ traveller
function person({ girl, skin, hair, top, bottom, name }) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const M = (c, r = 0.6) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const S = M(skin, 0.55), H = M(hair, 0.45), T = M(top, 0.7), B = M(bottom, 0.75), shoe = M(0x1b1b1f, 0.5);
  const s = girl ? 0.93 : 1;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2 * s, 0.42 * s, 6, 14), T); torso.position.y = 1.12 * s; torso.castShadow = true; body.add(torso);
  if (girl) { const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.62, 20, 1, true), T); skirt.position.y = 0.78; skirt.castShadow = true; body.add(skirt); }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 10), S); neck.position.y = 1.47 * s; body.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17 * s, 22, 16), S); head.position.y = 1.64 * s; head.scale.set(1, 1.08, 1); head.castShadow = true; body.add(head);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.18 * s, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), H); cap.position.y = 1.66 * s; cap.rotation.x = -0.25; body.add(cap);
  if (girl) {
    const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.34, 4, 12), H); back.position.set(0, 1.42, -0.1); back.scale.set(1.2, 1, 0.6); body.add(back);
  }
  const limb = (len, rad, mat) => { const pivot = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(rad, len, 4, 10), mat); m.position.y = -len / 2 - rad; m.castShadow = true; pivot.add(m); return pivot; };
  const legs = [-1, 1].map((sd) => { const l = limb(0.52 * s, 0.075, girl ? S : B); l.position.set(sd * 0.1, 0.72 * s, 0);
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.22), shoe); f.position.set(0, -0.68 * s, 0.05); l.add(f); body.add(l); return l; });
  const arms = [-1, 1].map((sd) => { const a = limb(0.46 * s, 0.06, T); a.position.set(sd * 0.27 * s, 1.36 * s, 0);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), S); hand.position.y = -0.62 * s; a.add(hand); body.add(a); return a; });
  // floating name tag
  const tag = (() => {
    const c = document.createElement("canvas"); c.width = 512; c.height = 128; const x = c.getContext("2d");
    x.font = "600 64px Manrope, system-ui, sans-serif"; const w = Math.min(500, x.measureText(name).width + 70);
    x.fillStyle = "rgba(10,12,20,.62)"; x.beginPath(); x.roundRect ? x.roundRect((512 - w) / 2, 14, w, 100, 50) : x.rect((512 - w) / 2, 14, w, 100); x.fill();
    x.fillStyle = girl ? "#ffd6e6" : "#e9c98b"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(name, 256, 66);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    sp.scale.set(0.9, 0.225, 1); sp.position.y = 2.1; return sp;
  })();
  if (name) root.add(tag);
  root.userData = { body, legs, arms, girl, phase: girl ? Math.PI : 0 };
  return root;
}
function pose(p, walk, t, { wave = 0, holdSide = 0 } = {}) {
  const { legs, arms, body, phase } = p.userData, k = t * 7.5 + phase, a = Math.sin(k) * 0.55 * walk;
  legs[0].rotation.x = a; legs[1].rotation.x = -a;
  arms[0].rotation.x = -a * 0.8; arms[1].rotation.x = a * 0.8;
  body.position.y = Math.abs(Math.sin(k)) * 0.04 * walk;
  // the hand that holds the partner's hand stays reaching sideways
  if (holdSide) { const arm = arms[holdSide > 0 ? 1 : 0]; arm.rotation.x = -0.1; arm.rotation.z = holdSide * 0.35; }
  if (wave) { const arm = arms[1]; arm.rotation.z = 2.5 * wave; arm.rotation.x = Math.sin(t * 12) * 0.35 * wave; }
}

// ------------------------------------------------------------------ backdrop & apron
function apronTex() {
  const c = document.createElement("canvas"); c.width = c.height = 1024; const x = c.getContext("2d");
  x.fillStyle = "#3a3d44"; x.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},255,${Math.random() * 0.035})`; x.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2); }
  x.strokeStyle = "rgba(255,206,84,.85)"; x.lineWidth = 10; x.setLineDash([60, 40]); x.beginPath(); x.moveTo(0, 520); x.lineTo(1024, 520); x.stroke();
  x.setLineDash([]); x.strokeStyle = "rgba(255,255,255,.5)"; x.lineWidth = 6; for (const y of [300, 760]) { x.beginPath(); x.moveTo(0, y); x.lineTo(1024, y); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.anisotropy = 4; return t;
}
const SKY = {
  day: { top: "#5d9be0", bottom: "#f3d9b4", sun: 0xfff1dc, hemi: [0xbfdcff, 0x3b3125], exposure: 1.0 },
  golden: { top: "#3e5a8f", bottom: "#ffb36b", sun: 0xffc48a, hemi: [0xffd7a8, 0x2a2018], exposure: 1.05 },
  night: { top: "#060b1c", bottom: "#28345e", sun: 0x9bb4ff, hemi: [0x5d6fa8, 0x0b0c12], exposure: 0.95 },
};

// ------------------------------------------------------------------ real people (lazy assets)
// him.glb — Ready Player Me sample avatar · her.glb — Mixamo “Michelle” · anim.glb — Mixamo Walk/Idle clips
// (all three ship with the three.js examples; optimised for WorldLive: 1024px WebP textures + meshopt).
let ASSETS = null;
const loadScript = (src) => new Promise((ok, no) => {
  if (window.THREE_EX) return ok();
  const el = document.createElement("script"); el.src = src; el.onload = ok; el.onerror = no; document.head.append(el);
});
function loadPeople() {
  if (!ASSETS) {
    ASSETS = (async () => {
      await loadScript("/static/vendor/wl-3d.js");
      const { GLTFLoader, MeshoptDecoder } = window.THREE_EX;
      const ld = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      const [him, her, anim] = await Promise.all(["him", "her", "anim"].map((n) => ld.loadAsync(`/static/models/${n}.glb`)));
      // rest pose of the source rig, needed to retarget its rotations onto other skeletons
      const rest = {}; anim.scene.traverse((o) => (rest[o.name] = o.quaternion.clone()));
      // the source rig's true T-pose (its node rest is closer to an A-pose) — matches a T-posed target
      const restT = {}, tp = anim.animations.find((c) => c.name === "TPose");
      tp?.tracks.forEach((tr) => { if (tr.name.endsWith(".quaternion")) restT[tr.name.slice(0, -11)] = new THREE.Quaternion().fromArray(tr.values, 0); });
      return { him, her, clips: anim.animations, rest, restT, src: anim.scene, baked: {} };
    })();
    ASSETS.catch(() => (ASSETS = null));
  }
  return ASSETS;
}
/** warm the cache while the boarding pass is on screen */
export const preloadBoarding = () => { if (THREE && !matchMedia("(prefers-reduced-motion: reduce)").matches) loadPeople().catch(() => {}); };

function nameTag(name, girl) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 128; const x = c.getContext("2d");
  x.font = "600 60px Manrope, system-ui, sans-serif"; const w = Math.min(500, x.measureText(name).width + 70);
  x.fillStyle = "rgba(10,12,20,.55)"; x.beginPath(); x.roundRect ? x.roundRect((512 - w) / 2, 14, w, 100, 50) : x.rect((512 - w) / 2, 14, w, 100); x.fill();
  x.fillStyle = girl ? "#ffd6e6" : "#e9c98b"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(name, 256, 66);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  sp.scale.set(0.8, 0.2, 1); return sp;
}
/**
 * World-space retarget (rigs with different bone axes): for every frame,
 * targetWorld = sourceWorld · sourceRestWorld⁻¹ · targetRestWorld, then back to local space.
 */
function bakeRetarget(model, src, clip, fps = 30, restT = null) {
  const key = (n) => n.replace(/^mixamorig:?/, "");
  const wq = (o) => o.getWorldQuaternion(new THREE.Quaternion());
  const sBones = {}; src.traverse((o) => (sBones[key(o.name)] = o));
  const restS = new Map(); src.traverse((o) => restS.set(o, o.quaternion.clone()));
  // a T-posed target is matched against the source's own T-pose (its node rest is closer to an A-pose)
  if (restT) src.traverse((o) => { const q = restT[o.name]; if (q) o.quaternion.copy(q); });
  src.updateMatrixWorld(true); model.updateMatrixWorld(true);
  const tBones = []; model.traverse((o) => { if (o.isBone) tBones.push(o); });
  const WT = new Map(), WS = new Map(), localT = new Map();
  tBones.forEach((b) => { WT.set(b, wq(b)); localT.set(b, b.quaternion.clone()); const sb = sBones[key(b.name)]; if (sb) WS.set(b, wq(sb).invert()); });
  // align the two rigs' frames by their hips (the characters may face different axes)
  const hipT = tBones.find((b) => key(b.name) === "Hips"), hipS = sBones.Hips;
  const Rf = hipT && hipS ? wq(hipT).multiply(wq(hipS).invert()) : new THREE.Quaternion(), Ri = Rf.clone().invert();
  const mixer = new THREE.AnimationMixer(src); mixer.clipAction(clip).play();
  const n = Math.max(2, Math.round(clip.duration * fps) + 1), times = new Float32Array(n);
  const vals = new Map(tBones.map((b) => [b, new Float32Array(n * 4)]));
  for (let i = 0; i < n; i++) {
    const tt = (clip.duration * i) / (n - 1); times[i] = tt;
    mixer.setTime(tt); src.updateMatrixWorld(true);
    const world = new Map();
    for (const b of tBones) {
      const pw = world.get(b.parent) || wq(b.parent), sb = sBones[key(b.name)];
      const w = sb && WS.has(b) ? Rf.clone().multiply(wq(sb)).multiply(WS.get(b)).multiply(Ri).multiply(WT.get(b)) : pw.clone().multiply(localT.get(b));
      world.set(b, w);
      pw.clone().invert().multiply(w).toArray(vals.get(b), i * 4);
    }
  }
  mixer.stopAllAction(); mixer.uncacheRoot(src); restS.forEach((q, o) => o.quaternion.copy(q));
  return new THREE.AnimationClip(clip.name, clip.duration, tBones.map((b) => new THREE.QuaternionKeyframeTrack(`${b.name}.quaternion`, times, vals.get(b))));
}

// ---- wardrobe: he wears a black suit, she a white dress (recoloured in place, then a flowing skirt)
function recolourHer(tex) {
  const im = tex.image; if (!im?.width) return tex;
  const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const x = c.getContext("2d");
  x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i] / 255, g = p[i + 1] / 255, b = p[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = mx - mn;
    let hue = 0; if (s > 1e-3) hue = mx === r ? ((g - b) / s) % 6 : mx === g ? (b - r) / s + 2 : (r - g) / s + 4; hue = (hue * 60 + 360) % 360;
    if (hue > 38 && hue < 75 && s > 0.25 && l > 0.3) {            // yellow trousers → ivory silk
      const v = 0.82 + 0.18 * l; p[i] = 250 * v; p[i + 1] = 246 * v; p[i + 2] = 238 * v;
    } else if (s < 0.12 && l > 0.35) {                              // light top → white
      const v = 0.85 + 0.15 * l; p[i] = 252 * v; p[i + 1] = 250 * v; p[i + 2] = 246 * v;
    } else if (hue < 38 && s > 0.08 && l > 0.08 && l < 0.62) {     // skin → fair, keeping the shading
      const k = 0.62 + 0.38 * Math.min(1, l / 0.42); p[i] = 232 * k; p[i + 1] = 188 * k; p[i + 2] = 162 * k;   // fair, warm, keeps the shading
    }
  }
  x.putImageData(d, 0, 0);
  const t2 = new THREE.CanvasTexture(c); t2.flipY = tex.flipY; t2.colorSpace = THREE.SRGBColorSpace; t2.channel = tex.channel; return t2;
}
// a different, coordinated outfit for every traveller in a group (the first pair: black suit, white dress)
const SUITS = [0x111216, 0x1a2436, 0x2c2d31, 0x5a4a3a, 0x23302a, 0x3a2a2a];
const DRESSES = [0xfbf8f2, 0xead3c6, 0xd6dfcc, 0xead9b4, 0xd9dcea, 0xf1e4e4];
const HAIR = [0x1c140f, 0x2b1d14, 0x3a2617, 0x15100c, 0x4a3322, 0x22180f];
// Michelle's two hair buns are part of her body mesh: pull those vertices back onto the skull
// (measured in the head bone's own space) so the long loose hair can fall naturally over them
function tuckBuns(model) {
  model.traverse((o) => {
    if (!o.isSkinnedMesh || o.userData.tucked) return;
    const sk = o.skeleton, hi = sk.bones.findIndex((b) => /Head$/.test(b.name)); if (hi < 0) return;
    const g = o.geometry = o.geometry.clone(), P = g.attributes.position, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight;
    const toHead = new THREE.Matrix4().multiplyMatrices(sk.boneInverses[hi], o.bindMatrix), back = toHead.clone().invert();
    const v = new THREE.Vector3(), ids = [], loc = [];
    for (let i = 0; i < P.count; i++) {
      let w = 0; for (let c = 0; c < 4; c++) if (SI.getComponent(i, c) === hi) w += SW.getComponent(i, c);
      if (w < 0.6) continue;
      v.fromBufferAttribute(P, i).applyMatrix4(toHead); ids.push(i); loc.push(v.clone());
    }
    if (loc.length < 50) return;
    // skull as an ellipsoid (measured: the head is ~±9 units wide, buns/headphones reach ±27)
    const bb = new THREE.Box3().setFromPoints(loc), u = (bb.max.y - bb.min.y) / 34;   // 1 unit ≈ 1 cm on this rig
    const c = new THREE.Vector3(0, bb.min.y + 15 * u, -1.5 * u), R = new THREE.Vector3(8.6 * u, 12.5 * u, 11 * u);
    loc.forEach((x, n) => {
      if (Math.abs(x.x) < 9.6 * u || x.y < bb.min.y + 4 * u) return;
      const rel = x.clone().sub(c), e = Math.hypot(rel.x / R.x, rel.y / R.y, rel.z / R.z);
      if (e <= 1) return;
      rel.multiplyScalar(0.97 / e); P.setXYZ(ids[n], ...rel.add(c).applyMatrix4(back).toArray());
    });
    P.needsUpdate = true; g.computeVertexNormals(); o.userData.tucked = true;
  });
}
function dressUp(model, girl, look = 0) {
  const bones = {}; model.traverse((o) => (bones[o.name.replace(/^mixamorig:?/, "")] = o));
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.material = o.material.clone();
    const n = o.material.name || "";
    if (!girl) {
      if (/Outfit_Top|Outfit_Bottom/.test(n)) Object.assign(o.material, { map: null, color: new THREE.Color(SUITS[look % SUITS.length]), roughness: 0.62, metalness: 0.05 });
      if (/Footwear/.test(n)) Object.assign(o.material, { map: null, color: new THREE.Color(0x050506), roughness: 0.22, metalness: 0.3 });
      if (/Headwear|Beard/.test(n) || /Beard/.test(o.name)) o.visible = false;   // clean-shaven, no hat
      if (/Body/.test(n)) o.material.color = new THREE.Color(0xf3d0bd);
      o.material.needsUpdate = true;
    } else if (o.material.map) { o.material.map = recolourHer(o.material.map); o.material.needsUpdate = true; }
  });
  if (girl) tuckBuns(model);
  if (bones.Head) {
    model.updateMatrixWorld(true);
    const head = bones.Head, ws = head.getWorldScale(new THREE.Vector3()), hq = head.getWorldQuaternion(new THREE.Quaternion()).invert();
    // place a mesh on the head in world-space metres, whatever the bone's own axes / scale are
    const put = (mesh, x, y, z) => { mesh.scale.divide(ws); mesh.quaternion.premultiply(hq); mesh.position.copy(new THREE.Vector3(x, y, z).applyQuaternion(hq).divide(ws)); mesh.castShadow = true; head.add(mesh); return mesh; };
    const hairM = new THREE.MeshPhysicalMaterial({ color: girl ? [0x0f0b09, 0x3b2416, 0x1a120d, 0x5a3a22][look % 4] : [0x0d0a08, 0x1c140f, 0x2b1d14, 0x15100c][look % 4], roughness: 0.48, sheen: 1, sheenColor: new THREE.Color(girl ? 0x9a7050 : 0x4a3a30), sheenRoughness: 0.4, side: THREE.DoubleSide });
    if (!girl) {
      // a modern short cut: tight sides, a little volume swept up at the front
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.5), hairM);
      cap.scale.set(0.98, 0.78, 1.06); cap.rotation.x = -0.1; put(cap, 0, 0.118, -0.014);
      const quiff = new THREE.Mesh(new THREE.SphereGeometry(0.06, 32, 16), hairM);
      quiff.scale.set(1.2, 0.42, 0.75); quiff.rotation.x = 0.3; put(quiff, 0, 0.185, 0.03);
    } else {
      // long, loose hair falling over the shoulders and back
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.104, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM);
      cap.scale.set(1.04, 0.98, 1.1); cap.rotation.x = -0.1; put(cap, 0, 0.1, -0.012);
      const prof = [[0.104, 0.0], [0.112, -0.08], [0.118, -0.18], [0.13, -0.3], [0.14, -0.4], [0.128, -0.46]].map(([r, y]) => new THREE.Vector2(r, y));
      const fall = new THREE.Mesh(new THREE.LatheGeometry(prof, 40, Math.PI * 0.62, Math.PI * 1.76), hairM);
      fall.scale.set(1.02, 1, 0.92); put(fall, 0, 0.1, -0.022);
      // a soft fringe framing the face
      const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 12, -Math.PI * 0.42, Math.PI * 0.84, Math.PI * 0.12, Math.PI * 0.2), hairM);
      fringe.scale.set(1.08, 1.0, 1.16); put(fringe, 0, 0.098, -0.004);
    }
  }
  if (!girl && bones.Spine2) shirtFront(model, bones);
  if (girl && bones.Hips) {
    // a soft white gown from the waist to the ankles (A-line, room for a stride), swaying with the hips
    const prof = [[0.135, 0.06], [0.155, 0], [0.205, -0.18], [0.27, -0.42], [0.33, -0.66], [0.375, -0.84], [0.38, -0.865], [0.37, -0.875]].map(([r, y]) => new THREE.Vector2(r, y));
    const skirt = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), new THREE.MeshPhysicalMaterial({ color: DRESSES[look % DRESSES.length], roughness: 0.55, sheen: 1, sheenColor: new THREE.Color(0xffffff), sheenRoughness: 0.5, side: THREE.DoubleSide }));
    skirt.castShadow = true; skirt.name = "dress";
    const hip = bones.Hips, ws = hip.getWorldScale(new THREE.Vector3());
    skirt.scale.set(1 / ws.x, 1 / ws.y, 1.1 / ws.z);   // deeper front-to-back: a full stride stays inside the gown
    model.updateMatrixWorld(true);
    // keep the skirt upright in world space whatever the hip bone's own axes are
    const hq = hip.getWorldQuaternion(new THREE.Quaternion()).invert(); skirt.quaternion.copy(hq);
    skirt.position.set(0, 0.04 / ws.y, 0).applyQuaternion(hq);
    hip.add(skirt);
  }
  return bones;
}

// a crisp white shirt and a slim black tie in the V of the black jacket: found by ray-casting the suit's chest
function shirtFront(model, bones) {
  model.updateMatrixWorld(true);
  const sp = bones.Spine2, neck = bones.Neck || bones.Head;
  const top = neck.getWorldPosition(new THREE.Vector3()), mid = sp.getWorldPosition(new THREE.Vector3());
  const suit = []; model.traverse((o) => { if (o.isMesh && /Outfit_Top|Body/.test(o.material?.name || "")) suit.push(o); });
  const rc = new THREE.Raycaster(), hit = (y) => { rc.set(new THREE.Vector3(mid.x, y, mid.z + 1), new THREE.Vector3(0, 0, -1)); return rc.intersectObjects(suit, false)[0]?.point; };
  const hTop = hit(top.y - (top.y - mid.y) * 0.15), hLow = hit(mid.y - (top.y - mid.y) * 0.25);
  if (!hTop || !hLow) return;
  const hgt = hTop.y - hLow.y, wTop = hgt * 0.62;
  const shape = new THREE.Shape(); shape.moveTo(-wTop / 2, 0); shape.lineTo(wTop / 2, 0); shape.lineTo(0, -hgt); shape.closePath();
  const white = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color: 0xf7f7f4, roughness: 0.55 }));
  const tieS = new THREE.Shape(); const tw = wTop * 0.13;
  tieS.moveTo(-tw * 0.6, 0); tieS.lineTo(tw * 0.6, 0); tieS.lineTo(tw, -hgt * 0.75); tieS.lineTo(0, -hgt * 0.86); tieS.lineTo(-tw, -hgt * 0.75); tieS.closePath();
  const tie = new THREE.Mesh(new THREE.ShapeGeometry(tieS), new THREE.MeshStandardMaterial({ color: 0x0b0b0e, roughness: 0.35, metalness: 0.1 }));
  const g = new THREE.Group(); g.add(white); tie.position.z = 0.002; g.add(tie);
  g.position.set(mid.x, hTop.y, Math.max(hTop.z, hLow.z) + 0.006);
  // keep it in the spine's space so it follows breathing and walking
  const ws = sp.getWorldScale(new THREE.Vector3()), q = sp.getWorldQuaternion(new THREE.Quaternion()).invert();
  const local = sp.worldToLocal(g.position.clone());
  g.position.copy(local); g.quaternion.copy(q); g.scale.set(1 / ws.x, 1 / ws.y, 1 / ws.z);
  sp.add(g);
}

function realPerson(gltf, clips, height, name, girl, rest = {}, assets = null, look = 0) {
  const { SkeletonUtils } = window.THREE_EX;
  const model = SkeletonUtils.clone(gltf.scene);
  model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
  model.updateMatrixWorld(true);
  const rig = dressUp(model, girl, look);
  const box = new THREE.Box3().setFromObject(model, true), hg = box.max.y - box.min.y || 1;
  model.scale.multiplyScalar(height / hg); model.updateMatrixWorld(true);
  // a slimmer, more elegant silhouette (same height)
  model.scale.x *= girl ? 0.93 : 0.95; model.scale.z *= girl ? 0.93 : 0.95; model.updateMatrixWorld(true);
  box.setFromObject(model, true); model.position.y -= box.min.y;
  const root = new THREE.Group(); root.add(model);
  // retarget Mixamo clips: "mixamorigHips.quaternion" → whatever this rig calls its hips
  const bones = {}; model.traverse((o) => (bones[o.name] = o));
  // each key = restTarget · restSource⁻¹ · key — the motion is carried over as a change from rest,
  // so rigs whose bones rest at different orientations still walk naturally
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  const fit = (clip) => {
    const c = clip.clone();
    c.tracks = c.tracks.filter((tr) => {
      const dot = tr.name.lastIndexOf("."), src = tr.name.slice(0, dot), prop = tr.name.slice(dot + 1);
      let node = src; if (!bones[node]) node = node.replace(/^mixamorig:?/, "");
      if (!bones[node] || prop !== "quaternion") return false;
      const rs = rest[src], rt = bones[node].quaternion;
      if (rs) {
        const off = rt.clone().multiply(rs.clone().invert()), v = tr.values;
        for (let i = 0; i < v.length; i += 4) { qa.fromArray(v, i); qb.copy(off).multiply(qa).toArray(v, i); }
      }
      tr.name = `${node}.${prop}`; return true;
    });
    return c;
  };
  const mixer = new THREE.AnimationMixer(model);
  const clipFor = (nm) => {
    const c = clips.find((x) => x.name === nm);
    if (!assets) return fit(c);
    // both rigs: a world-space bake (rest-pose aware), so arms swing low and natural instead of flailing
    return (assets.baked[(girl ? "f:" : "m:") + nm] ||= bakeRetarget(model, assets.src, c)); // bone names are identical across clones
  };
  const walk = mixer.clipAction(clipFor("Walk")), idle = mixer.clipAction(clipFor("Idle"));
  walk.play(); idle.play(); idle.setEffectiveWeight(0);
  walk.time = (girl ? 0.45 : 0) + look * 0.13; // out of step, like real people
  if (name) { const tag = nameTag(name, girl); tag.position.y = height + 0.28; root.add(tag); }
  root.userData = { real: true, mixer, walk, idle, w: 1, bones: rig, girl, h: height };
  return root;
}
// two-bone CCD: pull one arm so its hand meets `target` (world space)
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
function reach(arm, fore, hand, target, weight = 1) {
  for (let it = 0; it < 12; it++) for (const b of [fore, arm]) {
    b.getWorldPosition(_v1); hand.getWorldPosition(_v2);
    const toE = _v2.sub(_v1).normalize(), toT = _v3.copy(target).sub(_v1).normalize();
    const q = _q1.setFromUnitVectors(toE, toT);
    if (weight < 1) q.slerp(_q2.identity(), 1 - weight);
    const bw = b.getWorldQuaternion(_q2.clone()), pw = b.parent.getWorldQuaternion(new THREE.Quaternion());
    b.quaternion.copy(pw.invert().multiply(q.multiply(bw)));
    b.updateMatrixWorld(true);
  }
}
/** the couple's inner hands find each other — called after both mixers have posed the bodies */
function holdHands(a, b, weight) {
  if (!a?.userData.real || !b?.userData.real || weight <= 0.01) return;
  a.updateMatrixWorld(true); b.updateMatrixWorld(true);
  const side = (p, other) => { const loc = p.worldToLocal(other.position.clone().add(new THREE.Vector3(0, 0, 0))); return loc.x > 0 ? "Left" : "Right"; };
  const sa = side(a, b), sb = side(b, a), A = a.userData.bones, B = b.userData.bones;
  if (!A[sa + "Hand"] || !B[sb + "Hand"]) return;
  const ha = A[sa + "Hand"].getWorldPosition(new THREE.Vector3()), hb = B[sb + "Hand"].getWorldPosition(new THREE.Vector3());
  // meet a little in front of the hips, at a relaxed height between them
  const mid = ha.add(hb).multiplyScalar(0.5);
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(a.quaternion).multiplyScalar(0.06);
  mid.y = Math.min(a.position.y, b.position.y) + 0.86; mid.add(fwd);
  const off = new THREE.Vector3().subVectors(b.position, a.position).setY(0).normalize().multiplyScalar(0.035);
  reach(A[sa + "Arm"], A[sa + "ForeArm"], A[sa + "Hand"], mid.clone().sub(off), weight);
  reach(B[sb + "Arm"], B[sb + "ForeArm"], B[sb + "Hand"], mid.clone().add(off), weight);
}

function animate(p, walking, dt, T) {
  const u = p.userData;
  if (!u.real) return pose(p, walking, T);
  u.w += ((walking ? 1 : 0) - u.w) * Math.min(1, dt * 4);   // smooth walk ↔ idle blend
  u.walk.setEffectiveWeight(u.w); u.idle.setEffectiveWeight(1 - u.w);
  u.mixer.update(dt);
  relaxArms(p);
}
/** a natural arm: the forearm follows the upper arm's swing with a soft ~15° bend, the hand stays by the thigh
 *  (the source clip's elbows are flexed for a different rig, which read as stiff, raised forearms) */
const _sh = new THREE.Vector3(), _el = new THREE.Vector3(), _hd = new THREE.Vector3(), _tg = new THREE.Vector3(), _fw = new THREE.Vector3(), _ax = new THREE.Vector3();
function relaxArms(p, weight = 1) {
  const B = p.userData.bones;
  if (!B || weight <= 0) return;
  p.updateMatrixWorld(true);
  _fw.set(0, 0, 1).applyQuaternion(p.getWorldQuaternion(new THREE.Quaternion()));
  for (const s of ["Left", "Right"]) {
    const arm = B[s + "Arm"], fore = B[s + "ForeArm"], hand = B[s + "Hand"];
    if (!arm || !fore || !hand) continue;
    // 1) keep the clip's forward/back swing but bring the arm in beside the body (no sideways flaring)
    arm.getWorldPosition(_sh); hand.getWorldPosition(_hd);
    const sL = p.worldToLocal(_sh.clone()), hL = p.worldToLocal(_hd.clone()), L = sL.distanceTo(hL);
    const out = Math.sign(sL.x || (s === "Left" ? 1 : -1)), maxOut = L * 0.16;
    const dx = (hL.x - sL.x) * out;
    if (dx > maxOut || dx < -0.02) {
      const z = Math.max(-L * 0.45, Math.min(L * 0.5, hL.z - sL.z)), x = Math.max(0, Math.min(maxOut, dx)) * out;
      const y = -Math.sqrt(Math.max(0, L * L * 0.97 - z * z - x * x));
      reach(arm, fore, hand, p.localToWorld(new THREE.Vector3(sL.x + x, sL.y + y, sL.z + z)), weight);
    }
    arm.getWorldPosition(_sh); fore.getWorldPosition(_el); hand.getWorldPosition(_hd);
    const len = _hd.distanceTo(_el), up = _tg.subVectors(_el, _sh).normalize();
    // continue the upper arm, then bend gently forward (elbows flex forward, never sideways)
    _tg.copy(up).multiplyScalar(len * 0.97).addScaledVector(_fw, len * 0.26).add(_el);
    const toE = _ax.subVectors(_hd, _el).normalize(), toT = _hd.subVectors(_tg, _el).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(toE, toT);
    if (weight < 1) q.slerp(new THREE.Quaternion(), 1 - weight);
    const bw = fore.getWorldQuaternion(new THREE.Quaternion()), pw = fore.parent.getWorldQuaternion(new THREE.Quaternion());
    fore.quaternion.copy(pw.invert().multiply(q.multiply(bw)));
    fore.updateMatrixWorld(true);
  }
}
export { relaxArms };

// ------------------------------------------------------------------ the airport around the plane
function airport(scene, tod) {
  const night = tod === "night", g = new THREE.Group(); scene.add(g);
  const M = (o) => new THREE.MeshStandardMaterial(o);
  // grass beyond the apron
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), M({ color: night ? 0x18241a : 0x6f8a4e, roughness: 1 }));
  grass.rotation.x = -Math.PI / 2; grass.position.y = -0.02; scene.add(grass);
  // terminal: glass curtain wall with mullions, lit concourse inside, white wing roof
  const facade = document.createElement("canvas"); facade.width = 1024; facade.height = 256; const fx = facade.getContext("2d");
  const fg = fx.createLinearGradient(0, 0, 0, 256); fg.addColorStop(0, night ? "#ffcf8a" : "#9fb6c9"); fg.addColorStop(1, night ? "#b5793d" : "#5f7489");
  fx.fillStyle = fg; fx.fillRect(0, 0, 1024, 256);
  if (night) for (let i = 0; i < 60; i++) { fx.fillStyle = `rgba(255,240,210,${0.2 + Math.random() * 0.5})`; fx.fillRect(Math.random() * 1024, 90 + Math.random() * 120, 6 + Math.random() * 20, 40); }
  else for (let i = 0; i < 40; i++) { fx.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`; fx.fillRect(Math.random() * 1024, 0, 30, 256); }
  fx.strokeStyle = "rgba(30,35,45,.85)"; fx.lineWidth = 4;
  for (let xx = 0; xx <= 1024; xx += 32) { fx.beginPath(); fx.moveTo(xx, 0); fx.lineTo(xx, 256); fx.stroke(); }
  for (const yy of [2, 128, 254]) { fx.beginPath(); fx.moveTo(0, yy); fx.lineTo(1024, yy); fx.stroke(); }
  const ftx = new THREE.CanvasTexture(facade); ftx.colorSpace = THREE.SRGBColorSpace; ftx.wrapS = THREE.RepeatWrapping; ftx.repeat.x = 3;
  const glass = new THREE.MeshPhysicalMaterial({ map: ftx, metalness: 0.6, roughness: 0.08, clearcoat: 1, emissive: night ? 0xffb060 : 0x000000, emissiveMap: night ? ftx : null, emissiveIntensity: night ? 0.9 : 0 });
  const term = new THREE.Mesh(new THREE.BoxGeometry(90, 9, 14), [M({ color: 0xd8dade }), M({ color: 0xd8dade }), M({ color: 0xe6e7ea }), M({ color: 0x9a9da3 }), glass, M({ color: 0xd8dade })]);
  term.position.set(-4, 4.5, -38); term.receiveShadow = true; g.add(term);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(96, 0.6, 20), M({ color: 0xf2f3f5, roughness: 0.4, metalness: 0.3 })); roof.position.set(-4, 9.3, -36.5); roof.castShadow = true; g.add(roof);
  // sign
  const sc = document.createElement("canvas"); sc.width = 1024; sc.height = 128; const sx = sc.getContext("2d");
  sx.fillStyle = "#14213d"; sx.fillRect(0, 0, 1024, 128); sx.fillStyle = "#e9c98b"; sx.font = "600 64px Manrope, system-ui, sans-serif"; sx.textAlign = "center"; sx.textBaseline = "middle";
  sx.fillText("WorldLive  International  ✈", 512, 66);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(22, 2.75), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), toneMapped: false }));
  sign.position.set(-4, 10.9, -30.9); g.add(sign);
  // jet bridges reaching out from the terminal
  for (const xx of [-30, 18]) {
    const jb = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 16), M({ color: 0xc8ccd2, metalness: 0.5, roughness: 0.4 })); jb.position.set(xx, 4.6, -23); jb.castShadow = true; g.add(jb);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3.4, 10), M({ color: 0x777b82 })); leg.position.set(xx, 1.7, -17); g.add(leg);
  }
  // control tower
  const tower = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 30, 24), M({ color: 0xe9e9ec, roughness: 0.6 })); shaft.position.y = 15; tower.add(shaft);
  const cab = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 3.2, 3.4, 24), new THREE.MeshPhysicalMaterial({ color: night ? 0x3a5f7a : 0x24435c, metalness: 0.7, roughness: 0.05, emissive: night ? 0x4fd1ff : 0, emissiveIntensity: night ? 0.35 : 0 }));
  cab.position.y = 31.7; tower.add(cab);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.6, 24), M({ color: 0xf2f2f4 })); cap.position.y = 33.7; tower.add(cap);
  tower.position.set(40, 0, -55); g.add(tower);
  // ground service: tug + baggage carts + cones
  const tug = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.4), M({ color: 0xf1c232, roughness: 0.5 })); body.position.y = 0.75; tug.add(body);
  const cabT = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1.3), M({ color: 0x2b2f36, metalness: 0.6, roughness: 0.2 })); cabT.position.set(-0.4, 1.55, 0); tug.add(cabT);
  for (let i = 0; i < 3; i++) {
    const cart = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.3), M({ color: 0x5b6470, metalness: 0.4, roughness: 0.5 })); cart.position.set(2.4 + i * 2.2, 0.85, 0); cart.castShadow = true; tug.add(cart);
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.4), M({ color: [0xb5423a, 0x2d5d8a, 0x2f2f2f][i] })); bag.position.set(2.4 + i * 2.2, 1.6, 0.2); tug.add(bag);
  }
  tug.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  tug.position.set(-10, 0, 4.5); tug.rotation.y = 0.15; g.add(tug);
  const coneM = M({ color: 0xff6a1a, roughness: 0.6 });
  for (const [cx, cz] of [[9.5, 1.5], [10.5, -4], [-17, 2.8], [-4, 5.5]]) { const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 16), coneM); cone.position.set(cx, 0.3, cz); cone.castShadow = true; g.add(cone); }
  // apron light masts + taxiway edge lights
  const lamps = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0x4d8dff, toneMapped: false }), 40);
  const mm = new THREE.Matrix4();
  for (let i = 0; i < 40; i++) { mm.makeTranslation(-60 + i * 3.2, 0.12, -14 + (i % 2) * -4); lamps.setMatrixAt(i, mm); }
  lamps.visible = night; g.add(lamps);
  for (const lx of [-26, 24]) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 18, 10), M({ color: 0x8a8e95 })); mast.position.set(lx, 9, -12); g.add(mast);
    const head = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.9), new THREE.MeshBasicMaterial({ color: night ? 0xffe2b0 : 0xbfc3c9, toneMapped: !night })); head.position.set(lx, 18.2, -12); g.add(head);
    if (night) { const pl = new THREE.SpotLight(0xffd59a, 900, 60, 0.7, 0.6, 2); pl.position.set(lx, 18, -12); pl.target.position.set(lx * 0.4, 0, 2); g.add(pl, pl.target); }
  }
  return g;
}

// ------------------------------------------------------------------ the show
/**
 * play("board" | "arrive", { city, a, b, tod }) → Promise that resolves when the scene ends or is skipped.
 */
export function playBoarding(mode, opts = {}) {
  if (!THREE || matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();
  // never let the cinematic block the trip: any failure just skips it
  return new Promise((resolve) => {
    show(mode, opts, resolve).catch((e) => { console.error("[boarding] " + (e?.stack || e)); document.querySelector(".board3d")?.remove(); resolve(); });
  });
}
async function show(mode, { city, a = "", b = "", tod = "golden", party = null } = {}, resolve) {
  {
    const mobile = innerWidth < 700, dpr = Math.min(devicePixelRatio || 1, mobile ? 1.75 : 2);
    const wrap = h(`<div class="board3d" role="dialog" aria-label="${mode === "board" ? t("b3Board") : t("b3Arrive")}">
      <canvas></canvas>
      <div class="b3-cap"><div class="eyebrow">${mode === "board" ? t("b3Board") : t("b3Arrive")}</div><div class="display">${city ? L(city.name) : ""}</div></div>
      <div class="b3-load"><i></i></div>
      <button class="btn btn-ghost b3-skip">${t("skip3d")} ›</button>
      <div class="b3-veil"></div></div>`);
    document.body.append(wrap);
    let skipped = false, done = false, raf;
    $(".b3-skip", wrap).onclick = () => { skipped = true; finish(); };
    // real characters: wait for them (up to 7 s), otherwise use the stylised fallback
    const assets = await Promise.race([loadPeople().catch(() => null), new Promise((r) => setTimeout(() => r(null), 7000))]);
    if (skipped) return;
    wrap.classList.add("ready");
    const cv = $("canvas", wrap);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: "high-performance" }); }
    catch { wrap.remove(); return resolve(); }
    renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const night = tod === "night" || tod === "evening";
    const sky = SKY[night ? "night" : tod === "golden" || tod === "sunset" || tod === "sunrise" ? "golden" : "day"];
    renderer.toneMappingExposure = sky.exposure;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    const scene = new THREE.Scene();
    const bg = document.createElement("canvas"); bg.width = 4; bg.height = 256; const bx = bg.getContext("2d");
    const gr = bx.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, sky.top); gr.addColorStop(1, sky.bottom); bx.fillStyle = gr; bx.fillRect(0, 0, 4, 256);
    const bgTex = new THREE.CanvasTexture(bg); bgTex.colorSpace = THREE.SRGBColorSpace; scene.background = bgTex;
    scene.fog = new THREE.Fog(new THREE.Color(sky.bottom), 50, 230);
    // image-based lighting: real reflections on paint, glass and skin
    if (window.THREE_EX?.RoomEnvironment) {
      const pm = new THREE.PMREMGenerator(renderer);
      scene.environment = pm.fromScene(new window.THREE_EX.RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = night ? 0.25 : 0.55; pm.dispose();
    }
    const cam = new THREE.PerspectiveCamera(mobile ? 52 : 36, innerWidth / innerHeight, 0.1, 400);

    scene.add(new THREE.HemisphereLight(sky.hemi[0], sky.hemi[1], night ? 0.9 : 1.2));
    const fill = new THREE.DirectionalLight(night ? 0x8ea4ff : 0xffffff, night ? 0.5 : 0.7); fill.position.set(25, 6, 30); scene.add(fill);
    const sun = new THREE.DirectionalLight(sky.sun, night ? 0.7 : 2.6);
    sun.position.set(18, 22, 14); sun.castShadow = true; sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, far: 80 }); scene.add(sun);
    if (night) { const doorLight = new THREE.PointLight(0xffd9a0, 8, 9); doorLight.position.set(1.5, 4, 2); scene.add(doorLight); }

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), new THREE.MeshStandardMaterial({ map: apronTex(), roughness: 0.9, metalness: 0.05 }));
    ground.rotation.x = -Math.PI / 2; ground.position.z = -10; ground.receiveShadow = true; scene.add(ground);
    airport(scene, night ? "night" : tod);
    const plane = airliner(); plane.position.set(-6, 0, -2.5); scene.add(plane); plane.updateMatrixWorld(true);
    plane.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const doorW = plane.userData.door.getWorldPosition(new THREE.Vector3());
    const sill = doorW.y - 0.7 * 1.45, rise0 = 0.2;
    const st = stairs(Math.round(sill / rise0 - 0.5), rise0); const { steps, rise, run } = st.userData;
    st.position.set(doorW.x, 0, doorW.z + steps * run + 0.45); scene.add(st);
    const topY = (steps + 0.5) * rise + 0.03;
    // a distant skyline and hills on the horizon, softened by the haze
    {
      const sk = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: night ? 0x1a2236 : 0x8d9aab, roughness: 1, emissive: night ? 0x2a2010 : 0, emissiveIntensity: 0.6 });
      const win = night ? new THREE.MeshBasicMaterial({ color: 0xffd28a }) : null;
      for (let i = 0; i < 70; i++) {
        const w = 3 + Math.random() * 6, hgt = 6 + Math.random() * Math.random() * 38, bld = new THREE.Mesh(new THREE.BoxGeometry(w, hgt, w), mat);
        bld.position.set(-140 + i * 4.2 + Math.random() * 2, hgt / 2, -115 - Math.random() * 25); sk.add(bld);
        if (win && Math.random() > 0.4) { const lit = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.6, hgt * 0.7), win); lit.position.set(bld.position.x, hgt * 0.45, bld.position.z + w / 2 + 0.05); lit.material.transparent = true; lit.material.opacity = 0.35; sk.add(lit); }
      }
      const hillM = new THREE.MeshStandardMaterial({ color: night ? 0x111a14 : 0x5f7a56, roughness: 1 });
      for (let i = 0; i < 7; i++) { const hl = new THREE.Mesh(new THREE.SphereGeometry(40 + Math.random() * 30, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hillM); hl.scale.y = 0.28; hl.position.set(-200 + i * 70, -2, -190 - Math.random() * 30); sk.add(hl); }
      scene.add(sk);
    }
    // the travel party: 1–8 people, each built from their name + gender, walking in pairs
    const HM = [1.82, 1.8, 1.84, 1.78], HF = [1.7, 1.67, 1.72, 1.66];
    const mk = (girl, name, look) => assets
      ? realPerson(girl ? assets.her : assets.him, assets.clips, (girl ? HF : HM)[look % 4], name, girl, assets.rest, assets, look)
      : person(girl ? { girl, skin: 0xf1d2bf, hair: 0x4a2a1a, top: DRESSES[look % 6], bottom: DRESSES[look % 6], name } : { girl, skin: 0xefcdb6, hair: 0x2a1a12, top: SUITS[look % 6], bottom: SUITS[look % 6], name });
    const crew = (Array.isArray(party) && party.length ? party : [{ name: a, g: "m" }, ...(b ? [{ name: b, g: "f" }] : [])]).slice(0, 8);
    let nm = 0, nf = 0;
    const people = crew.map((m) => { const girl = m.g === "f"; const p = mk(girl, m.name || "", girl ? nf++ : nm++); scene.add(p); return p; });
    const pairs = Math.ceil(people.length / 2), b2 = people.length > 1;
    // route — apron → foot of the stairs → top landing → through the door
    const foot = new THREE.Vector3(st.position.x, 0, st.position.z + 0.3);
    const topP = new THREE.Vector3(st.position.x, topY, st.position.z - steps * run - 0.1);
    const inside = new THREE.Vector3(doorW.x, topY, doorW.z - 0.8);
    const far = new THREE.Vector3(st.position.x + 5.5, 0, st.position.z + 4.2);
    const perp = new THREE.Vector3().subVectors(foot, far).setY(0).normalize(); perp.set(-perp.z, 0, perp.x);
    // the route as one polyline measured in metres: everyone keeps a real distance to the person ahead,
    // so nobody walks through anybody — pairs side by side on the apron, single file on the stairs and at the door
    const pts = [far, foot, topP, inside], segL = [far.distanceTo(foot), foot.distanceTo(topP), topP.distanceTo(inside)];
    const sFoot = segL[0], sTop = segL[0] + segL[1], LEN = sTop + segL[2];
    const outDir = new THREE.Vector3().subVectors(far, foot).normalize();
    const at = (d) => {
      if (d <= 0) return far.clone().addScaledVector(outDir, -d);   // further out on the apron
      for (let j = 0; j < 3; j++) { if (d <= segL[j] || j === 2) return new THREE.Vector3().lerpVectors(pts[j], pts[j + 1], Math.min(1, d / segL[j])); d -= segL[j]; }
    };
    const ROW = 1.25, FILE = 0.62, G = (pairs - 1) * ROW + (people.length > 1 ? FILE : 0) + 0.2;
    const Dv = LEN + G, HOLD = 0.12, MOVE = 1 - HOLD;
    const D = Math.max(mode === "board" ? 11 : 10, Dv / 1.3 / MOVE);           // ~1.3 m/s, a relaxed walk
    // distance the leader has covered from the start of their walk, with a short pause on the top landing
    const lead = (u) => {
      const dTop = (mode === "board" ? sTop : LEN - sTop), tTop = (dTop / Dv) * MOVE;
      const d = u < tTop ? (u / MOVE) * Dv : u < tTop + HOLD ? dTop : ((u - HOLD) / MOVE) * Dv;
      return mode === "board" ? d : LEN - d;
    };
    const prevS = people.map(() => null), moving = people.map(() => 1);
    const t0 = performance.now(); let last = t0; const holdW = people.map(() => 0);
    function finish() {
      if (done) return; done = true; cancelAnimationFrame(raf);
      wrap.classList.add("out");
      setTimeout(() => {
        if (renderer) {
          renderer.dispose();
          scene.traverse((o) => { if (o.userData?.real) return; o.geometry?.dispose(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => { if (!mm.userData?.shared) { mm.map?.dispose(); } mm.dispose?.(); }); });
        }
        wrap.remove(); resolve();
      }, 650);
    }
    const onResize = () => { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
    addEventListener("resize", onResize);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      const T = (now - t0) / 1000, k = Math.min(1, window.__b3k ?? clamp01(T / D));
      const sL = lead(k), sgn = mode === "board" ? -1 : 1, pausing = Math.abs(sL - sTop) < 0.01;
      const sPos = people.map((_, i) => {
        const row = Math.floor(i / 2), base = sL + sgn * row * ROW;
        if (i % 2 === 0) return base;
        // the partner falls in behind just before the stairs and steps back beside on the apron
        const sw = clamp01((base - (sFoot - 1.4)) / 1.2);
        return base + sgn * FILE * sw;
      });
      people.forEach((p, i) => {
        const si = sPos[i], pos = at(si), onStairs = si > sFoot - 0.05 && si < LEN + 0.5;
        const solo = i % 2 === 0 && i === people.length - 1;
        const pairD = i % 2 ? sPos[i - 1] : sPos[i + 1] ?? si;
        const side = solo || !b2 ? 0 : (1 - clamp01((Math.max(si, pairD) - (sFoot - 1.4)) / 1.2)) * (i % 2 ? 0.3 : -0.3);
        p.position.set(pos.x + perp.x * side, pos.y, pos.z + perp.z * side);
        const ds = prevS[i] == null ? 1 : Math.abs(si - prevS[i]); prevS[i] = si;
        moving[i] += ((ds > 1e-4 ? 1 : 0) - moving[i]) * Math.min(1, dt * 5);
        const ahead = at(si + (mode === "board" ? 0.15 : -0.15)), dir = new THREE.Vector3().subVectors(ahead, pos); dir.y = 0;
        const look = pausing && i === 0;   // the leader turns for a last look at the city
        const face = look ? Math.atan2(cam.position.x - p.position.x, cam.position.z - p.position.z) : dir.lengthSq() > 1e-6 ? Math.atan2(dir.x, dir.z) : p.rotation.y;
        p.rotation.y += ((face - p.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 6);
        if (p.userData.real) animate(p, moving[i], dt, T); else pose(p, moving[i], T, { wave: look ? 1 : 0 });
        p.visible = si < LEN - 0.05;
      });
      const blend = Math.min(1, ((now - (frame.prev || now)) / 1000) * 3); frame.prev = now;
      for (let i = 0; i + 1 < people.length; i += 2) {
        const pa = people[i], pb = people[i + 1];
        const together = pa.position.y < 0.03 && pb.position.y < 0.03 && pa.position.distanceTo(pb.position) < 0.75;
        holdW[i] += ((together ? 1 : 0) - holdW[i]) * blend;
        holdHands(pa, pb, holdW[i]);
      }
      // the door opens for boarding / arrival
      const near = sPos.some((x) => x > sTop - 2.2 && x < LEN - 0.05);
      const door = plane.userData.door; door.userData.o = (door.userData.o ?? (mode === "board" ? 0 : 1));
      door.userData.o += ((near ? 1 : 0) - door.userData.o) * Math.min(1, dt * 2.2);
      const open = door.userData.o * door.userData.o * (3 - 2 * door.userData.o);
      door.position.z = 1.32 + open * 0.25; door.position.x = 5.0 + open * 0.75; plane.userData.doorway.visible = open > 0.05;
      plane.userData.glows.forEach((g) => (g.material.opacity = open * 0.85));
      // camera: a slow cinematic dolly that keeps the couple, the stairs and the door in frame
      const e = ease(k), far2 = (mobile ? 1.5 : 1) * (1 + (pairs - 1) * 0.12);
      cam.position.set(st.position.x + lerp(9.5, 5.5, e) * far2, lerp(1.9, 3.3, e), st.position.z + lerp(11, 8, e) * far2);
      // follow the whole party: the camera drifts with their centre
      const vis = people.filter((p) => p.visible), focus = (vis.length ? vis : people).reduce((a, p) => a.add(p.position), new THREE.Vector3()).multiplyScalar(1 / Math.max(1, (vis.length ? vis : people).length));
      const drift = new THREE.Vector3().subVectors(focus, foot).setY(0).multiplyScalar(0.45);
      cam.position.add(drift);
      cam.lookAt(lerp(focus.x, st.position.x, 0.4) - 0.8, 1.5 + focus.y * 0.75, lerp(focus.z, st.position.z, 0.5) - 1.2);
      // after boarding: the door seals, the stairs roll away, and the aircraft takes off down the runway
      if (k >= 1 && mode === "board" && (window.__b3k == null || window.__b3k > 1)) {
        frame.tko ??= now;
        const s = (now - frame.tko) / 1000;
        if (s < 0.1) $(".b3-cap .eyebrow", wrap).textContent = "✈ " + t("takeoff");
        st.position.x = frame.stX ??= st.position.x; st.position.x = frame.stX + Math.max(0, s - 0.6) * 2.2;
        const roll = Math.max(0, s - 1.6), x = 0.5 * 9 * roll * roll, lift = Math.max(0, roll - 3.6);
        plane.position.x = -6 + x; plane.position.y = lift * lift * 2.4; plane.rotation.z = Math.min(0.2, lift * 0.22);
        const px = plane.position.x;
        cam.position.set(Math.max(px - 22, 6) * 0.35 + 6, 3.2 + plane.position.y * 0.25, 30 - Math.min(10, roll * 1.2));
        cam.lookAt(px + 4, 1.5 + plane.position.y, -2.5);
        renderer.render(scene, cam);
        if (s > 7.4) finish();
        return;
      }
      renderer.render(scene, cam);
      if (k >= 1) finish();
    };
    window.__b3 = { cam, people, plane, st, scene, real: !!assets, get hold() { return holdW[0]; } };
    frame();
    wrap.addEventListener("transitionend", () => removeEventListener("resize", onResize), { once: true });
  }
}

// shared with the 3D moments (moments.js)
export { loadPeople, reach, realPerson };
