// WorldLive — shared 3D moments with the travellers' own characters
//   • cafe      — at a terrace table in front of the place: coffee is sipped, the city's dish is served
//   • balloon   — Cappadocia at dawn: in the basket together, the burner roaring, dozens of balloons around
//   • paraglide — a tandem wing gliding over the landscape, the two of them hanging side by side
// The same moment opens on every device of the journey (main.js shares it through the journey state).
import { $, h } from "./core.js";
import { L, t } from "./i18n.js";
import { loadPeople, reach, realPerson } from "./boarding.js";

const THREE = window.THREE;
const HM = [1.82, 1.8, 1.84, 1.78], HF = [1.7, 1.67, 1.72, 1.66];
const ease = (x) => x * x * (3 - 2 * x);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export const PARAGLIDE = new Set(["cappadocia", "interlaken", "rio", "capetown", "dubai", "santorini", "iceland", "everest", "bali", "alaska", "sydney", "maldives"]);

// ------------------------------------------------------------------ posing (works on any rig: aims bones in world space)
function aim(bone, child, dir, w = 1) {
  if (!bone || !child) return;
  bone.updateMatrixWorld(true);
  const a = bone.getWorldPosition(V()), b = child.getWorldPosition(V());
  const cur = b.sub(a).normalize(), q = new THREE.Quaternion().setFromUnitVectors(cur, dir.clone().normalize());
  if (w < 1) q.slerp(new THREE.Quaternion(), 1 - w);
  const bw = bone.getWorldQuaternion(new THREE.Quaternion()), pw = bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  bone.quaternion.copy(pw.multiply(q.multiply(bw)));
  bone.updateMatrixWorld(true);
}
/** seated: thighs forward, shins down (relative to the person's facing) */
function sit(p, spread = 0.12) {
  const B = p.userData.bones, f = V(0, 0, 1).applyQuaternion(p.quaternion), r = V(1, 0, 0).applyQuaternion(p.quaternion);
  for (const [s, k] of [["Left", 1], ["Right", -1]]) {
    aim(B[s + "UpLeg"], B[s + "Leg"], f.clone().addScaledVector(r, k * spread).add(V(0, 0.05, 0)));
    aim(B[s + "Leg"], B[s + "Foot"], V(0, -1, 0).addScaledVector(f, 0.18));
  }
}
function person(assets, m, look) {
  const girl = m.g === "f";
  const p = realPerson(girl ? assets.her : assets.him, assets.clips, (girl ? HF : HM)[look % 4], m.name || "", girl, assets.rest, assets, look);
  const u = p.userData; u.walk.setEffectiveWeight(0); u.idle.setEffectiveWeight(1); u.w = 0; u.idle.time = look * 0.7;
  p.traverse((o) => { if (o.isSprite) o.visible = false; });   // no name tags inside a moment
  return p;
}
function photoTex(src, cb) {
  const ld = new THREE.TextureLoader(); ld.setCrossOrigin("anonymous");
  ld.load(src, (tx) => { tx.colorSpace = THREE.SRGBColorSpace; cb(tx); }, undefined, () => cb(null));
}
function canvasTex(w, hgt, draw) { const c = document.createElement("canvas"); c.width = w; c.height = hgt; draw(c.getContext("2d"), w, hgt); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; }

// ------------------------------------------------------------------ shell (renderer, caption, close)
async function stage({ title, sub, kind }) {
  const mobile = innerWidth < 700;
  const wrap = h(`<div class="board3d moment m-${kind}" role="dialog" aria-label="${title}">
    <canvas></canvas>
    <div class="b3-cap"><div class="eyebrow">${sub}</div><div class="display">${title}</div></div>
    <div class="b3-load"><i></i></div>
    <div class="m-note" data-note></div>
    <button class="btn btn-ghost b3-skip" data-close>${t("close")} ✕</button>
    <div class="b3-veil"></div></div>`);
  document.body.append(wrap);
  const assets = await Promise.race([loadPeople().catch(() => null), new Promise((r) => setTimeout(() => r(null), 9000))]);
  if (!assets || !wrap.isConnected) { wrap.remove(); return null; }
  wrap.classList.add("ready");
  const renderer = new THREE.WebGLRenderer({ canvas: $("canvas", wrap), antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.75 : 2)); renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  if (window.THREE_EX?.RoomEnvironment) { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new window.THREE_EX.RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5; pm.dispose(); }
  const cam = new THREE.PerspectiveCamera(mobile ? 50 : 38, innerWidth / innerHeight, 0.05, 2000);
  const onResize = () => { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
  addEventListener("resize", onResize);
  let raf, closed = false, onClose = () => {};
  const close = () => {
    if (closed) return; closed = true;
    wrap.classList.add("out"); removeEventListener("resize", onResize);
    setTimeout(() => {
      cancelAnimationFrame(raf); renderer.dispose();
      scene.traverse((o) => { if (o.userData?.real) return; o.geometry?.dispose(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => { mm.map?.dispose(); mm.dispose?.(); }); });
      wrap.remove(); onClose();
    }, 700);
  };
  $("[data-close]", wrap).onclick = close;
  addEventListener("keydown", function esc(e) { if (e.key === "Escape") { close(); removeEventListener("keydown", esc); } });
  const loop = (fn) => { let last = performance.now(); const T0 = last; const f = (now) => { if (closed) return; raf = requestAnimationFrame(f); const dt = Math.min(0.05, (now - last) / 1000); last = now; fn(dt, (now - T0) / 1000); renderer.render(scene, cam); }; raf = requestAnimationFrame(f); };
  return { wrap, renderer, scene, cam, assets, mobile, close, loop, note: (html) => { const n = $("[data-note]", wrap); n.innerHTML = html; n.classList.toggle("on", !!html); clearTimeout(n._t); n._t = setTimeout(() => n.classList.remove("on"), 7500); }, set onClose(f) { onClose = f; } };
}

// ------------------------------------------------------------------ ☕ cafe
export async function cafe({ city, place, party, dish, tod = "noon" }) {
  const S = await stage({ kind: "cafe", title: dish ? `${dish.emoji} ${L(dish.name)}` : t("cafeTitle"), sub: `☕ ${L(city.name)}${place ? " · " + L(place.names) : ""}` });
  if (!S) return;
  const { scene, cam, assets, mobile } = S;
  const night = tod === "night" || tod === "evening";
  // backdrop: the real place, large and slightly soft behind the terrace
  const back = new THREE.Mesh(new THREE.PlaneGeometry(36, 22), new THREE.MeshBasicMaterial({ color: night ? 0x6a6a80 : 0xffffff, toneMapped: false }));
  back.position.set(0, 6.5, -14); scene.add(back);
  photoTex((place?.photo || city.photo)?.src, (tx) => { if (tx) { back.material.map = tx; back.material.needsUpdate = true; const a = tx.image.width / tx.image.height; back.scale.x = Math.max(1, (a * 22) / 36); } });
  scene.background = new THREE.Color(night ? 0x0d0f18 : 0xdfe7ee);
  scene.fog = new THREE.Fog(scene.background, 12, 40);
  scene.add(new THREE.HemisphereLight(night ? 0x8090c0 : 0xffffff, night ? 0x2a2018 : 0x9a8a70, night ? 0.6 : 1.1));
  const sun = new THREE.DirectionalLight(night ? 0xffc890 : 0xfff2dc, night ? 0.6 : 2.2); sun.position.set(4, 8, 5); sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, far: 30 }); sun.shadow.bias = -0.0005; scene.add(sun);
  // terrace: warm stone floor, marble table, bistro chairs, a parasol (day) or string lights (night)
  const floorTx = canvasTex(512, 512, (x, w) => { x.fillStyle = "#c9b9a0"; x.fillRect(0, 0, w, w); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = `hsl(35,${18 + Math.random() * 8}%,${62 + Math.random() * 8}%)`; x.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); } });
  floorTx.wrapS = floorTx.wrapT = THREE.RepeatWrapping; floorTx.repeat.set(6, 6);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ map: floorTx, roughness: 0.85 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const crew = (party?.length ? party : [{ name: "", g: "m" }, { name: "", g: "f" }]).slice(0, 4), n = crew.length;
  const R = n > 2 ? 0.55 : 0.42, tableY = 0.75;
  const marble = new THREE.MeshPhysicalMaterial({ color: 0xf4f1ec, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.12 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xb8914a, metalness: 0.9, roughness: 0.3 });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.035, 48), marble); top.position.y = tableY; top.castShadow = top.receiveShadow = true; scene.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, tableY, 16), brass); leg.position.y = tableY / 2; scene.add(leg);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.03, 32), brass); foot.position.y = 0.015; scene.add(foot);
  if (!night) {
    const para = new THREE.Mesh(new THREE.ConeGeometry(1.9, 0.5, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0xf3ead8, roughness: 0.9, side: THREE.DoubleSide }));
    para.position.set(0, 2.55, -1.15); para.castShadow = true; scene.add(para);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.5, 8), brass); pole.position.set(0, 1.3, -1.15); scene.add(pole);
    const potM = new THREE.MeshStandardMaterial({ color: 0x8a5a3a, roughness: 0.9 }), leafM = new THREE.MeshStandardMaterial({ color: 0x3f6b3a, roughness: 0.8 });
    for (const x of [-1.6, 1.6]) { const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.45, 20), potM); pot.position.set(x, 0.22, -1.3); scene.add(pot); const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 2), leafM); bush.position.set(x, 0.85, -1.3); bush.scale.y = 1.25; bush.castShadow = true; scene.add(bush); }
  } else {
    const bulbM = new THREE.MeshBasicMaterial({ color: 0xffd08a, toneMapped: false });
    for (let i = 0; i < 22; i++) { const x = -3.5 + i / 3; const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), bulbM); b.position.set(x, 2.6 - 0.25 * Math.sin((i / 21) * Math.PI * 3) ** 2, -1.2); scene.add(b); }
    const warm = new THREE.PointLight(0xffc27a, 6, 6); warm.position.set(0, 2.2, 0.3); scene.add(warm);
    const candle = new THREE.PointLight(0xffa860, 1.2, 1.6); candle.position.set(0, tableY + 0.15, 0); scene.add(candle); S.candle = candle;
  }
  // a cup and saucer in front of everyone, the dish in the middle
  const cupM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, clearcoat: 1 });
  const coffee = new THREE.MeshStandardMaterial({ color: 0x3a2013, roughness: 0.3 });
  const mkCup = () => {
    const g = new THREE.Group();
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.032, 0.075, 28, 1, true), cupM); c.position.y = 0.04; g.add(c);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.032, 24), cupM); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.003; g.add(bottom);
    const liquid = new THREE.Mesh(new THREE.CircleGeometry(0.039, 24), coffee); liquid.rotation.x = -Math.PI / 2; liquid.position.y = 0.065; g.add(liquid);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.005, 8, 16, Math.PI), cupM); handle.position.set(0.045, 0.045, 0); handle.rotation.z = -Math.PI / 2; g.add(handle);
    g.traverse((o) => (o.castShadow = true)); return g;
  };
  const steamTx = canvasTex(64, 128, (x) => { const g = x.createRadialGradient(32, 64, 2, 32, 64, 30); g.addColorStop(0, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 128); });
  if (dish) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.015, 40), cupM); plate.position.set(0, tableY + 0.025, 0); plate.castShadow = true; scene.add(plate);
    const food = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(256, 256, (x) => { x.font = "200px serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(dish.emoji, 128, 140); }), transparent: true }));
    food.scale.set(0.2, 0.2, 1); food.position.set(0, tableY + 0.11, 0); scene.add(food);
  }
  const people = [], cups = [], steams = [];
  let nm = 0, nf = 0;
  crew.forEach((m, i) => {
    const ang = n === 2 ? (i ? Math.PI : 0) : (i / n) * Math.PI * 2 - Math.PI / 2;
    const seat = V(Math.cos(ang) * (R + 0.42), 0, Math.sin(ang) * (R + 0.42));
    const chair = new THREE.Group();
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.03, 32), new THREE.MeshStandardMaterial({ color: 0x2a2320, roughness: 0.6 })); s.position.y = 0.46; chair.add(s);
    const back = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 8, 32, Math.PI), brass); back.position.set(0, 0.72, -0.19); chair.add(back);
    for (const [x, z] of [[0.14, 0.14], [-0.14, 0.14], [0.14, -0.14], [-0.14, -0.14]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.46, 8), brass); l.position.set(x, 0.23, z); chair.add(l); }
    chair.traverse((o) => (o.castShadow = true));
    chair.position.copy(seat); chair.lookAt(0, 0, 0); scene.add(chair);
    const girl = m.g === "f", p = person(assets, m, girl ? nf++ : nm++);
    p.position.copy(seat); p.lookAt(0, 0, 0); scene.add(p);
    p.updateMatrixWorld(true);
    const hip = p.userData.bones.Hips.getWorldPosition(V());
    p.userData.drop = hip.y - 0.56;   // lower the body so the hips rest on the seat
    p.userData.phase = i * 3.1 + Math.random();
    const toC = V().sub(seat).setY(0).normalize(), side = V(-toC.z, 0, toC.x);
    const cupAt = seat.clone().addScaledVector(toC, 0.5).addScaledVector(side, -0.07); cupAt.y = tableY + 0.02;
    const cup = mkCup(); cup.position.copy(cupAt); scene.add(cup);
    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.01, 32), cupM); saucer.position.copy(cupAt).setY(tableY + 0.022); scene.add(saucer);
    const st = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTx, transparent: true, depthWrite: false, opacity: 0.5 })); st.scale.set(0.08, 0.16, 1); scene.add(st);
    people.push(p); cups.push({ cup, rest: cupAt.clone(), toC, side }); steams.push(st);
  });
  S.note(dish ? `<b>${dish.emoji} ${L(dish.name)}</b><span>${L(dish.text)}</span>` : `<b>☕ ${t("cafeTitle")}</b><span>${t("cafeHint")}</span>`);
  const mid = V(0, 1.05, 0);
  S.loop((dt, T) => {
    people.forEach((p, i) => {
      const u = p.userData; u.mixer.update(dt);
      p.position.y = -u.drop; p.updateMatrixWorld(true);
      sit(p);
      const B = u.bones, c = cups[i];
      // a sip every ~8 s: the right hand lifts the cup to the lips, then back to the saucer
      const ph = ((T + u.phase) % 8) / 8, s = ph < 0.35 ? Math.sin((ph / 0.35) * Math.PI) : 0, k = ease(Math.min(1, s * 1.6));
      const head = B.Head.getWorldPosition(V()), mouth = head.addScaledVector(c.toC, 0.1).add(V(0, -0.08, 0));
      const hand = c.rest.clone().add(V(0, 0.05, 0)).lerp(mouth, k);
      reach(B.RightArm, B.RightForeArm, B.RightHand, hand.clone().addScaledVector(c.side, -0.02), 1);
      c.cup.position.copy(hand).add(V(0, -0.05, 0)); c.cup.rotation.z = -k * 0.6 * (c.side.x >= 0 ? 1 : -1);
      // the other hand rests on the table
      const rest = p.position.clone().setY(tableY + 0.03).addScaledVector(c.toC, 0.36).addScaledVector(c.side, 0.16);
      reach(B.LeftArm, B.LeftForeArm, B.LeftHand, rest, 0.9);
      steams[i].position.copy(c.cup.position).add(V(0, 0.15 + Math.sin(T * 2 + i) * 0.01, 0)); steams[i].material.opacity = (1 - k) * (0.35 + 0.15 * Math.sin(T * 3 + i));
    });
    if (S.candle) S.candle.intensity = 1.1 + Math.sin(T * 13) * 0.12 + Math.sin(T * 7.3) * 0.08;
    // a slow, intimate dolly around the table
    const a = Math.sin(T * 0.1) * 0.28, d = mobile ? 3.6 : 2.9;
    cam.position.set(Math.sin(a) * d, 1.5 + Math.sin(T * 0.2) * 0.05, Math.cos(a) * d);
    cam.lookAt(mid);
  });
  return S;
}

// ------------------------------------------------------------------ 🎈 balloon over Cappadocia
function envelopeTex(c1, c2) {
  return canvasTex(512, 256, (x, w, hh) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? c1 : c2; x.fillRect((i * w) / 16, 0, w / 16 + 1, hh); } x.fillStyle = "rgba(255,255,255,.12)"; x.fillRect(0, hh * 0.18, w, 6); x.fillRect(0, hh * 0.55, w, 4); });
}
function envelope(c1, c2, scale = 1) {
  const prof = [];
  for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI; prof.push(new THREE.Vector2(Math.max(0.12, Math.sin(a) * (a < Math.PI / 2 ? 1 : 0.55 + 0.45 * Math.sin(a))) * 4.2, -Math.cos(a) * 5.2 + (a > Math.PI * 0.6 ? -(a - Math.PI * 0.6) * 1.6 : 0))); }
  prof.reverse();
  const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), new THREE.MeshStandardMaterial({ map: envelopeTex(c1, c2), roughness: 0.75, side: THREE.DoubleSide }));
  m.scale.setScalar(scale); return m;
}
export async function balloon({ city, party }) {
  const S = await stage({ kind: "balloon", title: t("balloonTitle"), sub: `🎈 ${L(city.name)} · ${t("dawn")}` });
  if (!S) return;
  const { scene, cam, assets, mobile } = S;
  scene.background = new THREE.Color(0xf3c9a0);
  scene.fog = new THREE.Fog(0xf0c4a0, 60, 520);
  // the real valley at dawn wraps around the horizon
  const pano = new THREE.Mesh(new THREE.CylinderGeometry(420, 420, 300, 96, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide, toneMapped: false, fog: false }));
  pano.position.y = 40; scene.add(pano);
  photoTex("/static/img/scenes/cappadocia.jpg", (tx) => { if (tx) { tx.wrapS = THREE.MirroredRepeatWrapping; tx.repeat.x = 4; pano.material.map = tx; pano.material.needsUpdate = true; } });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(420, 48), new THREE.MeshBasicMaterial({ color: 0xb59a7e, fog: true })); ground.rotation.x = -Math.PI / 2; ground.position.y = -110; scene.add(ground);
  scene.add(new THREE.HemisphereLight(0xffe2c4, 0x8a6a50, 1.15));
  const sun = new THREE.DirectionalLight(0xffc690, 2.4); sun.position.set(-30, 18, -40); scene.add(sun);
  // our balloon
  const rig = new THREE.Group(); scene.add(rig);
  const env = envelope("#c8323a", "#f1c84b"); env.position.y = 9.6; rig.add(env);
  const wick = canvasTex(256, 128, (x, w, hh) => { x.fillStyle = "#8a5a2e"; x.fillRect(0, 0, w, hh); for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(${60 + Math.random() * 40},${35 + Math.random() * 20},15,.6)`; x.beginPath(); x.moveTo(0, i * 3.2); x.lineTo(w, i * 3.2 + 2); x.stroke(); } for (let i = 0; i < 32; i++) { x.strokeStyle = "rgba(40,22,8,.5)"; x.beginPath(); x.moveTo(i * 8, 0); x.lineTo(i * 8, hh); x.stroke(); } });
  const crew = (party?.length ? party : [{ name: "", g: "m" }, { name: "", g: "f" }]).slice(0, 4);
  const bw = crew.length > 2 ? 1.6 : 1.25;
  const basket = new THREE.Mesh(new THREE.BoxGeometry(bw, 1.05, 1.15, 1, 1, 1), new THREE.MeshStandardMaterial({ map: wick, roughness: 0.95 }));
  basket.position.y = 0.52; rig.add(basket);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.08, 0.08, 1.23), new THREE.MeshStandardMaterial({ color: 0x5a3a1c, roughness: 0.8 })); rim.position.y = 1.07; rig.add(rim);
  const ropeM = new THREE.LineBasicMaterial({ color: 0x3a2a1a });
  const ropes = new THREE.BufferGeometry().setFromPoints([[1, 1], [-1, 1], [1, -1], [-1, -1]].flatMap(([sx, sz]) => [V(sx * bw / 2, 1.07, sz * 0.58), V(sx * 1.2, 4.8, sz * 1.2)]));
  rig.add(new THREE.LineSegments(ropes, ropeM));
  const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 0.9, roughness: 0.25 })); burner.position.y = 3.6; rig.add(burner);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.1, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  flame.position.y = 4.35; rig.add(flame);
  const glow = new THREE.PointLight(0xffa040, 0, 14); glow.position.y = 4.4; rig.add(glow);
  let nm = 0, nf = 0;
  const people = crew.map((m, i) => {
    const girl = m.g === "f", p = person(assets, m, girl ? nf++ : nm++);
    p.position.set((i - (crew.length - 1) / 2) * (bw / crew.length) * 0.95, 0.06, 0.12); p.rotation.y = (i % 2 ? -0.25 : 0.25) * (crew.length > 1 ? 1 : 0);
    rig.add(p); return p;
  });
  // the sky full of balloons: dozens at different distances, drifting and rising slowly
  const colors = [["#2f6fb0", "#f2f2f2"], ["#e2504a", "#ffd23f"], ["#1f8a70", "#f6e7c1"], ["#7b4fa0", "#f0c674"], ["#f08a24", "#2b3a67"], ["#d64161", "#ffffff"], ["#3caea3", "#f6d55c"], ["#20639b", "#ed553b"]];
  const flock = [];
  for (let i = 0; i < (mobile ? 22 : 36); i++) {
    const [c1, c2] = colors[i % colors.length];
    const b = new THREE.Group(); const e = envelope(c1, c2, 1); e.position.y = 9.6; b.add(e);
    const bk = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1, 1.2), new THREE.MeshStandardMaterial({ color: 0x6a4424 })); bk.position.y = 0.5; b.add(bk);
    const ang = Math.PI * 0.15 + Math.random() * Math.PI * 0.7, dist = 40 + Math.random() * 260;
    b.position.set(Math.cos(ang) * dist * (Math.random() > 0.5 ? 1 : -1) * 0.9, -40 + Math.random() * 90, -Math.sin(ang) * dist - 20);
    b.userData = { vy: 0.15 + Math.random() * 0.35, vx: (Math.random() - 0.5) * 0.4, ph: Math.random() * 6 };
    scene.add(b); flock.push(b);
  }
  S.note(`<b>🎈 ${t("balloonTitle")}</b><span>${t("balloonHint")}</span><small class="m-credit">📷 MusikAnimal · CC BY-SA 4.0 · Wikimedia Commons</small>`);
  let burn = 0;
  S.wrap.addEventListener("pointerdown", (e) => { if (!e.target.closest("button")) burn = 1.4; });
  S.loop((dt, T) => {
    people.forEach((p) => p.userData.mixer.update(dt));
    if (people.length > 1) people.forEach((p, i) => { const B = p.userData.bones; const r = p.position.clone(); r.y = 1.12; r.z += 0.45; rig.localToWorld(r); reach(B.RightArm, B.RightForeArm, B.RightHand, r.add(V(0.1 * (i ? -1 : 1), 0, 0)), 0.85); reach(B.LeftArm, B.LeftForeArm, B.LeftHand, r.add(V(-0.25 * (i ? -1 : 1), 0, 0)), 0.85); });
    // the burner roars every few seconds (or when you tap)
    const auto = (T % 6) < 1.1 ? 1 : 0; burn = Math.max(0, burn - dt);
    const on = Math.max(auto, burn > 0 ? 1 : 0);
    flame.scale.set(1, on ? 1 + Math.sin(T * 40) * 0.12 : 0.05, 1); flame.material.opacity = on ? 0.9 : 0;
    glow.intensity += ((on ? 60 : 0) - glow.intensity) * Math.min(1, dt * 8);
    rig.position.y = Math.min(60, T * 1.4) + Math.sin(T * 0.5) * 0.3; rig.rotation.y = T * 0.02;
    flock.forEach((b) => { const u = b.userData; b.position.y += u.vy * dt; b.position.x += u.vx * dt; b.rotation.y += dt * 0.03; b.position.y += Math.sin(T * 0.4 + u.ph) * 0.005; });
    // camera: just outside the basket, slowly circling — the couple, the envelope and the sky of balloons
    const a = 0.5 + T * 0.035, d = mobile ? 10 : 8.2;
    cam.position.set(rig.position.x + Math.sin(a) * d, rig.position.y + 1.7 + Math.sin(T * 0.15) * 0.3, rig.position.z + Math.cos(a) * d);
    cam.lookAt(rig.position.x, rig.position.y + 3.1, rig.position.z);
  });
  return S;
}

// ------------------------------------------------------------------ 🪂 tandem paragliding
export async function paraglide({ city, place, party }) {
  const S = await stage({ kind: "para", title: t("paraTitle"), sub: `🪂 ${L(city.name)}` });
  if (!S) return;
  const { scene, cam, assets, mobile } = S;
  scene.background = new THREE.Color(0x9cc4e8);
  const pano = new THREE.Mesh(new THREE.CylinderGeometry(300, 300, 220, 96, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide, toneMapped: false }));
  pano.position.y = -30; scene.add(pano);
  const src = city.key === "cappadocia" ? "/static/img/scenes/cappadocia.jpg" : (city.photo || place?.photo)?.src;
  photoTex(src, (tx) => { if (tx) { tx.wrapS = THREE.MirroredRepeatWrapping; tx.repeat.x = 4; pano.material.map = tx; pano.material.needsUpdate = true; } });
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a7a60, 1.2));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.2); sun.position.set(10, 30, 10); scene.add(sun);
  const crew = (party?.length ? party : [{ name: "", g: "m" }, { name: "", g: "f" }]).slice(0, 2);
  const rig = new THREE.Group(); scene.add(rig);
  // the wing: a curved, cell-striped canopy
  const wingTx = canvasTex(512, 64, (x, w, hh) => { for (let i = 0; i < 32; i++) { x.fillStyle = i % 8 < 4 ? (i % 2 ? "#f2b632" : "#f5c94f") : (i % 2 ? "#1d3557" : "#274472"); x.fillRect((i * w) / 32, 0, w / 32 + 1, hh); } x.fillStyle = "#fff"; x.font = "600 28px Manrope, sans-serif"; x.textAlign = "center"; x.fillText("WorldLive", w / 2, 42); });
  const WR = 5.4, WB = 2.6, SPAN = 1.05;
  const wg = new THREE.PlaneGeometry(1.9, 2 * SPAN, 8, 40), pa = wg.attributes.position;
  for (let i = 0; i < pa.count; i++) { const cx = pa.getX(i), s = pa.getY(i), camber = 0.16 * Math.cos((cx / 0.95) * Math.PI / 2); pa.setXYZ(i, cx, WB + (WR + camber) * Math.cos(s), (WR + camber) * Math.sin(s)); }
  wg.computeVertexNormals();
  const wing = new THREE.Mesh(wg, new THREE.MeshStandardMaterial({ map: wingTx, roughness: 0.7, side: THREE.DoubleSide }));
  wingTx.center.set(0.5, 0.5); wingTx.rotation = Math.PI / 2;
  const wingG = new THREE.Group(); wingG.add(wing); rig.add(wingG);
  const lines = []; for (let i = -6; i <= 6; i++) { const a = (i / 6) * SPAN; lines.push(V(0, 1.9, 0), V(0, WB + WR * Math.cos(a), WR * Math.sin(a))); }
  rig.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lines), new THREE.LineBasicMaterial({ color: 0x334, transparent: true, opacity: 0.6 })));
  const harnessM = new THREE.MeshStandardMaterial({ color: 0x23262d, roughness: 0.7 });
  let nm = 0, nf = 0;
  const people = crew.map((m, i) => {
    const girl = m.g === "f", p = person(assets, m, girl ? nf++ : nm++);
    p.rotation.y = Math.PI / 2;           // flying along +x
    p.position.set(i ? -0.55 : 0.05, 0, i ? 0 : 0);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.42), harnessM); seat.position.set(p.position.x - 0.05, 0.52, 0); rig.add(seat);
    rig.add(p); return p;
  });
  S.note(`<b>🪂 ${t("paraTitle")}</b><span>${t("paraHint")}</span>`);
  S.loop((dt, T) => {
    people.forEach((p, i) => {
      const u = p.userData; u.mixer.update(dt);
      p.position.y = -(u.drop ??= (p.updateMatrixWorld(true), u.bones.Hips.getWorldPosition(V()).y - rig.position.y - 0.6)); p.updateMatrixWorld(true);
      sit(p, 0.1);
      const B = u.bones, h0 = B.Head.getWorldPosition(V());
      // hands on the risers / arms opened to the sky
      const open = (Math.sin(T * 0.35 + i) + 1) / 2;
      reach(B.RightArm, B.RightForeArm, B.RightHand, h0.clone().add(V(0.05, 0.15 + open * 0.25, -0.32 - open * 0.25)), 0.9);
      reach(B.LeftArm, B.LeftForeArm, B.LeftHand, h0.clone().add(V(0.05, 0.15 + open * 0.25, 0.32 + open * 0.25)), 0.9);
    });
    rig.position.set(T * 2.4, 40 - T * 0.25 + Math.sin(T * 0.6) * 0.4, Math.sin(T * 0.15) * 3);
    rig.rotation.x = Math.sin(T * 0.6) * 0.04; rig.rotation.z = Math.sin(T * 0.3) * 0.06;
    pano.position.x = rig.position.x * 0.9;   // the far landscape barely moves: you're high up
    const a = Math.PI * 0.62 + Math.sin(T * 0.1) * 0.5, d = mobile ? 10.5 : 8.5;
    cam.position.set(rig.position.x + Math.cos(a) * d, rig.position.y + 1.8, rig.position.z + Math.sin(a) * d);
    cam.lookAt(rig.position.x, rig.position.y + 2.9, rig.position.z);
  });
  return S;
}
